function generateRandomHEX(): string {
  const possibleValues = "0123456789ABCDEF";

  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += possibleValues[Math.floor(Math.random() * 16)];
  }

  return color;
}

export default generateRandomHEX;
