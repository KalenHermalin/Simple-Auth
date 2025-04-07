import { OAuth2Client, type OAuth2ClientProps } from "../OAuth2Client";
import { Provider } from "../Provider";
import { SimpleAuthError, SimpleAuthProviderError, type SimpleAuthResponse } from "../types";
import { createAuthRedirect } from "../utils/authRedirect";
import extractCookie from "../utils/extractCookies";
import generateState from "../utils/generateState";
import * as arctic from "arctic";
type gitHubEmailResponse = {

    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string
}
type githubAuthResponse = {
    githubID: string;
    email: string;
}
type gitHubProps = {
    name: string,
    clientId: string,
    clientSecret: string,
    redirectURI: string;
}

export default class Google extends Provider<githubAuthResponse> {

    private client: arctic.Google;
    private cName: string;
    private clientId: string;
    private clientSecret: string;
    private redirectURI: string;
    private scopes: string[] = ["openid", "profile", "email"]
    private codeVerifer: string = '';
    constructor(props: gitHubProps) {
        // TODO: Update Return Typr
        super(props.name, {
            githubID: "string",
            email: "string",
        })
        this.cName = props.name;
        this.clientId = props.clientId;
        this.clientSecret = props.clientSecret;
        this.redirectURI = props.redirectURI;
        this.client = new arctic.Google(this.clientId, this.clientSecret, this.redirectURI);


    }
    public HandleSignup(): Response {
        const state = generateState();
        // TODO: Need to save codeVerifer, need it on callback
        this.codeVerifer = arctic.generateCodeVerifier()
        const url: URL = this.client.createAuthorizationURL(state, this.codeVerifer, this.scopes)
        return createAuthRedirect(url, state, this.cName)
    }
    public async HandleCallback(req: Request): Promise<SimpleAuthResponse<githubAuthResponse>> {
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

        // TODO: catch potential errors
        const result = await this.client.validateAuthorizationCode(code, this.codeVerifer)
        return {
            provider: this.cName,
            providerData: await this.getuserData(result)
        } as SimpleAuthResponse<typeof this.returnType>;


    }

    private async getuserData(validatedResult: arctic.OAuth2Tokens): Promise<githubAuthResponse> {
        throw new Error("Not Impletemented Yet...")
    }

}




