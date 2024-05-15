pipeline {
    agent any
    
    stages {
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: ''
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    try {
                        sh 'sudo -S apt update < /dev/null'
                        sh 'sudo -S apt install -y npm < /dev/null'

                        // Navigate to the directory containing package.json (assuming it's in workspace)
                        dir("${WORKSPACE}") {
                            // Run npm test
                            sh 'npm test'
                        }
                    } catch (err) {
                        echo "Error occurred during testing: ${err}"
                        currentBuild.result = 'FAILURE'
                    }
                }
            }
        }
        // Added Build Stage
        stage('Build') {
            steps {
                script {
                    try {
                        dir("${WORKSPACE}") {
                            // Install dependencies
                            sh 'npm install'
                            // Run build command
                            sh 'npm start' 
                        }
                    } catch (err) {
                        echo "Error occurred during build: ${err}"
                        currentBuild.result = 'FAILURE'
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t BabyVacBackEnd .'
            }
        }
        stage('Login to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'DockerHubPassword', variable: 'DockerHub')]) {
                    script {  
                        sh "docker login -u umeshgayashan -p '${DockerHub}'"
                    }
                }
            }
        }
        stage('Push Image') {
            steps {
                sh 'docker push umeshgayashan/BabyVacBackEnd'
            }
        }
    }
    post {
        always {
            sh 'docker logout'
        }
    }
}