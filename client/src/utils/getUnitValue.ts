function getUnitValue(fullValue: string): number {
  // "100px" => 100
  return +fullValue.replaceAll(/[^0-9\.\-]/gi, "");
}

export default getUnitValue;
