'use client';

import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

import { getCroppedBlob } from '@/utils/cropImage';

interface AvatarCropDialogProps {
  file: File;
  onCancel: () => void;
  onCropped: (blob: Blob) => Promise<void> | void;
}

export const AvatarCropDialog = ({ file, onCancel, onCropped }: AvatarCropDialogProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read the picked file as a data URL: no blob-URL lifecycle to manage, and it
  // survives React's dev double-invoke (a revoked blob URL broke the crop step).
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setImageSrc(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  }, [file]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => setAreaPixels(pixels), []);

  const handleSave = async () => {
    if (!imageSrc || !areaPixels) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await getCroppedBlob(imageSrc, areaPixels, 512);
      await onCropped(blob);
    } catch (err) {
      console.error('Crop/upload failed', err);
      setError('Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-4">
        <h3 className="mb-3 text-lg font-semibold text-white">Crop your picture</h3>
        <div className="relative h-64 w-full overflow-hidden rounded bg-neutral-800">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-neutral-400">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            disabled={busy}
            className="flex-1 accent-brand-500"
            aria-label="Zoom"
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg px-4 py-2 text-sm text-neutral-300 transition-colors hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || !areaPixels}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
