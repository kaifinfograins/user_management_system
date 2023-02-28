const express = require("express");
const user_routes = express();
const bodyParser = require("body-parser");
const session = require("express-session")

// use session here
const config = require("../config/config")
user_routes.use(session({secret:config.sessionSecret}))

// import miiddleware here
const auth = require("../middleware/auth")


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




user_routes.get("/register", auth.isLogout,  userController.loadRegister);
user_routes.post("/register", upload.single("image") , userController.insertUser);
user_routes.get("/verify",userController.verifyMail)

 user_routes.get('/', auth.isLogout,  userController.loginLoad)
 user_routes.get('/login', auth.isLogout,  userController.loginLoad)

 user_routes.post('/login',userController.verifyLogin)

 user_routes.get('/home',auth.isLogin, userController.loadHome)
 user_routes.get('/logout',auth.isLogin, userController.userLogout)






module.exports = user_routes;
