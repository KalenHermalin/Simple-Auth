export default function createCookie(name: string, value: string, isSecure: boolean = false): string {
    const secureFlag = isSecure ? 'secure;' : '';
    return `${name}=${value};Path=/;HttpOnly;SameSite=strict;${secureFlag}Max-Age=600`;
}