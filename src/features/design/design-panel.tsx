import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Check, LayoutTemplate, ListOrdered, Monitor, Moon, Palette, RotateCcw, SlidersHorizontal, Sparkles, Sun, Type, Wand2, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { colorPaletteList } from '@/lib/presets/colors';
import { fontPresetList } from '@/lib/presets/fonts';
import { animationPresetList } from '@/lib/presets/animations';
import { professionList } from '@/lib/presets/professions';
import { getTemplate, templateList } from '@/lib/presets/templates';
import { getRecommendedStyle, rankTemplatesForProfession } from '@/lib/presets/recommendations';
import { defaultDesign } from '@/lib/design/design-settings';
import type { ProfessionCategory, ThemeMode } from '@/types';
import { ControlGroup, ControlLabel } from './controls/control-group';
import { TemplateCard } from './controls/template-card';
import { SectionsControl } from './controls/sections-control';
import type { DesignDraft } from './use-design-draft';

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function Choice({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn('relative rounded-md border-2 text-start transition-all', selected ? 'border-primary bg-primary-soft' : 'border-border bg-card hover:border-input hover:bg-accent/60', className)}
    >
      {children}
      {selected && <Check className="absolute end-2 top-2 h-3.5 w-3.5 text-primary" />}
    </button>
  );
}

