import extractCookie from "./utils/extractCookies";
import type { OAuth2Client } from "./OAuth2Client";
import { SimpleAuthError, type SimpleAuthResponse } from "./types";
import type { Provider } from "./Provider";


/**
 * SimpleAuth Class
 * This class orchestrates the authentication process using multiple providers.
 *
 * @template P - A record type where each key is the providers name.
 * The value for each key is then an instance of a Provider Class
 * 
 */
export class SimpleAuth<P extends Record<string, Provider<any>>> {
    private providers: P;
    // TODO: Change this to use the actual SimpleAuthResponse type somehow if possible
    private onSuccess: (data: {
        [K in keyof P]: {
            // The provider's name (as a string, if K is a string).
            provider: K extends string ? K : never;
            // The data returned from the provider, with type information from the provider's returnType.
            providerData: P[K]['returnType'];
        }
    }[keyof P]) => Response;

    /**
    * Constructs a new instance of SimpleAuth.
    *
    * @param providers - An object mapping provider names to their configuration (including the Provider instance).
    * @param onSuccess - A callback that processes user data and returns a Response.
    */
    constructor(providers: P, onSuccess: (data: {
        [K in keyof P]: {
            provider: K extends string ? K : never;
            providerData: P[K]['returnType'];
        }
    }[keyof P]) => Response) {
        this.providers = providers;
        this.onSuccess = onSuccess;
    }

    /**
     * Creates an HTTP redirection Response for the OAuth flow.
     * This method sets the necessary headers including cookies to preserve session state.
     *
     * @param url - The URL to which the user should be redirected.
     * @param state - A state string used for CSRF protection and session correlation.
     * @param provider - The OAuth2 client associated with the provider.
     * @returns A Response object with a 302 status (redirection) and the appropriate headers.
     */

    /**
        * Handles the signup (authentication initiation) request.
        * This method extracts the provider from the query string, validates it,
        * and then delegates the signup handling to the specified provider.
        *
        * @param req - The HTTP Request object initiating the signup.
        * @returns A Response object returned by the provider's HandleSignup method.
        * @throws SimpleAuthError if the provider parameter is missing or invalid.
        */
    public userSignUpHandler(req: Request): Response {
        console.log("SimpleAuth: Inside Signup Handler")
        const { searchParams } = new URL(req.url)
        const provider = searchParams.get("provider")?.toLowerCase()
        if (!provider)
            throw new SimpleAuthError("Provider parameter missing", 400)
        if (!(provider in this.providers)) {
            throw new SimpleAuthError(`Provider '${provider}' not found or not configured`, 404);

        }
        /*if (!this.providers.some(client => client.name === provider.trim().toLowerCase()))
            throw new SimpleAuthError(`Provider '${provider}' not found or not configured`, 404);
*/
        const client = this.providers[provider];
        //const client = this.providers.find((client) => client.name === provider)
        return client!.HandleSignup()
        /*const state = generateState();
        const url: URL = AuthClient!.createAuthorizationURL(state)
        return this.createAuthRedirect(url, state, AuthClient!)*/
    }

    /**
    * Handles the callback after the user has authenticated with the provider.
    * It validates the session cookie, determines the appropriate provider,
    * and then processes the callback via the provider's HandleCallback method.
    *
    * @param req - The HTTP Request object containing callback parameters.
    * @returns A Promise that resolves to a Response produced by the onSuccess callback.
    * @throws SimpleAuthError if required cookies or provider information are missing or invalid.
    */
    public async userSignUpCallback(req: Request): Promise<Response> {
        const simple_oauth_cookie = extractCookie(req.headers.get("cookie") || "", "simple_oauth_cookie")?.split("+")
        if (!simple_oauth_cookie)
            throw new SimpleAuthError("Missing authentication session cookie", 400);
        const storedProvider = simple_oauth_cookie[1]
        if (!storedProvider)
            throw new SimpleAuthError("Missing information from session cookie", 400);

        if (!(storedProvider in this.providers)) {
            throw new SimpleAuthError(`Provider '${storedProvider}' not found or not configured`, 404);

        }
        /*if (!this.providers.some(client => client.name === provider.trim().toLowerCase()))
            throw new SimpleAuthError(`Provider '${provider}' not found or not configured`, 404);
*/
        const provider = this.providers[storedProvider];
        //const provider = this.providers.find(client => client.name === storedProvider)
        if (!provider)
            throw new SimpleAuthError(`Provider '${storedProvider}' not configured`, 404);

        const userData = await provider.HandleCallback(req)

        /// PROCESS USER DATA 
        return this.onSuccess({
            provider: storedProvider as keyof P & string,
            providerData: userData.providerData
        } as {
            [K in keyof P]: {
                provider: K extends string ? K : never;
                providerData: P[K]['returnType'];
            }
        }[keyof P])

    }



}
