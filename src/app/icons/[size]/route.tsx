import { ImageResponse } from 'next/og';

const SIZES: Record<string, number> = { '192': 192, '512': 512 };

export const dynamic = 'force-static';

export function generateStaticParams() {
  return Object.keys(SIZES).map(size => ({ size }));
}

// Generates the PWA icons as a brand-colored disc on the dark app background.
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const dim = SIZES[size] ?? 512;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#191919'
      }}
    >
      <div
        style={{
          width: dim * 0.64,
          height: dim * 0.64,
          borderRadius: '50%',
          background: '#217efd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: dim * 0.26,
            height: dim * 0.26,
            borderRadius: '50%',
            background: '#191919'
          }}
        />
      </div>
    </div>,
    { width: dim, height: dim }
  );
}
