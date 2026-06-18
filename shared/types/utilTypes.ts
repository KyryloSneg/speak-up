export type OptionalField<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type Invert<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};
