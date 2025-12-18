// Async handler wrapper to catch errors
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    // Handle known error types
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: err.errors,
        });
    }
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    if (err.code === "23505") {
        // PostgreSQL unique violation
        return res.status(409).json({
            success: false,
            message: "Resource already exists",
        });
    }
    if (err.code === "23503") {
        // PostgreSQL foreign key violation
        return res.status(400).json({
            success: false,
            message: "Referenced resource not found",
        });
    }
    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
// Not found handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};
