function waitAfterEmit(): Promise<void> {
  return new Promise(res => setTimeout(res, 50));
}

export default waitAfterEmit;
