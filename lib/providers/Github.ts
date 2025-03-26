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
    redirectURI?: string;
}

export default class GitHub extends Provider<githubAuthResponse> {

    private client: arctic.GitHub;
    private cName: string;
    private clientId: string;
    private clientSecret: string;
    private redirectURI: string | null;
    private scopes: string[] = ["user:email"]
    constructor(props: gitHubProps) {
        super(props.name, {
            githubID: "string",
            email: "string",
        })
        this.cName = props.name;
        this.clientId = props.clientId;
        this.clientSecret = props.clientSecret;
        this.redirectURI = props.redirectURI ? props.redirectURI : null;
        this.client = new arctic.GitHub(this.clientId, this.clientSecret, this.redirectURI);


    }
    public HandleSignup(): Response {
        const state = generateState();
        const url: URL = this.client.createAuthorizationURL(state, this.scopes)
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
        const result = await this.client.validateAuthorizationCode(code)
        return {
            provider: this.cName,
            providerData: await this.getuserData(result)
        } as SimpleAuthResponse<typeof this.returnType>;


    }

    private async getuserData(validatedResult: arctic.OAuth2Tokens): Promise<githubAuthResponse> {
        console.log(validatedResult)
        if (!validatedResult.accessToken)
            throw new Error("SimpleAuth Error: No access token in response");

        const access_token = validatedResult.accessToken;

        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Accept": "application/vnd.github+json"
            }
        })
        const user = await userResponse.json()
        if (!user)
            throw new Error("Could not retreive user data")
        const userId = user.id;

        const emailResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        const emails: gitHubEmailResponse[] = await emailResponse.json();
        if (!emails)
            throw new Error("Could not retreive user email")

        const primaryEmail = emails.find((email: gitHubEmailResponse) => email.primary === true);
        if (!primaryEmail)
            throw new Error("Could not find a primary email associated with this account")
        if (primaryEmail.verified === false)
            throw new Error("Primary email must be verified to sign up")
        return { email: primaryEmail.email, githubID: userId }
    }

}



/*const _client =
    new GitHubOAuth({
        endpoints: {
            authorizationEndpoint: "https://github.com/login/oauth/authorize",
            tokenEndpoint: "https://github.com/login/oauth/access_token",
            apiEndpoints: "https://api.github.com/user/emails",

        },
        clientId: "Ov23liaIDwP4pZi8ObTA",
        clientSecret: "366a1fc3634b0683cb1cffb9a6fd9f56aae493ea",
        clientName: "github",
        options: {
            scopes: ["user:email"],
        },
    });*/



