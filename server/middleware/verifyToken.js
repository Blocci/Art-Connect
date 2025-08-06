const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || (!decoded.id && !decoded._id)) {
      throw new Error("Decoded token missing 'id'");
    }

    req.user = { id: decoded.id || decoded._id }; //Set the user on the request object
    console.log("req.user set by middleware:", req.user);
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};