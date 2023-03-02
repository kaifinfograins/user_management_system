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

// for serving files
user_routes.use(express.static('public'))

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

 user_routes.get('/forget',auth.isLogout, userController.forgetLoad)
 user_routes.post('/forget',  userController.forgetVerify)
 user_routes.get('/forget-password',auth.isLogout, userController.forgetPasswordLoad)
 user_routes.post('/forget-password',  userController.resetPassword)
 


 user_routes.get('/verification',userController.verificationLoad)
 user_routes.post('/verification', userController.sentVerificationLink)

 user_routes.get('/edit',auth.isLogin, userController.editProfile)



module.exports = user_routes;
