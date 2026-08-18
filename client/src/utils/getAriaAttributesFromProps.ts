import { objectEntries } from "@speak-up/shared";

type MinimalisticProps = Record<string, unknown>;

function getAriaAttributesFromProps(
  props: MinimalisticProps,
): MinimalisticProps {
  const obj = { ...props };

  for (const [key, value] of objectEntries(obj)) {
    if (key.startsWith("aria-") && value !== undefined) continue;
    delete obj[key];
  }

  return obj;
}

export default getAriaAttributesFromProps;
