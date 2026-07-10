type Implementation = (...args: any[]) => any;
type ConstructorImplementation = new (...args: any[]) => any;
type AnyImplementation = Implementation | ConstructorImplementation;

function safeMockFn<BaseImplementation extends AnyImplementation>(
  implementation?: BaseImplementation,
): BaseImplementation {
  const implementationToUse =
    implementation || ((() => {}) as unknown as BaseImplementation);

  const vitestVi = (globalThis as any).vi;
  if (vitestVi) return vitestVi.fn(implementationToUse);

  return implementationToUse;
}

export default safeMockFn;
