function formatCommaSeparatedCss(value: string): string {
  return value
    .replaceAll(/\s+/g, " ")
    .replaceAll(/\(\s+/g, "(")
    .replaceAll(/\s+\)/g, ")")
    .trim();
}

export default formatCommaSeparatedCss;
