class StringActions {
  static capitalize(str: string): string {
    return `${(str?.[0] || "").toUpperCase()}${str.slice(1)}`;
  }
}

export default StringActions;
