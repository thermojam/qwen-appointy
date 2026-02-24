export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
    }

    static badRequest(message: string, code: string = 'BAD_REQUEST') {
        return new AppError(message, 400, code);
    }

    static unauthorized(message: string, code: string = 'UNAUTHORIZED') {
        return new AppError(message, 401, code);
    }

    static forbidden(message: string, code: string = 'FORBIDDEN') {
        return new AppError(message, 403, code);
    }

    static notFound(message: string, code: string = 'NOT_FOUND') {
        return new AppError(message, 404, code);
    }

    static conflict(message: string, code: string = 'CONFLICT') {
        return new AppError(message, 409, code);
    }
}
