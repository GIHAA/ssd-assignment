const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const axios = require("axios");
const {jwtDecode} = require("jwt-decode");
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

const registerUserUsingSocials = asyncHandler(async (data) => {
  const { name, email, address, phone, password, image, role } = data;

  if (!name || !email || !password) {
    throw new Error("Please add all fields");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return userExists;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let user;
  // Create user
  if (role) {
    user = await User.create({
      name,
      email,
      address,
      phone,
      password: hashedPassword,
      image: image,
      role: role,
    });
  } else {
    user = await User.create({
      name,
      email,
      address,
      phone,
      password: hashedPassword,
      image: image,
    });
  }
  if (user) {
      return user
  } else {
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

const google = asyncHandler(async (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.BACKEND_URL}/api/auth/google/callback&response_type=code&scope=openid%20email%20profile`;
  return await res.redirect(googleAuthUrl);
});

const googleCallback = asyncHandler(async (req, res) => {
  const tokenData = await handleGoogleCallback(
    req.query.code,
  );
  const queryParams = new URLSearchParams(tokenData).toString();
  return res.redirect(
    `${process.env.FRONTEND_URL + '/login-success'}?${queryParams}`,
  );
});

const facebook = asyncHandler(async (req, res) => {
  const facebookAuthUrl = `https://www.facebook.com/v9.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.BACKEND_URL}/api/auth/facebook/callback&state={state-param}`;
  return res.redirect(facebookAuthUrl);
});

const facebookCallback = asyncHandler(async (req, res) => {
  const tokenData = await handleFacebookCallback(
    req.query.code,
  );
  const queryParams = new URLSearchParams(tokenData).toString();
  return res.redirect(
    `${process.env.FRONTEND_URL + '/login-success'}?${queryParams}`,
  );
});

const handleGoogleCallback = async (code) => {
  const url = `https://oauth2.googleapis.com/token`;

  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    grant_type: 'authorization_code',
  });

  try {

    const response = await axios.post(url, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const decoded = jwtDecode(response.data.id_token);

    const user = await registerUserUsingSocials({
      name: decoded.name,
      email: decoded.email,
      password: 'password',
    })
 
    const token = jwt.sign(
      {...user},
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      },
    );
    return {
      user: token,
    };

  } catch (error) {
    console.log(error);
    throw new Error('Unable to authenticate user');
  }
}

const handleFacebookCallback = async (code) => {
  const tokenUrl = `https://graph.facebook.com/v9.0/oauth/access_token`;

  const params = {
    client_id: process.env.FACEBOOK_CLIENT_ID,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
    code,
  };

  try {

    const tokenResponse = await firstValueFrom(
      this.httpService.get(tokenUrl, { params }),
    );
    const accessToken = tokenResponse.data.access_token;

    const userResponse = await firstValueFrom(
      this.httpService.get('https://graph.facebook.com/me', {
        params: { access_token: accessToken, fields: 'id,name,email' },
      }),
    );

    const id = userResponse.id;

    return {
      userid: decodedToken.sub,
      role: userDetails ? userDetails.Role : 'not_registered',
      id_token: keycloakToken.access_token,
    };
  } catch (error) {
    throw new HttpException(
      error.response?.data || 'An error occurred during Facebook Sign-In',
      error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
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
  google,
  googleCallback,
  facebook,
  facebookCallback,
  adminProtect,
};
