const User = require("../models/userModel");
const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
const config = require("../config/config");

const sgMail = require("@sendgrid/mail");

const randomstring = require("randomstring");

//* PASSWORD HASHING FUNCTION USING BCRYPT
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

//====> for send mail <=====

/*const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: "mkaif.infograins@gmail.com",
      to: email,
      subject: "for verification mail",
      html:
        "<h3>Hi" +
        " " +
        name +
        ', please click here to <a href=" http://localhost:8000/verify?id=' +
        user_id +
        ' " > Verify </a> your mail </h3>',
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

//=====> for reset password send mail <=======

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "For Reset Password",
      html:
        "<p>Hi" +
        " " +
        name +
        ', please click here to <a href=" http://localhost:8000/forget-password?token=' +
        token +
        ' " > Reset </a> your password </p>',
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

*/

// *for reset password send mail
const sendResetPasswordMail = async (name, email, token) => {
  sgMail.setApiKey(process.env.API_KEY);
  const text = {
    to: email,
    from: "kaifmansuri1398@gmail.com",
    subject: "Hello from send grid",
    html:
      "<h3>Hi" +
      " " +
      name +
      ', please click here to <a href=" http://localhost:8000/forget-password?token=' +
      token +
      ' " > Reset </a> your password </h3>',
  };
  console.log("text.........", text);
  try {
    sgMail
      .send(text)
      .then((response) => console.log("Email sent ..........", response))
      .catch((error) => console.log("error...........", error.text));
  } catch (error) {
    console.log(error, 76);
  }
};

//* for send mail
const sendVerifyMail = async (name, email, user_id) => {
  sgMail.setApiKey(process.env.API_KEY);
  const text = {
    to: email,
    from: "kaifmansuri1398@gmail.com",
    subject: "Hello from Admin side",
    html:
      "<h3>Hi" +
      " " +
      name +
      ', please click here to <a href=" http://localhost:8000/verify?id=' +
      user_id +
      ' " > Verify </a> your mail </h3>',
  };
  console.log("text.........", text);
  try {
    sgMail
      .send(text)
      .then((response) => console.log("Email sent ..........", response))
      .catch((error) => console.log("error...........", error.text));
  } catch (error) {
    console.log(error, 76);
  }
};

//*  register user

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

    const user_id = user._id;

    sgMail.setApiKey(process.env.API_KEY);
    const text = {
      to: email,
      from: "kaifmansuri1398@gmail.com",
      subject: "Hello from send grid",
      html:
        "<h3>Hi" +
        " " +
        name +
        ', please click here to <a href=" http://localhost:8000/verify?id=' +
        user_id +
        ' " > Verify </a> your mail </h3>',
    };
    console.log("text.........", text);
    try {
      sgMail
        .send(text)
        .then((response) => console.log("Email sent ..........", response))
        .catch((error) => console.log("error...........", error.text));
      const userData = await user.save();
      console.log("user===>", userData);
      if (userData) {
        res.render("registration", {
          message:
            "your registration has been successfully submitted,please check your mail",
        });
      } else {
        res.render("registration", {
          message: "your registration has been failed",
        });
      }
    } catch (error) {
      console.log(error, 76);
    }
    // sgMail.send(text)
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

const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

// * forget password code here

const forgetLoad = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_varified === 0) {
        res.render("forget", { message: "Please verify your mail" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        sendResetPasswordMail(userData.name, userData.email, randomString);
        res.render("forget", {
          message: "Please check your mail to reset your password",
        });
      }
    } else {
      res.render("forget", { message: "User email is incorrect." });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render("forget-password", { user_id: tokenData._id });
    } else {
      res.render("404", { message: "Page not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const secure_password = await hashPassword(password);

    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password, token: "" } }
    );

    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

//* for verification send mail link

const verificationLoad = async (req, res) => {
  try {
    res.render("verification");
  } catch (error) {
    console.log(error.message);
  }
};

const sentVerificationLink = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });

    if (userData) {
      sendVerifyMail(userData.name, userData.email, userData._id);
      res.render("verification", {
        message: "Reset verification mail sent on your email, please check",
      });
    } else {
      res.render("verification", { message: "This email is not exists" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  verificationLoad,
  sentVerificationLink,
};
