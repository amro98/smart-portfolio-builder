import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, KeyRound, Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { authApi } from "@/lib/api/client";
import { useAuthStore } from "@/store";
import { AuthNotice } from "./components/auth-notice";
import { authErrorCode, authErrorKey } from "./auth-errors";
import { passwordRuleError } from "./password-rules";
import { PasswordRequirements } from "./components/password-requirements";

type TokenState = "checking" | "valid" | "invalid";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") ?? "");

  // Keep the token in memory only: drop it from the address bar so it doesn't linger in
  // history or get shared by copy/paste.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("token")) return;
    url.searchParams.delete("token");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);
  const [tokenState, setTokenState] = useState<TokenState>(token ? "checking" : "invalid");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    authApi
      .verifyResetToken(token)
      .then((valid) => !cancelled && setTokenState(valid ? "valid" : "invalid"))
      // If the check itself fails (network), still let the user try; submit reports errors.
      .catch(() => !cancelled && setTokenState("valid"));
    return () => {
      cancelled = true;
    };
  }, [token]);

  function validate() {
    const next: typeof errors = {};
    const rule = passwordRuleError(password);
    if (rule) next.password = t(rule);
    if (!confirmPassword) next.confirmPassword = t("auth.register.errors.confirmPassword.required");
    else if (password !== confirmPassword) next.confirmPassword = t("auth.register.errors.confirmPassword.mismatch");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!validate()) return;
    setLoading(true);
    setSubmitError(undefined);
    try {
      await authApi.resetPassword(token, password);
      // Every session for this account was revoked server-side; drop any local identity too.
      useAuthStore.getState().logout();
      navigate("/login?reset=success", { replace: true });
    } catch (err) {
      const code = authErrorCode(err) ?? "UNKNOWN";
      if (code === "WEAK_PASSWORD") {
        setErrors((prev) => ({ ...prev, password: t("auth.password.requirementsNotMet") }));
        return;
      }
      if (code === "RESET_TOKEN_INVALID" || code === "RESET_TOKEN_EXPIRED") setTokenState("invalid");
      setSubmitError(code);
    } finally {
      setLoading(false);
    }
  }

  // Mismatch shows live once the confirm field has been left (or on submit), separate from the checklist.
  const confirmError =
    errors.confirmPassword ??
    (confirmTouched && confirmPassword && password !== confirmPassword ? t("auth.register.errors.confirmPassword.mismatch") : undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-foreground">{t("auth.forgotPassword.brand")}</span>
        </div>

        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">{t("auth.reset.title")}</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">{t("auth.reset.description")}</CardDescription>
          </CardHeader>

          {tokenState === "checking" && (
            <CardContent className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label={t("auth.reset.checking")} />
            </CardContent>
          )}

          {tokenState === "invalid" && (
            <>
              <CardContent>
                <AuthNotice variant="error" title={t("auth.reset.invalidTitle")}>
                  {t(submitError === "RESET_TOKEN_EXPIRED" ? "auth.errors.resetTokenExpired" : "auth.reset.invalidDescription")}
                </AuthNotice>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button asChild className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white">
                  <Link to="/forgot-password">{t("auth.reset.requestNew")}</Link>
                </Button>
                <Link to="/login" className="inline-flex items-center justify-center text-sm text-teal-600 hover:text-teal-700 font-medium">
                  <ArrowLeft className="me-1.5 h-4 w-4 rtl:rotate-180" />
                  {t("auth.forgotPassword.backToSignIn")}
                </Link>
              </CardFooter>
            </>
          )}

          {tokenState === "valid" && (
            <form onSubmit={handleSubmit} method="post" noValidate>
              <CardContent className="space-y-4">
                {submitError && <AuthNotice variant="error">{t(authErrorKey(submitError))}</AuthNotice>}
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("auth.reset.newPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      className={`pe-10 ${errors.password ? "border-destructive" : ""}`}
                      autoComplete="new-password"
                      autoFocus
                      aria-invalid={!!errors.password}
                      aria-describedby="new-password-requirements"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={t(showPassword ? "auth.password.hide" : "auth.password.show")}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  <PasswordRequirements id="new-password-requirements" password={password} showErrors={attemptedSubmit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">{t("auth.reset.confirmPassword")}</Label>
                  <Input
                    id="confirm-new-password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    onBlur={() => setConfirmTouched(true)}
                    className={confirmError ? "border-destructive" : ""}
                    autoComplete="new-password"
                    aria-invalid={!!confirmError}
                  />
                  {confirmError && <p className="text-sm text-destructive">{confirmError}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 text-base font-medium" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="me-2 h-5 w-5 animate-spin" />
                      {t("auth.reset.submitting")}
                    </>
                  ) : (
                    <>
                      <KeyRound className="me-2 h-4 w-4" />
                      {t("auth.reset.submit")}
                    </>
                  )}
                </Button>
                <Link to="/login" className="inline-flex items-center justify-center text-sm text-teal-600 hover:text-teal-700 font-medium">
                  <ArrowLeft className="me-1.5 h-4 w-4 rtl:rotate-180" />
                  {t("auth.forgotPassword.backToSignIn")}
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
