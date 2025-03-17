import extractCookie from "./utils/extractCookies";
import type { OAuth2Client } from "./OAuth2Client";
import { SimpleAuthError, type OAuthResponse } from "./types";
import generateState from "./utils/generateState";

export class SimpleAuth {
    private providers: OAuth2Client[];
    private onSuccess: (data: OAuthResponse) => Response;

    constructor(providers: OAuth2Client[], onSuccess: (data: OAuthResponse) => Response) {
        this.providers = providers;
        this.onSuccess = onSuccess;
    }



    private createAuthRedirect(url: URL, state: string, provider: OAuth2Client) {
        const headers = new Headers();
        const isSecure = url.protocol === 'https:';


        // First, create each cookie string
        const savedCookie = this.createCookie('simple_oauth_cookie', state + "+" + provider.clientName, isSecure);
        // const providerCookie = this.createCookie('oauth_provider_saved', provider.clientName, isSecure);

        // Use separate append calls for each cookie
        headers.append("Set-Cookie", savedCookie);;

        headers.set("Content-Type", "text/html");
        headers.set("Location", url.toString());

        return new Response(null, {
            status: 302,
            headers
        });
    }

    public userSignUpHandler(req: Request): Response {
        console.log("SimpleAuth: Inside Signup Handler")
        const { searchParams } = new URL(req.url)
        const provider = searchParams.get("provider")?.toLowerCase()
        if (!provider)
            throw new SimpleAuthError("Provider parameter missing", 400)
        if (!this.providers.some(oauthClient => oauthClient.clientName === provider.trim().toLowerCase()))
            throw new SimpleAuthError(`Provider '${provider}' not found or not configured`, 404);

        const AuthClient = this.providers.find((client) => client.clientName === provider)
        const state = generateState();
        const url: URL = AuthClient!.createAuthorizationURL(state)
        return this.createAuthRedirect(url, state, AuthClient!)
    }

    public async userSignUpCallback(req: Request): Promise<Response> {
        const simple_oauth_cookie = extractCookie(req.headers.get("cookie") || "", "simple_oauth_cookie")?.split("+")
        if (!simple_oauth_cookie)
            throw new SimpleAuthError("Missing authentication session cookie", 400);
        const storedProvider = simple_oauth_cookie[1]
        if (!storedProvider)
            throw new SimpleAuthError("Missing information from session cookie", 400);
        const provider = this.providers.find(oauthClient => oauthClient.clientName === storedProvider)
        if (!provider)
            throw new SimpleAuthError(`Provider '${storedProvider}' not configured`, 404);
        const result = await provider!.validateAuthCodes(req)

        /// PROCESS USER DATA 
        const userData = await provider!.getUserData(result);
        return this.onSuccess(userData)

    }



}
