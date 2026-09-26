import { useEffect, useState } from 'react';
import { Link, useBlocker, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import {
  AlertCircle, Check, ChevronsLeft, ChevronsRight, ExternalLink, Loader2, Menu, Monitor, Paintbrush, Smartphone, Tablet, Undo2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { LoadingPage } from '@/components/shared/loading-card';
import { usePortfolio } from '@/lib/query/hooks';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { editorNavItems } from '@/app/layouts/editor-nav';
import type { Portfolio } from '@/types';
import { DesignPanel } from './design-panel';
import { PreviewStage, type PreviewDevice } from './preview-stage';
import { useDesignDraft } from './use-design-draft';

const DEVICE_ICONS: Record<PreviewDevice, React.ElementType> = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

function useIsDesktop() {
  const query = '(min-width: 1024px)';
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return matches;
}

function Workspace({ portfolio }: { portfolio: Portfolio }) {
  const { t, dir } = useI18n();
  const draft = useDesignDraft(portfolio);
  const isDesktop = useIsDesktop();
  const [device, setDevice] = useState<PreviewDevice>(() => (window.innerWidth < 768 ? 'mobile' : 'desktop'));
  const [panelOpen, setPanelOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetDrag = useDragControls();

  // Never lose unsaved design changes silently: in-app navigation asks first, and closing or
  // reloading the tab triggers the browser's own prompt.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => draft.dirty && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (!draft.dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [draft.dirty]);

  const status = draft.saveState === 'saving'
    ? { icon: Loader2, label: t('design.status.saving'), cls: 'text-muted-foreground', spin: true }
    : draft.saveState === 'error'
      ? { icon: AlertCircle, label: t('design.status.error'), cls: 'text-destructive' }
      : draft.dirty
        ? { icon: AlertCircle, label: t('design.status.unsaved'), cls: 'text-warning-soft-foreground' }
        : { icon: Check, label: t('design.status.saved'), cls: 'text-success-soft-foreground' };

  const devices = (
    <div role="radiogroup" aria-label={t('design.device.label')} className="flex h-9 items-center gap-0.5 rounded-lg border border-border bg-surface-secondary p-0.5">
      {(Object.keys(DEVICE_ICONS) as PreviewDevice[]).map((d) => {
        const Icon = DEVICE_ICONS[d];
        return (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={device === d}
            onClick={() => setDevice(d)}
            className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', device === d ? 'bg-primary-soft text-primary-soft-foreground shadow-sm ring-1 ring-primary/30' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden xl:inline">{t(`design.device.${d}`)}</span>
          </button>
        );
      })}
    </div>
  );

  const saveButton = (
    <Button size="sm" onClick={() => void draft.save()} disabled={!draft.dirty || draft.saveState === 'saving'} className="gap-2">
      {draft.saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
      {draft.saveState === 'error' ? t('design.retry') : t('design.save')}
    </Button>
  );

  const CollapseIcon = (dir === 'rtl') === panelOpen ? ChevronsRight : ChevronsLeft;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card">
      {/* Toolbar */}
      <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-card px-3 py-2.5 md:px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t('design.editorMenu')}><Menu className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="truncate">{portfolio.fullName || portfolio.slug}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {editorNavItems(portfolio.id).map((item) => (
              <DropdownMenuItem key={item.to} asChild>
                <Link to={item.to} className="cursor-pointer gap-2.5"><item.icon className="h-4 w-4 text-muted-foreground" />{t(item.labelKey)}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="min-w-0 me-auto">
          <h1 className="truncate text-sm font-semibold text-foreground">{t('design.title')}</h1>
          <p className={cn('flex items-center gap-1 text-xs', status.cls)} role="status" aria-live="polite">
            <status.icon className={cn('h-3.5 w-3.5', status.spin && 'animate-spin')} /> {status.label}
          </p>
        </div>
        {devices}
        {portfolio.isPublished && (
          <Button asChild variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex">
            <a href={`/u/${portfolio.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />{t('design.publicView')}</a>
          </Button>
        )}
        {draft.dirty && (
          <Button variant="outline" size="sm" onClick={draft.discard} disabled={draft.saveState === 'saving'} className="gap-1.5">
            <Undo2 className="h-4 w-4" /><span className="hidden sm:inline">{t('design.discard')}</span>
          </Button>
        )}
        {saveButton}
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Desktop controls panel */}
        {isDesktop && (
          <motion.aside
            initial={false}
            animate={{ width: panelOpen ? 380 : 52 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-[1] flex shrink-0 flex-col overflow-hidden border-e border-border bg-workspace shadow-[4px_0_16px_-8px_hsl(var(--shadow-color)/0.14)] rtl:shadow-[-4px_0_16px_-8px_hsl(var(--shadow-color)/0.14)]"
          >
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-2">
              {panelOpen && <span className="flex items-center gap-2 px-2 text-sm font-semibold text-foreground"><Paintbrush className="h-4 w-4 text-primary" />{t('design.controls')}</span>}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPanelOpen((o) => !o)} aria-label={t(panelOpen ? 'design.collapse' : 'design.expand')} aria-expanded={panelOpen}>
                <CollapseIcon className="h-4 w-4" />
              </Button>
            </div>
            {panelOpen ? (
              <div className="min-h-0 w-[380px] flex-1 overflow-y-auto overscroll-contain">
                <DesignPanel draft={draft} />
              </div>
            ) : (
              <button type="button" onClick={() => setPanelOpen(true)} className="flex flex-1 flex-col items-center pt-4 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label={t('design.expand')}>
                <span className="text-xs font-semibold [writing-mode:vertical-rl]">{t('design.controls')}</span>
              </button>
            )}
          </motion.aside>
        )}

        {/* Live preview */}
        <div className="min-w-0 flex-1">
          <PreviewStage portfolioId={portfolio.id} design={draft.design} device={device} />
        </div>

        {/* Small screens: controls as a bottom sheet over the preview */}
        {!isDesktop && (
          <>
            {!sheetOpen && (
              <Button onClick={() => setSheetOpen(true)} className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 gap-2 rounded-full px-5 shadow-xl">
                <Paintbrush className="h-4 w-4" /> {t('design.customize')}
                {draft.dirty && <span className="h-2 w-2 rounded-full bg-warning ring-2 ring-primary-foreground/80" />}
              </Button>
            )}
            <AnimatePresence>
              {sheetOpen && (
                <motion.div
                  role="dialog"
                  aria-label={t('design.controls')}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                  drag="y"
                  dragListener={false}
                  dragControls={sheetDrag}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.6 }}
                  onDragEnd={(_, info) => { if (info.offset.y > 120) setSheetOpen(false); }}
                  className="absolute inset-x-0 bottom-0 z-20 flex h-[62%] flex-col rounded-t-2xl border-t border-border bg-workspace shadow-[0_-12px_40px_-12px_hsl(var(--shadow-color)/0.35)]"
                >
                  {/* Only the handle area drags the sheet; the settings below scroll normally. */}
                  <div onPointerDown={(e) => sheetDrag.start(e)} className="flex shrink-0 cursor-grab touch-none flex-col items-center border-b border-border px-3 pb-2 pt-2 active:cursor-grabbing">
                    <span className="h-1.5 w-10 rounded-full bg-input" />
                    <div className="mt-2 flex w-full items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground"><Paintbrush className="h-4 w-4 text-primary" />{t('design.controls')}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSheetOpen(false)} aria-label={t('design.closeControls')}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    <DesignPanel draft={draft} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => { if (!open && blocker.state === 'blocked') blocker.reset(); }}
        title={t('design.leave.title')}
        description={t('design.leave.description')}
        confirmLabel="design.leave.confirm"
        cancelLabel="design.leave.stay"
        destructive
        onConfirm={() => blocker.state === 'blocked' && blocker.proceed()}
      />
    </div>
  );
}

export default function DesignPage() {
  const { portfolioId } = useParams();
  const { data: portfolio, isLoading } = usePortfolio(portfolioId);
  if (isLoading || !portfolio) return <LoadingPage />;
  // Keyed by portfolio so switching portfolios starts from that portfolio's own saved design.
  return <Workspace key={portfolio.id} portfolio={portfolio} />;
}
