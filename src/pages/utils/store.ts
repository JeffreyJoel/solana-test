//using this in place of an actual production storage method
export const nonceStore = new Map<string, { nonce: string, expiresAt: number }>();