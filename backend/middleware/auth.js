const { getAuth } = require("@clerk/express");

const protect = (req, res, next) => {
  const auth = getAuth(req);

  console.log("===== AUTH DEBUG =====");
  console.log("Authorization header:", req.headers.authorization);
  console.log("Auth object:", auth);
  console.log("======================");

  if (!auth || !auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = {
    id: auth.userId,
    role: auth.sessionClaims?.publicMetadata?.role,
  };

  next();
};

module.exports = { protect };
