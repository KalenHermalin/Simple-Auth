import type { Type } from "typescript";
import { SimpleAuthProviderError, type SimpleAuthResponse } from "./types";



/**
 * Abstract Provider class
 * This generic class defines the interface for an authentication provider.
 * Concrete providers should extend this class and implement the abstract methods.
 *
 * @template T - A record type representing the shape of the provider's return data.
 */
export abstract class Provider<T extends Record<string, unknown> = Record<string, unknown>> {
    // Name of the provider (stored in lowercase)
    public name: string;
    // The type definition for the data this provider will return
    public returnType: T;

    /**
     * Constructor for the Provider class.
     * It takes a provider name and a return type descriptor.
     *
     * @param name - The name of the provider.
     * @param returnType - An object that describes the type of data the provider returns.
     */
    constructor(name: string, returnType: T) {
        this.name = name.toLowerCase();
        this.returnType = returnType;
    }
    /**
     * Abstract method to handle the signup (or initial authentication redirection) process.
     * Concrete providers must implement this to initiate the OAuth flow or similar processes.
     *
     * @returns A Response object that typically redirects the user to an OAuth consent page.
     */
    public abstract HandleSignup(): Response;

    /**
     * Abstract method to handle the callback after the user has authenticated with the provider.
     * Concrete providers must implement this to process the authentication response.
     *
     * @param req - The HTTP Request object received after redirection from the provider.
     * @returns A Promise that resolves to a SimpleAuthResponse, encapsulating the provider data.
     */
    public abstract HandleCallback(req: Request): Promise<SimpleAuthResponse<typeof this.returnType>>;
}