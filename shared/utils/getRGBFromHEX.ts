function getRGBFromHEX(hex: string): [r: number, g: number, b: number] {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);

  return [red, green, blue];
}

export default getRGBFromHEX;
