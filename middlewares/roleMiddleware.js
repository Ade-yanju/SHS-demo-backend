import jwt from "jsonwebtoken";

/* VERIFY TOKEN FIRST */
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ROLE: HIRER ONLY */
export const hirerOnly = (req, res, next) => {
  if (req.user.role !== "hirer") {
    return res.status(403).json({ message: "Hirers only" });
  }
  next();
};

/* ROLE: FREELANCER ONLY */
export const freelancerOnly = (req, res, next) => {
  if (req.user.role !== "freelancer") {
    return res.status(403).json({ message: "Freelancers only" });
  }
  next();
};

/* ROLE: ADMIN ONLY */
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};
