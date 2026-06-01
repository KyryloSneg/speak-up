import type { User } from "#generated/prisma/client.ts";
import { mockUserWithoutId } from "#tests/utils/consts.ts";

function getUniqueMockUserWithoutId(): Omit<User, "id"> {
  const result = { ...mockUserWithoutId };
  result.username = `${result.username}_${crypto.randomUUID()}`;

  return result;
}

export default getUniqueMockUserWithoutId;
