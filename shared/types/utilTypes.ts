export type OptionalField<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type Invert<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};

export type EqualKeysAndValues<T extends Record<PropertyKey, unknown>> = {
  [K in keyof T]: K;
};

export type MapValue<T> = T extends Map<unknown, infer V> ? V : never;
