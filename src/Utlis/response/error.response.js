
export const ErrorResponse = ({ 
    message = "Error",
    status = 400,
    extra = undefined,
    }) => {

    const error = new Error(
            typeof message === "string" ? message : message?.message || "Error",
        );
    error.status = status;
    error.extra = extra;
    throw error;  // عايز ال error يروح لل global error handler
};

export const BadRequestException = (
    message = "BadRequestException" , 
    extra = undefined,
) => {
    return ErrorResponse({ message, status: 400, extra });
};

export const ConflictException = (
    message = "ConflictException" , 
    extra = undefined,
) => {
    return ErrorResponse({ message, status: 409, extra });
};

export const UnauthorizedException = (
    message = "UnauthorizedException" , 
    extra = undefined,
) => {
    return ErrorResponse({ message, status: 401, extra });
};

export const NotFoundException = (
    message = "NotFoundException" , 
    extra = undefined,
) => {
    return ErrorResponse({ message, status: 404, extra });
};

export const ForbiddenException = (
    message = "ForbiddenException" , 
    extra = undefined,
) => {
    return ErrorResponse({ message, status: 403, extra });
};

export const globalErorrHandler = (error, req, res, next) => {
    const status = error.status ?? 500;
    const extra = error.extra || undefined;
    return res
    .status(status)
    .json({ message: error.message, stack: error.stack, status, extra });
};

export class ErrorClass extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
    }
}