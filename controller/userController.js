const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

//* PASSWORD HASHING FUNCTION USING BCRYPT
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

//* for send mail

const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "mkaif.infograins@gmail.com",
        pass: "mlzqbiqiuavudwnk",
      },
    });

    const mailOptions = {
      from: "mkaif.infograins@gmail.com",
      to: email,
      subject: "for verification mail",
      html:
        "<p>Hi" +
        " " +
        name +
        ', please click here to <a href=" http://localhost:8000/verify?id=' +
        user_id +
        ' " > Verify </a> your mail </p>',
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent--->", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//* for register user

const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email,
      mobile: req.body.mno,
      image: req.file.filename,
      password: hashedPassword,
      is_admin: 0,
    });
    const userData = await user.save();

    if (userData) {
      sendVerifyMail(req.body.name, req.body.email, userData._id);
      res.render("registration", {
        message: "your registration has been successfully submitted",
      });
    } else {
      res.render("registration", {
        message: "your registration has been failed",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_varified: 1 } }
    );

    console.log(updateInfo);
    res.render("email-verified");
  } catch (error) {
    console.log(error.message);
  }
};

// * login user method started

const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_varified === 0) {
          res.render("login", { message: "Please verify your mail" });
        } else {
          // middleware auth.js (req.session.user_id)
          req.session.user_id = userData._id;
          res.redirect("/home");
        }
      } else {
        res.render("login", { message: "email and password is incorrect" });
      }
    } else {
      res.render("login", { message: "email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async(req,res)=>{
  try {

    req.session.destroy()
    res.redirect('/login')
    
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadRegister,
  insertUser,
  verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout
};
