import { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth";

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name?: string;
                role?: string;
            };
            session?: any;
        }
    }
}

// Authentication middleware - verifies session
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as any,
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
            role: (session.user as any).role || "user",
        };
        req.session = session;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session",
        });
    }
};

// Optional auth - attaches user if authenticated, continues otherwise
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as any,
        });

        if (session?.user) {
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: (session.user as any).role || "user",
            };
            req.session = session;
        }
    } catch (error) {
        // Ignore auth errors for optional auth
    }

    next();
};

// Admin role check - must be used after requireAuth
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
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
export const requireConsultantOrAdmin = (req: Request, res: Response, next: NextFunction) => {
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
