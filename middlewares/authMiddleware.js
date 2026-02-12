import jwt from "jsonwebtoken";

/* VERIFY TOKEN */
export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Access denied. No token." });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ROLE CHECKS */

export const hirerOnly = (req, res, next) => {
  if (req.user.role !== "hirer") {
    return res.status(403).json({ message: "Hirers only" });
  }
  next();
};

export const freelancerOnly = (req, res, next) => {
  if (req.user.role !== "freelancer") {
    return res.status(403).json({ message: "Freelancers only" });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};
