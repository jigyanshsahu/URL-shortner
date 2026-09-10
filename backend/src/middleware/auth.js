import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Authentication required",
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({
            error: "Invalid or expired token",
        });
    }
}

export default authenticateToken;