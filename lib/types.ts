export interface OAuthResponse {
    provider: string;
    providerData: object;
}

export class SimpleAuthError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = 'SimpleAuthError';
        this.statusCode = statusCode;

        // This maintains proper stack traces in modern JS engines
        Error.captureStackTrace(this, this.constructor);
    }
}
export class SimpleAuthProviderError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = `SimpleAuthProviderError`;
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}