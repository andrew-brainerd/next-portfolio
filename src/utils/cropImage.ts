import type { Area } from 'react-easy-crop';

// Canvas/DOM side-effect helper (exempt from unit tests per project conventions):
// given a source image URL and a pixel crop area from react-easy-crop, draw the
// cropped region onto a square canvas of `size`×`size` and return a JPEG blob.
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load image'));
    image.src = src;
  });

export const getCroppedBlob = async (
  imageSrc: string,
  area: Area,
  size = 512
): Promise<Blob> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Could not crop image'))),
      'image/jpeg',
      0.9
    );
  });
};
