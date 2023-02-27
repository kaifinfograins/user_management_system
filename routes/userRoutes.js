const express = require("express");
const user_routes = express();
const bodyParser = require("body-parser");

// use body parser here
user_routes.use(bodyParser.json());
user_routes.use(bodyParser.urlencoded({ extended: true }));

// multer for files uploading

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/userImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload =multer({storage:storage})

// for ejs files
user_routes.set("view engine", "ejs");
user_routes.set("views", "./views");

// for controller files
const userController = require("../controller/userController");




user_routes.get("/register", userController.loadRegister);
user_routes.post("/register", upload.single("image") , userController.insertUser);
user_routes.get("/verify",userController.verifyMail)


module.exports = user_routes;
