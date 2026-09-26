import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { DesignSettings } from '@/lib/design/design-settings';
import { usePushDesignToFrame } from '@/features/preview/preview-bridge';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

// Logical viewport of each device. The iframe is laid out at this real size (so the
// portfolio's media queries see a genuine desktop/tablet/phone) and scaled down to fit.
const DEVICES: Record<PreviewDevice, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844 },
};

const GUTTER = 24;

/**
 * The live preview: one persistent iframe of /portfolios/:id/preview-frame. Switching device
 * only resizes it (no reload, scroll position kept); the unsaved design draft is streamed in
 * via the preview bridge on every change.
 */
export function PreviewStage({ portfolioId, design, device }: { portfolioId: string; design: DesignSettings; device: PreviewDevice }) {
  const { t } = useI18n();
  const areaRef = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  usePushDesignToFrame(frame, portfolioId, design);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setArea({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const spec = DEVICES[device];
  const availW = Math.max(0, area.w - GUTTER * 2);
  const availH = Math.max(0, area.h - GUTTER * 2);
  // Desktop fills the available height (the page scrolls inside); tablet/phone fit entirely.
  const scale =
    device === 'desktop'
      ? Math.min(1, availW / spec.width)
      : Math.min(1, availW / spec.width, availH / spec.height);
  const frameHeight = device === 'desktop' ? (scale > 0 ? availH / scale : spec.height) : spec.height;
  const framed = device !== 'desktop';

  return (
    // dir="ltr": the scale/centering math assumes left-to-right layout (an over-wide child in
    // an RTL box overflows to the left and would scale off-screen). The portfolio inside the
    // iframe keeps its own language and direction.
    <div ref={areaRef} dir="ltr" className="relative h-full w-full overflow-hidden bg-canvas bg-[radial-gradient(hsl(var(--muted-foreground)/0.16)_1px,transparent_1px)] [background-size:16px_16px]">
      {area.w > 0 && (
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: spec.width * scale,
            height: frameHeight * scale,
            transform: 'translate(-50%, -50%)',
            transition: 'width 350ms cubic-bezier(.16,1,.3,1), height 350ms cubic-bezier(.16,1,.3,1)',
          }}
        >
          <div
            className={cn('origin-top-left overflow-hidden bg-card shadow-2xl ring-1 ring-border', framed ? 'rounded-[28px]' : 'rounded-lg')}
            style={{ width: spec.width, height: frameHeight, transform: `scale(${scale})` }}
          >
            <iframe
              ref={setFrame}
              src={`/portfolios/${portfolioId}/preview-frame`}
              title={t('design.preview.title')}
              onLoad={() => setLoaded(true)}
              className="block h-full w-full border-0"
            />
          </div>
        </div>
      )}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
