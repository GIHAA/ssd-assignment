const csrf = require("csurf");


const csrfProtection = csrf({ cookie: true });

const getCsrfToken = (req, res) => {

  res.cookie("XSRF-TOKEN", req.csrfToken(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
  res.status(200).json({
    success: true,
    csrfToken: req.csrfToken(),
  });
};

module.exports = {
  csrfProtection,
  getCsrfToken,
};
