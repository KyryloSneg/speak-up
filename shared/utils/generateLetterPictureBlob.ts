import type { SKRSContext2D } from "@napi-rs/canvas";
import { LETTER_PICTURE_SIZE } from "./consts.ts";
import generateRandomHEX from "./generateRandomHEX.ts";
import getContrastColorToUse from "./getContrastColor.ts";
import getNameInitials from "./getNameInitials.ts";

async function generateLetterPictureBlob(
  name: string,
  size: number = LETTER_PICTURE_SIZE,
): Promise<Blob | null> {
  const isServerCode = typeof window === "undefined";
  name = getNameInitials(name);

  if (isServerCode) {
    const { createCanvas } = await import("@napi-rs/canvas");
    const canvas = createCanvas(size, size);

    const context = canvas.getContext("2d");
    if (!context) return null;

    drawLetterPicture(context, name, size, isServerCode);

    const blob = new Blob([(await canvas.encode("png")) as BlobPart], {
      type: "image/png",
    });

    return blob;
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;

    const context = canvas.getContext("2d");
    if (!context) return null;

    drawLetterPicture(context, name, size, isServerCode);

    const blob = new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, "image/png"),
    );

    return blob;
  }
}

function drawLetterPicture(
  context: CanvasRenderingContext2D | SKRSContext2D,
  name: string,
  size: number,
  isServerCode: boolean,
): void {
  const bgColor = generateRandomHEX();

  context.fillStyle = `${bgColor}`;
  context.fillRect(0, 0, size, size);

  context.fillStyle = getContrastColorToUse(bgColor);
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.font = `${size / 2}px Georgia`;

  // generating picture on the client somehow doesn't perfectly align the text
  const additionalY = isServerCode ? 0 : Math.floor(size / 17);
  context.fillText(name, size / 2, size / 2 + additionalY);
}

export default generateLetterPictureBlob;
