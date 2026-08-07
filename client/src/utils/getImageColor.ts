function getImageColor(src: string): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 1;
      canvas.height = 1;

      if (!ctx) {
        rej("Canvas context not supported");
        return;
      }

      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

      res(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = e => rej(e);
  });
}

export default getImageColor;
