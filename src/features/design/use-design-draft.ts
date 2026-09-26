import { useCallback, useMemo, useState } from 'react';
import { useUpdatePortfolio } from '@/lib/query/hooks';
import { designEquals, designPatch, pickDesign, type DesignSettings } from '@/lib/design/design-settings';
import type { Portfolio } from '@/types';

export type SaveState = 'idle' | 'saving' | 'error';

/**
 * Local, unsaved design state for the Design & Preview workspace.
 *
 *   saved portfolio (React Query) → local draft → live preview → Save → one PATCH
 *
 * The draft is `null` until the user changes something; while it's null the workspace simply
 * mirrors the saved design (so refetches are reflected). Once the user edits, the draft is
 * owned locally and server refetches can never overwrite it. Saving persists every design
 * field in one update; failures keep the draft so the user can retry.
 */
export function useDesignDraft(portfolio: Portfolio) {
  const saved = useMemo(() => pickDesign(portfolio), [portfolio]);
  const [draft, setDraft] = useState<DesignSettings | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const update = useUpdatePortfolio(portfolio.id);

  const design = draft ?? saved;
  const dirty = draft !== null && !designEquals(draft, saved);

  const change = useCallback(
    (patch: Partial<DesignSettings>) => {
      setDraft((current) => ({ ...(current ?? saved), ...patch }));
      setSaveState((s) => (s === 'error' ? 'idle' : s));
    },
    [saved]
  );

  const replace = useCallback((next: DesignSettings) => setDraft(next), []);

  /** Drops unsaved changes and returns to the last saved design. */
  const discard = useCallback(() => {
    setDraft(null);
    setSaveState('idle');
  }, []);

  const save = useCallback(async () => {
    if (!draft) return true;
    setSaveState('saving');
    try {
      await update.mutateAsync(designPatch(draft));
      // The mutation wrote the saved portfolio into the query cache, so dropping the draft
      // shows exactly what was saved — the preview doesn't change.
      setDraft(null);
      setSaveState('idle');
      return true;
    } catch {
      setSaveState('error');
      return false;
    }
  }, [draft, update]);

  return { design, saved, dirty, saveState, change, replace, discard, save };
}

export type DesignDraft = ReturnType<typeof useDesignDraft>;
