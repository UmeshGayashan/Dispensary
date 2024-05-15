require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const connection = require("./database/connection");
const express = require("express");
const fileUpload = require('express-fileupload');
const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(
    express.urlencoded({
      extended: false,
    })
);

app.use(fileUpload());

app.use('/uploads/images', express.static('public/images'))
// let gfs;
connection();

// const conn = mongoose.connection;
// conn.once("open", function () {
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection("photos");
// });

// app.use("/file", upload); 
app.use("/public", require("./routes/patientRoutes"));

// // media routes
app.get("/file/:filename", async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (error) {
        res.send("not found");
    }
});

app.delete("/file/:filename", async (req, res) => {
    try {
        await gfs.files.deleteOne({ filename: req.params.filename });
        res.send("success");
    } catch (error) {
        console.log(error);
        res.send("An error occured.");
    }
});

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));