type ObjectEntriesResult<T extends object> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

const objectEntries = <T extends object>(obj: T): ObjectEntriesResult<T> => {
  return Object.entries(obj) as ObjectEntriesResult<T>;
};

export default objectEntries;
