const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const logAudit = require("../middleware/logAudit");

const viewUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  users
    ? res.status(201).json(users)
    : res.status(400).json({ message: "Error" });
});

//register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, address, phone, password, image, role } = req.body;

  // Check if all fields are provided
  if (!name || !email || !password) {
    await logAudit(req, "USER_REGISTER_FAILED", "Missing required fields", "WARNING");
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    await logAudit(req, "USER_REGISTER_FAILED", `Attempt to register existing user: ${email}`, "WARNING");
    res.status(400);
    throw new Error("User already exists");
  }

  // Create new user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    address,
    phone,
    password: hashedPassword,
    image,
    role,
  });

  // Audit log for successful registration
  if (user) {
    await logAudit(
      {
        headers: req.headers,
        connection: req.connection,
        user: { _id: user._id }, // Pass the newly created user's _id
      },
      "USER_REGISTER",
      `User ${user.email} registered successfully.`,
      "INFO"
    );

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      token: generateToken(user._id),
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } else {
    await logAudit(req, "USER_REGISTER_FAILED", "User creation failed", "ERROR");
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Check for failed login
  if (!user || !(await bcrypt.compare(password, user.password))) {
    await logAudit(req, "FAILED_LOGIN", `Failed login attempt for email: ${email}`, "WARNING");
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Successful login
  await logAudit(
    {
      headers: req.headers,
      connection: req.connection,
      user: { _id: user._id }, // Pass the user's ID explicitly
    },
    "LOGIN_USER",
    `User ${user.email} logged in.`,
    "INFO"
  );

  // Respond with user details and token
  res.json({
    _id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
    address: user.address,
    phone: user.phone,
    role: user.role,
    image: user.image,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  });
});



//get user
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

//update user
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.body._id });

  if (!req.body.confirmpassword) {
    res.status(400);
    throw new Error("please enter old password");
  }
  const passmatch = await bcrypt.compare(
    req.body.confirmpassword,
    user.password
  );

  if (req.body.email) {
    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
  }

  if (user && passmatch) {
    const salt = await bcrypt.genSalt(10);

    let hashedPassword = user.password;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, salt);
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.password = hashedPassword;
    user.address = req.body.address || user.address;
    user.phone = req.body.phone || user.phone;
    user.image = req.body.image || user.image;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      phone: updatedUser.phone,
      token: generateToken(updatedUser._id),
      role: updatedUser.role,
      image: updatedUser.image,
    });
  } else {
    res.status(400);
    throw new Error("update failed");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    await logAudit({
      headers: req.headers,
      connection: req.connection,
      user: { _id: user._id },
    }, "DELETE_USER", `User ${user.email} deleted.`);
    const deletedUser = await user.deleteOne();
    res.json({
      _id: deletedUser.id,
      name: deletedUser.name,
      email: deletedUser.email,
      message: "User deleted",
    });
  } else {
    res.status(400);
    throw new Error("Delete failed");
  }
});


const updateAdmin = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { name, email, role } = req.body;

  // Wait for the Feedback model to find the document by ID
  const user = await User.findOne({ _id: id });

  if (user) {
    // Update the feedback document with new values
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    // Save the updated document and wait for it to complete
    await user.save();

    res.status(201).json(user);
  } else {
    res.status(400).json({ message: "Error" });
  }
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const user = await User.findByIdAndDelete(id);

  user
    ? res.status(201).json(user)
    : res.status(400).json({ message: "Error" });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const forgotUser = asyncHandler(async (req, res) => {
  function generatePassword(length) {
    var charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    var password = "";
    for (var i = 0; i < length; i++) {
      var randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }
    return password;
  }

  const password = generatePassword(8);
  const email = req.body.email;

  const salt = await bcrypt.genSalt(10);

  let hashedPassword = await bcrypt.hash(password, salt);

  let user = await User.findOne({ email });

  if (user) {
    user.password = hashedPassword;

    const updatedUser = await user.save();

    if (updatedUser) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });
      const message = `
        <h1>Password Reset Successful</h1>
        <p>Dear ${updatedUser.name},</p>
        <p>Your password has been successfully reset. Please use the following temporary password to log in to your account:</p>
        <p><strong>${password}</strong></p>
        <p>Once you have logged in, please go to your account settings to update your password to a new one of your choice.</p>
        <p>Thank you for using our service!</p>
        <p>Best regards,</p>
        <p>The Happy Tails Team</p>
      `;

      const mailOptions = {
        from: "Happy Tails",
        to: email,
        subject: "Password Reset",
        html: message,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.status(500).send("Error sending email");
        } else {
          console.log("Email sent: " + info.response);
          res.send("Email sent successfully");
        }
      });

      res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
        phone: updatedUser.phone,
        token: generateToken(updatedUser._id),
        role: updatedUser.role,
        image: updatedUser.image,
      });
    } else {
      res.status(400);
      throw new Error("User failed to save");
    }
  } else {
    res.status(400);
    throw new Error("User doesn't exist");
  }
});

const adminProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role === "ADMIN") {
    // Log the audit event for admin access
    await logAudit(
      {
        headers: req.headers,
        connection: req.connection,
        user: { _id: req.user._id }, // Admin user ID
      },
      "ADMIN_ACCESS",
      `Admin ${req.user.email} accessed admin route.`
    );
    
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an ADMIN");
  }
});


module.exports = {
  registerUser,
  loginUser,
  viewUsers,
  updateUser,
  deleteUser,
  deleteAdmin,
  updateAdmin,
  forgotUser,
  adminProtect,
};
