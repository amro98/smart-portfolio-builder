import { useEffect, useState } from 'react';
import type { DesignSettings } from '@/lib/design/design-settings';

// Live-preview channel between the Design & Preview workspace (parent) and the
// /portfolios/:id/preview-frame iframe (child). The iframe renders the saved portfolio
// content; the parent streams the *unsaved* design draft to it, so every design change is
// visible instantly without touching the backend. Same-origin only, and a message is only
// accepted from the exact counterpart window.

const DESIGN = 'spb:preview:design';
const READY = 'spb:preview:ready';

type DesignMessage = { type: typeof DESIGN; portfolioId: string; design: DesignSettings };
type ReadyMessage = { type: typeof READY; portfolioId: string };

function isMessage<T extends { type: string }>(data: unknown, type: T['type']): data is T {
  return typeof data === 'object' && data !== null && (data as { type?: unknown }).type === type;
}

/** Parent side: pushes the draft into the iframe now, on every change, and whenever the frame (re)loads. */
export function usePushDesignToFrame(frame: HTMLIFrameElement | null, portfolioId: string, design: DesignSettings) {
  useEffect(() => {
    if (!frame) return;
    const send = () => {
      frame.contentWindow?.postMessage({ type: DESIGN, portfolioId, design } satisfies DesignMessage, window.location.origin);
    };
    send();
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.contentWindow) return;
      if (isMessage<ReadyMessage>(event.data, READY) && event.data.portfolioId === portfolioId) send();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [frame, portfolioId, design]);
}

/** Child side: the latest design draft from the parent workspace, or null when not embedded. */
export function useDesignFromParent(portfolioId: string | undefined): DesignSettings | null {
  const [design, setDesign] = useState<DesignSettings | null>(null);
  useEffect(() => {
    if (!portfolioId || window.parent === window) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (isMessage<DesignMessage>(event.data, DESIGN) && event.data.portfolioId === portfolioId) setDesign(event.data.design);
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: READY, portfolioId } satisfies ReadyMessage, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, [portfolioId]);
  return design;
}
