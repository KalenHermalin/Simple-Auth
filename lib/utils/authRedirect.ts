import createCookie from "./createCookie";

export function createAuthRedirect(url: URL, state: string, client: string) {
    const headers = new Headers();
    const isSecure = url.protocol === 'https:';


    // First, create each cookie string
    const savedCookie = createCookie('simple_oauth_cookie', state + "+" + client, isSecure);

    // Use separate append calls for each cookie
    headers.append("Set-Cookie", savedCookie);;

    headers.set("Content-Type", "text/html");
    headers.set("Location", url.toString());

    return new Response(null, {
        status: 302,
        headers
    });
}