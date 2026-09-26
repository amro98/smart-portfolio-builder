import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuthStore } from "@/store";

/**
 * Landing page after a provider sign-in for an already-linked account. The API has just set
 * the session cookie; the app's normal auth bootstrap (GET /auth/me) picks it up — clearing
 * any other identity's cached data — and we route on from there.
 */
export default function SocialCompletePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const authChecked = useAuthStore((s) => s.authChecked);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const handled = useRef(false);

  useEffect(() => {
    if (!authChecked || handled.current) return;
    handled.current = true;
    if (isAuthenticated) {
      toast.success(t("auth.login.toast.welcome"));
      navigate("/portfolios", { replace: true });
    } else {
      navigate("/login?authError=oauth_failed", { replace: true });
    }
  }, [authChecked, isAuthenticated, navigate, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("auth.social.signingIn")}</p>
      </div>
    </div>
  );
}
