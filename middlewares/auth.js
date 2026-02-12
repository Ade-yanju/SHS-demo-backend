import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("Not authorized");

  const decoded = jwt.verify(token, "SECRET_KEY");
  req.user = decoded;
  next();
};

export const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).send("Access denied");
    next();
  };
};
