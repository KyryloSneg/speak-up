import { useStorage, type Serializer } from "@vueuse/core";

const volumeSerializer: Serializer<number[]> = {
  read(raw: string): number[] {
    try {
      const parsed = JSON.parse(raw);

      if (
        !Array.isArray(parsed) ||
        parsed.length === 0 ||
        typeof parsed[0] !== "number"
      ) {
        return [100];
      }

      return [Math.max(0, Math.min(200, parsed[0]))];
    } catch {
      return [100];
    }
  },
  write(value: number[]): string {
    const number =
      Array.isArray(value) && value.length > 0 && typeof value[0] === "number"
        ? value[0]
        : 100;

    const clamped = Math.max(0, Math.min(200, number));
    if (Array.isArray(value)) value[0] = clamped;

    return JSON.stringify([clamped]);
  },
};

function useCustomVolume(userId: string, type: "user" | "screenSharing") {
  return useStorage<number[]>(`${userId}-${type}`, [100], localStorage, {
    serializer: volumeSerializer,
  });
}

export default useCustomVolume;
