import { generateState } from 'arctic'

/*import { encodeBase64urlNoPadding } from "@oslojs/encoding"
export default function generateState(): string {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return encodeBase64urlNoPadding(bytes)

}*/
export default generateState