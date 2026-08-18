interface Options {
  onSuccess?: (() => void) | null;
  onError?: ((error: Error) => void) | null;
}

const defaultOptions: Options = {} as const;

async function copyToClipboard(
  value: ClipboardItem | string,
  options: Options = defaultOptions,
) {
  const optionsToUse = { ...defaultOptions, ...options } as const;

  try {
    if (typeof value === "string") {
      await navigator.clipboard.writeText(value);
    } else {
      await navigator.clipboard.write([value]);
    }

    optionsToUse.onSuccess?.();
  } catch (e) {
    optionsToUse.onError?.(e as Error);
  }
}

export default copyToClipboard;
