// Jest setup for the project
import "@testing-library/jest-dom"

import { webcrypto as crypto } from "node:crypto"
// Polyfills for Node test environment used by pg
import { TextDecoder, TextEncoder } from "node:util"

if (!(global as unknown as { TextEncoder?: typeof TextEncoder }).TextEncoder) {
    // @ts-ignore - provide globals for libraries expecting web crypto/TextEncoder
    // @ts-ignore
    global.TextEncoder = TextEncoder
}
if (!(global as unknown as { TextDecoder?: typeof TextDecoder }).TextDecoder) {
    // @ts-ignore
    // @ts-ignore
    global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder
}
if (!(global as unknown as { crypto?: Crypto }).crypto) {
    // @ts-ignore
    // @ts-ignore
    global.crypto = crypto as unknown as Crypto
}
