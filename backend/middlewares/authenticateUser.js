const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  console.log("[INFO] Authenticating user...");
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};



module.exports = authenticateUser;
