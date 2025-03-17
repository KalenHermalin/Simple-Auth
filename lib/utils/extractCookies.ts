export default function extractCookie(cookieString: string, cookie_name: string): string | null {
    if (!cookieString || cookieString === "")
        return null;

    const cookies: string[] = cookieString.split(';')
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=')
        if (name.trim().toLowerCase() === cookie_name.trim().toLowerCase()) {
            return value
        }
    }
    return null;

}