import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Github, Layers, Link2, Loader2, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { authApi } from "@/lib/api/client";
import { useAuthStore } from "@/store";
import type { SocialPending } from "@/types";
import { AuthNotice } from "./components/auth-notice";
import { GoogleMark } from "./components/social-auth-buttons";
import { authErrorCode, authErrorKey, isExistingAccountCode } from "./auth-errors";

type State =
  | { status: "loading" }
  | { status: "ready"; pending: SocialPending }
  | { status: "error"; code: string; linking: boolean; providerLabel: string };

/**
 * Shown after a provider sign-in whose identity isn't linked to any account yet. Nothing has
 * been created or linked at this point; that only happens once the user confirms.
 *
 * - "signup" mode: no account uses this email → confirm to create one.
 * - "link" mode: an account already uses this (provider-verified) email → confirm to add this
 *   provider to that same account.
 */
export default function SocialConfirmPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ status: "loading" });
  const [action, setAction] = useState<"confirm" | "cancel" | null>(null);

  useEffect(() => {
    let cancelled = false;
    authApi
      .socialPending()
      .then(({ pending }) => !cancelled && setState({ status: "ready", pending }))
      .catch(
        (err) => !cancelled && setState({ status: "error", code: authErrorCode(err) ?? "UNKNOWN", linking: false, providerLabel: "" })
      );
    return () => {
      cancelled = true;
    };
  }, []);

  async function confirm(pending: SocialPending) {
    setAction("confirm");
    try {
      const { user, created, linked } = await authApi.socialConfirm();
      // login() drops any other identity's cached private data before the new user renders.
      useAuthStore.getState().login(user);
      toast.success(
        linked
          ? t("auth.social.linkSuccess", { provider: pending.providerLabel })
          : t(created ? "auth.register.toast.success" : "auth.login.toast.welcome")
      );
      navigate(created ? "/onboarding" : "/portfolios", { replace: true });
    } catch (err) {
      setState({
        status: "error",
        code: authErrorCode(err) ?? "UNKNOWN",
        linking: pending.mode === "link",
        providerLabel: pending.providerLabel,
      });
      setAction(null);
    }
  }

  async function cancel() {
    setAction("cancel");
    // Clearing the pending marker is best-effort: it also expires on its own within minutes.
    await authApi.socialCancel().catch(() => undefined);
    navigate("/login", { replace: true });
  }

  const pending = state.status === "ready" ? state.pending : null;
  const isLink = pending?.mode === "link";
  const providerIcon =
    pending?.provider === "github" ? <Github className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /> : <GoogleMark />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-primary shadow-sm">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">{t("auth.forgotPassword.brand")}</span>
        </div>

        <Card className="border-border-warm shadow-elevated">
          {state.status === "loading" && (
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label={t("common.loading")} />
            </CardContent>
          )}

          {state.status === "error" && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {t(state.linking ? "auth.social.linkFailedTitle" : "auth.social.confirmUnavailableTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AuthNotice
                  variant="error"
                  title={isExistingAccountCode(state.code) ? t("auth.errors.accountExistsTitle") : undefined}
                  actions={
                    isExistingAccountCode(state.code) ? (
                      <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-hover">
                        {t("auth.login.forgotPassword")}
                      </Link>
                    ) : undefined
                  }
                >
                  {t(authErrorKey(state.code), { provider: state.providerLabel })}
                </AuthNotice>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full h-11">
                  <Link to="/login" replace>
                    <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
                    {t("auth.forgotPassword.backToSignIn")}
                  </Link>
                </Button>
              </CardFooter>
            </>
          )}

          {pending && (
            <>
              <CardHeader>
                {isLink && (
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
                    <Link2 className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                )}
                <CardTitle className="text-2xl font-bold">
                  {isLink ? t("auth.social.linkTitle") : t("auth.social.confirmTitle", { provider: pending.providerLabel })}
                </CardTitle>
                <CardDescription className="mt-1">
                  {isLink ? t("auth.social.linkQuestion", { provider: pending.providerLabel }) : t("auth.social.confirmDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="divide-y rounded-lg border">
                  {!isLink && pending.name && (
                    <div className="flex items-center gap-3 p-3">
                      <UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <dt className="w-24 shrink-0 text-sm text-muted-foreground">{t("auth.social.name")}</dt>
                      <dd className="min-w-0 truncate text-sm font-medium" dir="auto">{pending.name}</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <dt className="w-24 shrink-0 text-sm text-muted-foreground">
                      {t(isLink ? "auth.social.existingEmail" : "auth.social.email")}
                    </dt>
                    {/* Wrapped, never truncated: this is the address the user is agreeing to. */}
                    <dd className="min-w-0 break-all text-sm font-medium" dir="ltr">{pending.email}</dd>
                  </div>
                  <div className="flex items-center gap-3 p-3">
                    {providerIcon}
                    <dt className="w-24 shrink-0 text-sm text-muted-foreground">{t("auth.social.provider")}</dt>
                    <dd className="text-sm font-medium">{pending.providerLabel}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-muted-foreground">
                  {isLink ? t("auth.social.linkNote", { provider: pending.providerLabel }) : t("auth.social.confirmNote")}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full h-11" onClick={() => void confirm(pending)} disabled={action !== null}>
                  {action === "confirm" ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t(isLink ? "auth.social.linking" : "auth.social.confirming")}
                    </>
                  ) : (
                    t(isLink ? "auth.social.linkButton" : "auth.social.confirmButton")
                  )}
                </Button>
                <Button variant="outline" className="w-full h-11" onClick={() => void cancel()} disabled={action !== null}>
                  {action === "cancel" && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t("auth.social.cancelButton")}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
