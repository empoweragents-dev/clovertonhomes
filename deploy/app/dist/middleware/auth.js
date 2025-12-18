import { auth } from "../config/auth";
// Authentication middleware - verifies session
export const requireAuth = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });
        if (!session?.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role || "user",
        };
        req.session = session;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session",
        });
    }
};
// Optional auth - attaches user if authenticated, continues otherwise
export const optionalAuth = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });
        if (session?.user) {
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role || "user",
            };
            req.session = session;
        }
    }
    catch (error) {
        // Ignore auth errors for optional auth
    }
    next();
};
// Admin role check - must be used after requireAuth
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }
    next();
};
// Consultant or Admin role check
export const requireConsultantOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }
    if (req.user.role !== "admin" && req.user.role !== "consultant") {
        return res.status(403).json({
            success: false,
            message: "Consultant or admin access required",
        });
    }
    next();
};
