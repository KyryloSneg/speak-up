function getRegularShadow(color: string): string {
  return `0 1px 3px 1px ${color}, 0 2px 6px 2px ${color}`;
}

export default getRegularShadow;
