const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "campuscrate_jwt_secret_key_2026";

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User account no longer exists." });
            }

            if (req.user.blocked) {
                return res.status(403).json({ message: "Your account has been suspended by campus administration." });
            }

            return next();
        } catch (error) {
            console.error("Auth middleware error:", error.message);
            return res.status(401).json({ message: "Not authorized, invalid token." });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no access token provided." });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin." });
    }
};

module.exports = { protect, adminOnly, JWT_SECRET };
