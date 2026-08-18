async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    const chunk = bytes[i];
    if (typeof chunk !== "number") continue;

    binary += String.fromCharCode(chunk);
  }

  const base64 = btoa(binary);
  return `data:${blob.type};base64,${base64}`;
}

export default blobToBase64;
