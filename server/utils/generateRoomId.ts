import { customAlphabet } from "nanoid";

export const roomIdAlphabet = "bcdfghjkmnpqrstvwxyz23456789";
const generateSegment = customAlphabet(roomIdAlphabet);

function generateRoomId(): string {
  const firstPart = generateSegment(3);
  const secondPart = generateSegment(4);
  const thirdPart = generateSegment(3);

  return `${firstPart}-${secondPart}-${thirdPart}`;
}

export default generateRoomId;
