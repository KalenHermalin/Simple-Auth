import extractCookie from "./utils/extractCookies";
import { SimpleAuthError, type SimpleAuthResponse } from "./types";
import createCookie from "./utils/createCookie";

export interface OAuth2ClientProps {
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

export abstract class OAuth2Client {
    clientId: string;
    clientName: string;
    endpoints: {
        authorizationEndpoint: string;
        tokenEndpoint: string;
        apiEndpoints?: string;

    }
    clientSecret: string;
    options?: {
        redirectURI?: string;
        scopes?: string[];

    }

    constructor(name: string, props: OAuth2ClientProps) {
        this.clientName = name.toLowerCase();
        this.clientId = props.clientId;
        this.clientSecret = props.clientSecret;
        this.endpoints = props.endpoints
        this.options = props.options
    }

    public createAuthorizationURL(
        state: string,
    ): URL {
        if (!state || state.trim() === "") {
            throw new SimpleAuthError("State parameter is required");
        }
        const url = new URL(this.endpoints.authorizationEndpoint);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("client_id", this.clientId);
        if (this.options?.redirectURI !== undefined) {
            url.searchParams.set("redirect_uri", this.options?.redirectURI!);
        }
        url.searchParams.set("state", state);
        if (this.options?.scopes && this.options?.scopes.length > 0) {
            url.searchParams.set("scope", this.options?.scopes.join(" "));
        }
        return url;
    }
    public async validateAuthCodes(req: Request): Promise<object> {
        const url = new URL(req.url);
        const code = url.searchParams.get("code")
        const state = url.searchParams.get("state")
        const oauth_saved_info = extractCookie(req.headers.get("cookie") || "", "simple_oauth_cookie")?.split("+")
        if (!oauth_saved_info)
            throw new SimpleAuthError("Missing authentication session cookie", 400);
        //console.log(`StoredState: ${storedState}\n State: ${state}\n Code: ${code}`)
        if (code === null)
            throw new SimpleAuthError("Authorization code is missing from callback!", 400)
        if (state === null)
            throw new SimpleAuthError("Authorization state is missing from callback!", 400)
        const storedState = oauth_saved_info[0]
        if (storedState === null)
            throw new SimpleAuthError("Authentication session expired or cookie missing", 401);

        if (storedState !== state)
            throw new SimpleAuthError("State parameter mismatch", 401)

        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            client_id: this.clientId,
            client_secret: this.clientSecret
        });

        if (this.options?.redirectURI) {
            body.append("redirect_uri", this.options.redirectURI);
        }

        const response = await fetch(this.endpoints.tokenEndpoint, {
            method: "POST",
            body,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            }
        });
        const result = await response.json();
        if ("error" in result) {
            // invalid credentials, code, redirect uri
            throw new SimpleAuthError(`Provider returned ${result.error}`, 401)
        }
        return result;

    }

    createAuthRedirect(url: URL, state: string) {
        const headers = new Headers();
        const isSecure = url.protocol === 'https:';


        // First, create each cookie string
        const savedCookie = createCookie('simple_oauth_cookie', state + "+" + this.clientName, isSecure);

        // Use separate append calls for each cookie
        headers.append("Set-Cookie", savedCookie);;

        headers.set("Content-Type", "text/html");
        headers.set("Location", url.toString());

        return new Response(null, {
            status: 302,
            headers
        });
    }

    public abstract getUserData<T>(validatedResult: any): Promise<T>

}