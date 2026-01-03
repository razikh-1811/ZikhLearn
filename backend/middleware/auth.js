const { getAuth } = require("@clerk/express");

const protect = (req, res, next) => {
  const auth = getAuth(req);

  if (!auth || !auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = {
    id: auth.userId,
    role: auth.sessionClaims?.publicMetadata?.role || null,
  };

  next();
};

module.exports = { protect };