/** Every design control, editing the local draft only — nothing here talks to the backend. */
export function DesignPanel({ draft }: { draft: DesignDraft }) {
  const { t } = useI18n();
  const { design, change, replace } = draft;
  const template = getTemplate(design.templateId);
  const ranked = useMemo(() => rankTemplatesForProfession(design.profession, 4), [design.profession]);
  const rankOf = (id: string) => ranked.find((r) => r.template.id === id)?.rank;
  const others = templateList.filter((tpl) => !rankOf(tpl.id));
  const recommended = getRecommendedStyle(design.profession);
  const [accentInput, setAccentInput] = useState(design.customAccentColor);
  const [resetOpen, setResetOpen] = useState(false);
  // Follow external changes (discard, reset, recommended style); partial typing doesn't commit.
  useEffect(() => setAccentInput(design.customAccentColor), [design.customAccentColor]);
  const fixedMode = template.colorModes.length === 1;

  const applyRecommended = () => {
    change(recommended);
    toast.success(t('design.recommended.applied'), { description: t('design.recommended.appliedHint') });
  };

  const commitAccent = (value: string) => {
    const v = value.trim();
    if (v === '' || HEX.test(v)) change({ customAccentColor: v });
  };

  const modes: { value: ThemeMode; icon: React.ElementType; label: string }[] = [
    { value: 'auto', icon: Monitor, label: t('design.theme.auto') },
    { value: 'light', icon: Sun, label: t('common.light') },
    { value: 'dark', icon: Moon, label: t('common.dark') },
  ];

  return (
    <div>
      <ControlGroup icon={LayoutTemplate} title={t('design.group.template')} summary={template.name} defaultOpen>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t(`templates.${template.id}.description`)}</p>
        {ranked.length > 0 && (
          <>
            <ControlLabel>{t('design.template.recommendedFor', { profession: t(`profession.${design.profession}`) })}</ControlLabel>
            <div className="mb-5 grid grid-cols-2 gap-2.5">
              {ranked.map(({ template: tpl, rank }) => (
                <TemplateCard key={tpl.id} template={tpl} rank={rank} compact selected={design.templateId === tpl.id} onSelect={() => change({ templateId: tpl.id })} />
              ))}
            </div>
          </>
        )}
        <ControlLabel>{ranked.length > 0 ? t('design.template.more') : t('design.template.all')}</ControlLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {others.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} compact selected={design.templateId === tpl.id} onSelect={() => change({ templateId: tpl.id })} />
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">{t('design.template.contentSafe')}</p>
      </ControlGroup>

      <ControlGroup icon={Wand2} title={t('design.group.profession')} summary={t(`profession.${design.profession}`)}>
        <ControlLabel>{t('design.profession.label')}</ControlLabel>
        <Select value={design.profession} onValueChange={(v) => change({ profession: v as ProfessionCategory })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {professionList.map((p) => <SelectItem key={p.id} value={p.id}>{t(`profession.${p.id}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="mt-2 text-xs text-muted-foreground">{t('design.profession.hint')}</p>

        <ControlLabel className="mt-5">{t('design.profession.ranking')}</ControlLabel>
        <ol className="space-y-1.5">
          {ranked.map(({ template: tpl, rank }) => (
            <li key={tpl.id}>
              <button type="button" onClick={() => change({ templateId: tpl.id })} className={cn('flex w-full items-center gap-3 rounded-md border px-3 py-2 text-start text-sm transition-colors', design.templateId === tpl.id ? 'border-primary bg-primary-soft' : 'border-border bg-card hover:border-input hover:bg-accent/60')}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-soft-foreground">{rank}</span>
                <span className="h-4 w-4 shrink-0 rounded-full border border-border" style={{ background: `linear-gradient(135deg, ${tpl.swatch.background} 50%, ${tpl.swatch.accent} 50%)` }} />
                <span className="min-w-0 flex-1 truncate font-medium">{tpl.name}</span>
                {design.templateId === tpl.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-lg border border-primary/25 bg-primary-soft p-3.5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-soft-foreground"><Sparkles className="h-3.5 w-3.5" />{t('design.recommended.title')}</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <dt className="text-muted-foreground">{t('design.group.template')}</dt><dd className="font-medium">{getTemplate(recommended.templateId).name}</dd>
            <dt className="text-muted-foreground">{t('design.group.colors')}</dt><dd className="font-medium">{t(`palette.${recommended.colorPaletteId}`)}</dd>
            <dt className="text-muted-foreground">{t('design.group.animation')}</dt><dd className="font-medium">{t(`animation.${recommended.animationPresetId}`)}</dd>
            <dt className="text-muted-foreground">{t('design.group.sections')}</dt><dd className="font-medium">{recommended.sectionOrder.filter((s) => recommended.sectionVisibility[s]).length}</dd>
          </dl>
          <Button type="button" size="sm" variant="outline" className="mt-3 w-full gap-2 border-primary/30 text-primary-soft-foreground hover:bg-card hover:text-primary-hover" onClick={applyRecommended}>
            <Sparkles className="h-4 w-4" /> {t('design.recommended.apply')}
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">{t('design.recommended.note')}</p>
        </div>
      </ControlGroup>

      <ControlGroup icon={Palette} title={t('design.group.colors')} summary={t(`palette.${design.colorPaletteId}`)}>
        <ControlLabel>{t('design.theme.title')}</ControlLabel>
        <div className="grid grid-cols-3 gap-1.5">
          {modes.map((m) => (
            <Choice key={m.value} selected={design.themeMode === m.value} onClick={() => change({ themeMode: m.value })} className="flex flex-col items-center gap-1 px-2 py-2.5 text-xs font-medium">
              <m.icon className="h-4 w-4" /> {m.label}
            </Choice>
          ))}
        </div>
        {fixedMode && <p className="mt-2 text-[11px] text-muted-foreground">{t('design.theme.fixed', { template: template.name, mode: t(template.defaultMode === 'dark' ? 'common.dark' : 'common.light') })}</p>}

        <ControlLabel className="mt-5">{t('design.colors.palette')}</ControlLabel>
        <div className="grid grid-cols-2 gap-2">
          {colorPaletteList.map((p) => (
            <Choice key={p.id} selected={design.colorPaletteId === p.id} onClick={() => change({ colorPaletteId: p.id })} className="p-2.5">
              <span className="flex gap-1">
                <span className="h-4 w-4 rounded-full border border-border" style={{ background: p.accent }} />
                <span className="h-4 w-4 rounded-full border border-border" style={{ background: `hsl(${p.dark.primary})` }} />
                <span className="h-4 w-4 rounded-full border border-border" style={{ background: `hsl(${p.light.secondary})` }} />
              </span>
              <span className="mt-1.5 block truncate pe-4 text-xs font-medium">{t(`palette.${p.id}`)}</span>
            </Choice>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{t('design.colors.neutralHint')}</p>

        <ControlLabel className="mt-5">{t('design.colors.accent')}</ControlLabel>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={t('design.colors.accent')}
            value={HEX.test(accentInput) && accentInput.length === 7 ? accentInput : '#6366f1'}
            onChange={(e) => {
              setAccentInput(e.target.value);
              commitAccent(e.target.value);
            }}
            className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-input bg-card p-0.5 shadow-sm"
          />
          <Input
            dir="ltr"
            placeholder="#3b82f6"
            value={accentInput}
            onChange={(e) => {
              setAccentInput(e.target.value);
              commitAccent(e.target.value);
            }}
            className="h-9"
          />
          {design.customAccentColor && (
            <Button type="button" variant="ghost" size="sm" onClick={() => { setAccentInput(''); change({ customAccentColor: '' }); }}>
              {t('design.colors.clear')}
            </Button>
          )}
        </div>
      </ControlGroup>

      <ControlGroup icon={Type} title={t('design.group.typography')} summary={t(`font.${design.fontPresetId}`)}>
        <div className="space-y-1.5">
          {fontPresetList.map((f) => (
            <Choice key={f.id} selected={design.fontPresetId === f.id} onClick={() => change({ fontPresetId: f.id })} className="block w-full px-3 py-2.5">
              <span className="block pe-5 text-base font-semibold" style={f.headingFamily ? { fontFamily: f.headingFamily } : undefined}>
                {t(`font.${f.id}`)}
              </span>
              <span className="block text-xs text-muted-foreground" style={f.bodyFamily ? { fontFamily: f.bodyFamily } : undefined}>
                {f.id === 'signature' ? t('font.signature.hint', { template: template.name }) : t(`font.${f.id}.hint`)}
              </span>
            </Choice>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup icon={Zap} title={t('design.group.animation')} summary={t(`animation.${design.animationPresetId}`)}>
        <div className="space-y-1.5">
          {animationPresetList.map((a) => (
            <Choice key={a.id} selected={design.animationPresetId === a.id} onClick={() => change({ animationPresetId: a.id })} className="block w-full px-3 py-2.5">
              <span className="block text-sm font-semibold">{t(`animation.${a.id}`)}</span>
              <span className="block pe-5 text-xs text-muted-foreground">{t(`animation.${a.id}.hint`)}</span>
            </Choice>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup icon={ListOrdered} title={t('design.group.sections')} summary={t('design.sections.summary', { count: design.sectionOrder.filter((s) => design.sectionVisibility[s]).length })}>
        <SectionsControl order={design.sectionOrder} visibility={design.sectionVisibility} onChange={change} />
      </ControlGroup>

      <ControlGroup icon={SlidersHorizontal} title={t('design.group.advanced')}>
        <p className="text-sm font-semibold">{t('design.reset.defaultsTitle')}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('design.reset.defaultsDescription')}</p>
        <Button type="button" variant="outline" size="sm" className="mt-3 gap-2" onClick={() => setResetOpen(true)}>
          <RotateCcw className="h-4 w-4" /> {t('design.reset.defaults')}
        </Button>
      </ControlGroup>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={t('design.reset.defaultsTitle')}
        description={t('design.reset.defaultsConfirm')}
        confirmLabel="design.reset.defaults"
        cancelLabel="design.cancel"
        onConfirm={() => {
          replace(defaultDesign(design.profession));
          setAccentInput('');
          setResetOpen(false);
        }}
      />
    </div>
  );
}
