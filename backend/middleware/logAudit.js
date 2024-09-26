const Audit = require("../models/auditModel");
const User = require("../models/userModel");

const logAudit = async (req, action, description = '', status = 'INFO') => {
  const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  let userId = null;
  let userName = 'Anonymous';


  if (req.user && req.user._id) {
    const user = await User.findById(req.user._id).select('name');
    if (user) {
      userId = user._id;
      userName = user.name;
    }
  }

  let csrfTokenDetails = '';
  if (req.csrfToken) {
    csrfTokenDetails = `CSRF Token: ${req.csrfToken()}`;
  } else {
    csrfTokenDetails = 'No CSRF Token found';
  }

  await Audit.create({
    action,
    user: userId,
    userName,
    description: `${description} ${csrfTokenDetails}`,
    ipAddress,
    status,
    timestamp: new Date(),
  });
};

module.exports = logAudit;
