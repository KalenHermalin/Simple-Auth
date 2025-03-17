import { OAuth2Client } from "../OAuth2Client";
import { Provider } from "../Provider";
import { SimpleAuthProviderError, type OAuthResponse } from "../types";
import generateState from "../utils/generateState";

interface gitHubOAuthResponse {

    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string
}


class GitHub extends Provider {
    private client: OAuth2Client = _client;
    public HandleSignup(): void {
        const state = generateState();
        const url: URL = this.client.createAuthorizationURL(state)
        return this.client.createAuthRedirect(url, state)
    }
    public HandleCallback(): void {

    }

}
class GitHubOAuth extends OAuth2Client {

    public async getUserData(validatedResult: object): Promise<OAuthResponse> {
        console.log(validatedResult)
        if (!("access_token" in validatedResult))
            throw new Error("SimpleAuth Error: No access token in response");

        const access_token = validatedResult.access_token;
        if (!this?.endpoints?.apiEndpoints)
            throw new Error("No api endpoint to fetch")
        const response = await fetch(this.endpoints?.apiEndpoints, {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Accept": "application/vnd.github+json"
            }
        })
        const data: gitHubOAuthResponse[] = await response.json()
        if (data.length < 0)
            throw new Error("Could not retreive user data")

        const primaryEmail = data.find(email => email.primary === true);
        if (!primaryEmail)
            throw new Error("Could not find a primary email associated with this account")
        if (primaryEmail.verified === false)
            throw new Error("Primary email must be verified to sign up")
        return { provider: this.clientName, providerData: primaryEmail }





    }

}

export const _client =
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
    });



