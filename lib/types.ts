/**
 * SimpleAuthResponse Type
 * A generic type that represents the structure of the response returned by a provider.
 *
 * @template P - The type of the provider data.
 */
export type SimpleAuthResponse<P> = {
    provider: string,
    providerData: P
}


/**
 * SimpleAuthError Class
 * A custom error class used for general authentication errors.
 * It extends the built-in Error class and adds a statusCode property.
 */
export class SimpleAuthError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = 'SimpleAuthError';
        this.statusCode = statusCode;

        // This maintains proper stack traces in modern JS engines
        Error.captureStackTrace?.(this, this.constructor);
    }
}

/**
 * SimpleAuthProviderError Class
 * A custom error class specifically for errors thrown by an authentication provider.
 * Similar to SimpleAuthError, but differentiated by its name.
 */
export class SimpleAuthProviderError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = `SimpleAuthProviderError`;
        this.statusCode = statusCode;

        Error.captureStackTrace?.(this, this.constructor);
    }
}