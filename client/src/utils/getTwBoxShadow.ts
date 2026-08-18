import formatCommaSeparatedCss from "@/utils/formatCommaSeparatedCss";

function getTwBoxShadow(value: string): string {
  return formatCommaSeparatedCss(`
    var(--tw-inset-shadow),
    var(--tw-inset-ring-shadow),
    var(--tw-ring-offset-shadow),
    var(--tw-ring-shadow),
    var(--tw-shadow),
    ${value}
  `);
}

export default getTwBoxShadow;
