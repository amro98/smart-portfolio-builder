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
import { AuthBrandDecor } from "./components/auth-brand-decor";
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
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen w-full"
      >
        {/* Full-page split: brand panel on one half, form on the other. */}
        <Card className="min-h-screen overflow-hidden rounded-none border-0 shadow-none">
          <div className="grid min-h-screen md:grid-cols-2">
            <div className="relative hidden md:flex flex-col justify-between overflow-hidden bg-sidebar p-10 text-white lg:p-14">
              <AuthBrandDecor />
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-primary shadow-lg shadow-brand/30 ring-1 ring-white/10">
                    <Layers className="h-6 w-6 text-primary-foreground" />
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
              <p className="relative flex items-center gap-2 text-sm text-white/60"><span className="h-px w-8 bg-brand" aria-hidden />
                {t('auth.login.trusted')}
              </p>
            </div>

            <div className="flex flex-col justify-center px-6 pb-10 pt-20 sm:px-10 md:px-12 md:py-8 lg:px-20 [&>*]:mx-auto [&>*]:w-full [&>*]:max-w-md">
              <div className="flex items-center gap-2 mb-6 md:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-primary shadow-sm">
                  <Layers className="h-5 w-5 text-primary-foreground" />
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
                      <Link to="/forgot-password" state={{ email }} className="font-medium text-primary hover:text-primary-hover">
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
                      className="text-sm text-primary hover:text-primary-hover transition-colors font-medium"
                    >
                      {t('auth.login.forgotPassword')}
                    </Link>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col p-0 mt-6">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium transition-all"
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
                  className="text-primary hover:text-primary-hover font-medium transition-colors"
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
