import { SimpleAuthProviderError } from "./types";

export interface ProviderProps {
    clientId: string;
    endpoints: {
        authorizationEndpoint: string;
        tokenEndpoint: string;
        apiEndpoints?: string;

    }
    clientSecret: string;
    clientName: string;
    options?: {
        redirectURI?: string;
        scopes?: string[];

    }
}
export abstract class Provider {
    public abstract HandleSignup(): void;
    public abstract HandleCallback(): void;
}