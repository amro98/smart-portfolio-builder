import { useState, type FormEvent } from "react";
import { useI18n } from '@/lib/i18n';
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store";
import { authApi } from "@/lib/api/client";
import { AuthNotice } from "./components/auth-notice";
import { AuthDivider, SocialAuthButtons } from "./components/social-auth-buttons";
import { authErrorCode, authErrorKey, isExistingAccountCode, providerLabel } from "./auth-errors";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const { t } = useI18n();

  // Prefilled when arriving from "Sign in instead" on the register page (router state, so
  // the address never lands in the URL or history).
  const [email, setEmail] = useState(() => (location.state as { email?: string } | null)?.email ?? "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  // Error from this form's submit, or one handed over by the OAuth callback redirect.
  const [submitError, setSubmitError] = useState<string | undefined>(() => searchParams.get("authError") ?? undefined);
  const provider = providerLabel(searchParams.get("provider"));
  const resetSucceeded = searchParams.get("reset") === "success";

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) {
      next.email = t('auth.login.errors.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = t('auth.login.errors.email.invalid');
    }
    if (!password) {
      next.password = t('auth.login.errors.password.required');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError(undefined);
    try {
      const response = await authApi.login(email.trim(), password, rememberMe);
      login(response.user);
      toast.success(t('auth.login.toast.welcome'));
      navigate('/portfolios');
    } catch (err: unknown) {
      setSubmitError(authErrorCode(err) ?? 'UNKNOWN');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl"
      >
        <Card className="overflow-hidden border shadow-lg">
          <div className="grid md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-teal-600 to-cyan-700 p-10 text-white">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-semibold tracking-tight">
                    {t('auth.login.brand')}
                  </span>
                </div>
                <h2 className="text-3xl font-bold leading-tight mb-4">
                  {t('auth.login.marketing.heading')}
                </h2>
                <p className="text-white/80 text-base leading-relaxed">
                  {t('auth.login.marketing.description')}
                </p>
              </div>
              <p className="text-sm text-white/60">
                {t('auth.login.trusted')}
              </p>
            </div>

            <div className="p-6 sm:p-8 md:p-10">
              <div className="flex items-center gap-2 mb-6 md:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {t('auth.login.brand')}
                </span>
              </div>

              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {t('auth.login.title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  {t('auth.login.description')}
                </CardDescription>
              </CardHeader>

              {resetSucceeded && !submitError && (
                <AuthNotice variant="success" title={t('auth.reset.successTitle')} className="mb-5">
                  {t('auth.reset.successDescription')}
                </AuthNotice>
              )}

              {submitError && (
                <AuthNotice
                  variant="error"
                  className="mb-5"
                  title={isExistingAccountCode(submitError) ? t('auth.errors.accountExistsTitle') : undefined}
                  actions={
                    isExistingAccountCode(submitError) || submitError === 'INVALID_CREDENTIALS' ? (
                      <Link to="/forgot-password" state={{ email }} className="font-medium text-teal-600 hover:text-teal-700">
                        {t('auth.login.forgotPassword')}
                      </Link>
                    ) : undefined
                  }
                >
                  {t(authErrorKey(submitError), { provider })}
                </AuthNotice>
              )}

              {/* A real <form> with name/autocomplete attributes so browser password managers
                  recognise it and offer to save/fill credentials. We never store the password. */}
              <form onSubmit={handleSubmit} method="post" noValidate>
                <CardContent className="p-0 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      {t('auth.login.emailLabel')}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      placeholder={t('auth.login.emailPlaceholder')}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={errors.email ? "border-destructive" : ""}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">
                      {t('auth.login.passwordLabel')}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('auth.login.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password)
                            setErrors((prev) => ({
                              ...prev,
                              password: undefined,
                            }));
                        }}
                        className={`pe-10 ${errors.password ? "border-destructive" : ""}`}
                        autoComplete="current-password"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={t(showPassword ? 'auth.password.hide' : 'auth.password.show')}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="text-sm text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="rememberMe"
                        name="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <Label htmlFor="rememberMe" className="cursor-pointer text-sm font-normal text-foreground">
                        {t('auth.login.rememberMe')}
                      </Label>
                    </div>
                    <Link
                      to="/forgot-password"
                      state={{ email }}
                      className="text-sm text-teal-600 hover:text-teal-700 transition-colors font-medium"
                    >
                      {t('auth.login.forgotPassword')}
                    </Link>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col p-0 mt-6">
                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 text-base font-medium transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="me-2 h-5 w-5 animate-spin" />
                        {t('auth.login.submitting')}
                      </>
                    ) : (
                      <>
                        {t('auth.login.submit')}
                        <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>

              <AuthDivider />
              <SocialAuthButtons intent="login" remember={rememberMe} />

              <p className="mt-6 text-sm text-muted-foreground text-center">
                {t('auth.login.noAccount')}{" "}
                <Link
                  to="/register"
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  {t('auth.login.createAccount')}
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
