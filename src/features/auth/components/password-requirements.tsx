import { Check, Circle, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { PASSWORD_RULES } from '../password-rules';

/**
 * Live checklist of the new-password rules. Each rule turns green as soon as it's satisfied;
 * unmet rules stay neutral while typing and turn red once the user has tried to submit.
 */
export function PasswordRequirements({ id, password, showErrors }: { id: string; password: string; showErrors: boolean }) {
  const { t } = useI18n();
  return (
    <div id={id} className="rounded-md border border-border/70 bg-muted/30 px-3 py-2.5">
      <p className="text-xs font-medium text-muted-foreground">{t('auth.password.requirementsTitle')}</p>
      <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          const failed = !met && showErrors;
          const Icon = met ? Check : failed ? X : Circle;
          return (
            <li
              key={rule.id}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                met ? 'text-teal-600 dark:text-teal-400' : failed ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5 shrink-0', !met && !failed && 'h-2.5 w-2.5 mx-0.5')} aria-hidden />
              <span>{t(rule.labelKey)}</span>
              {/* State for screen readers, since the icon/colour alone isn't announced. */}
              <span className="sr-only">{met ? t('auth.password.ruleMet') : t('auth.password.ruleNotMet')}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
