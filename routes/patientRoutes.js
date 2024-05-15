const express = require("express");
const router = express.Router();
const patientSchema = require("../schema/patientSchema");
const { generateToken } = require("../extra/jwt");
const createHttpError = require("http-errors");

// Registration Route
router.post("/register", async (req, res) => {
  try {
      const { firstName, lastName, mobileNumber, email, username, password } = req.body;

      let pictureUrl = null;

      // Check if an image file is uploaded
      if (req.files && req.files.image) {
          const image = req.files.image;

          // Check if the uploaded file is an image
          if (!image.mimetype.startsWith("image")) {
              throw createHttpError(400, "Only images are allowed");
          }

          // Move the uploaded image to the public/images directory
          const filepath = `${__dirname}/../public/images/${image.name}`;
          await image.mv(filepath);

          // Construct the path to the uploaded image
          pictureUrl = `/images/${image.name}`;
      }

      // Check if all required fields are provided
      if (!firstName || !lastName || !mobileNumber || !email || !username || !password) {
          throw createHttpError(400, "Please provide all the required fields");
      }

      // Create a new user document
      const newUser = new patientSchema({
          firstName,
          lastName,
          mobileNumber,
          email,
          picture: pictureUrl,
          username,
          password,
      });

      // Save the user to the database using async/await
      const savedUser = await newUser.save();

      return res.status(201).send(savedUser); // Send HTTP 201 for resource creation along with the saved user's data
  } catch (err) {
      return res.status(err.status || 500).send("User registration failed: " + err.message); // Handle errors
  }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
  
      if (!username || !password) {
        return res.status(400).send("Username and Password required");
      }
  
      // async/await to find a user by username and password
      const user = await patientSchema.findOne({
        username: username,
        password: password,
      });
  
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      return res.status(200).json({ token: generateToken(user._id) });
    } catch (err) {
      return res.status(500).send("Login failed: " + err.message);
    }
  }
);

module.exports = router;