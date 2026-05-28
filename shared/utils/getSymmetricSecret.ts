function getSymmetricSecret(
  secret: string | null | undefined,
): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(secret || "");
}

export default getSymmetricSecret;
