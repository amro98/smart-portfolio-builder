import { useState, type FormEvent } from "react";
import { useI18n } from '@/lib/i18n';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { passwordRuleError } from "./password-rules";
import { PasswordRequirements } from "./components/password-requirements";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const { t } = useI18n();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(() => searchParams.get("authError") ?? undefined);
  const provider = providerLabel(searchParams.get("provider"));

  function validate(): boolean {
    const next: FormErrors = {};
    if (!fullName.trim()) {
      next.fullName = t('auth.register.errors.fullName.required');
    }
    if (!email.trim()) {
      next.email = t('auth.register.errors.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = t('auth.register.errors.email.invalid');
    }
    const passwordError = passwordRuleError(password);
    if (passwordError) {
      next.password = t(passwordError);
    }
    if (!confirmPassword) {
      next.confirmPassword = t('auth.register.errors.confirmPassword.required');
    } else if (password !== confirmPassword) {
      next.confirmPassword = t('auth.register.errors.confirmPassword.mismatch');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function clearError(field: keyof FormErrors) {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!validate()) return;

    setLoading(true);
    setSubmitError(undefined);
    try {
      const response = await authApi.register(email.trim(), password, fullName.trim());
      login(response.user);
      toast.success(t('auth.register.toast.success'));
      navigate("/onboarding");
    } catch (err: unknown) {
      const code = authErrorCode(err);
      // The server has the final say on the password policy; surface it on the field.
      if (code === 'WEAK_PASSWORD') setErrors((prev) => ({ ...prev, password: t('auth.password.requirementsNotMet') }));
      else setSubmitError(code ?? 'UNKNOWN');
    } finally {
      setLoading(false);
    }
  }

  const existingAccount = isExistingAccountCode(submitError);
  // Mismatch shows live once the confirm field has been left (or on submit), separate from the checklist.
  const confirmError =
    errors.confirmPassword ??
    (confirmTouched && confirmPassword && password !== confirmPassword ? t('auth.register.errors.confirmPassword.mismatch') : undefined);

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
                    {t('auth.register.brand')}
                  </span>
                </div>
                <h2 className="text-3xl font-bold leading-tight mb-4">
                  {t('auth.register.marketing.heading')}
                </h2>
                <p className="text-white/80 text-base leading-relaxed">
                  {t('auth.register.marketing.description')}
                </p>
              </div>
              <p className="relative flex items-center gap-2 text-sm text-white/60"><span className="h-px w-8 bg-brand" aria-hidden />
                {t('auth.register.marketing.footer')}
              </p>
            </div>

            <div className="flex flex-col justify-center px-6 pb-10 pt-20 sm:px-10 md:px-12 md:py-8 lg:px-20 [&>*]:mx-auto [&>*]:w-full [&>*]:max-w-md">
              <div className="flex items-center gap-2 mb-6 md:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-primary shadow-sm">
                  <Layers className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {t('auth.register.brand')}
                </span>
              </div>

              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {t('auth.register.title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  {t('auth.register.description')}
                </CardDescription>
              </CardHeader>

              {submitError && (
                <AuthNotice
                  variant="error"
                  className="mb-5"
                  title={existingAccount ? t('auth.errors.accountExistsTitle') : undefined}
                  actions={
                    existingAccount ? (
                      <>
                        <Link to="/login" state={{ email: email.trim() }} className="font-medium text-primary hover:text-primary-hover">
                          {t('auth.register.signIn')}
                        </Link>
                        <Link to="/forgot-password" state={{ email: email.trim() }} className="font-medium text-primary hover:text-primary-hover">
                          {t('auth.login.forgotPassword')}
                        </Link>
                      </>
                    ) : undefined
                  }
                >
                  {t(authErrorKey(submitError), { provider })}
                </AuthNotice>
              )}

              <SocialAuthButtons intent="register" />
              <AuthDivider />

              <form onSubmit={handleSubmit} method="post" noValidate>
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">
                      {t('auth.register.fullNameLabel')}
                    </Label>
                    <Input
                      id="fullName"
                      name="name"
                      type="text"
                      placeholder={t('auth.register.fullNamePlaceholder')}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearError("fullName");
                      }}
                      className={errors.fullName ? "border-destructive" : ""}
                      autoComplete="name"
                      aria-invalid={!!errors.fullName}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      {t('auth.register.emailLabel')}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      placeholder={t('auth.register.emailPlaceholder')}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                        if (existingAccount) setSubmitError(undefined);
                      }}
                      className={errors.email || existingAccount ? "border-destructive" : ""}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      aria-invalid={!!errors.email || existingAccount}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">
                      {t('auth.register.passwordLabel')}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('auth.register.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearError("password");
                        }}
                        className={`pe-10 ${errors.password ? "border-destructive" : ""}`}
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        aria-describedby="password-requirements"
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
                      <p className="text-sm text-destructive">
                        {errors.password}
                      </p>
                    )}
                    <PasswordRequirements id="password-requirements" password={password} showErrors={attemptedSubmit} />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-foreground"
                    >
                      {t('auth.register.confirmPasswordLabel')}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t('auth.register.confirmPasswordPlaceholder')}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          clearError("confirmPassword");
                        }}
                        onBlur={() => setConfirmTouched(true)}
                        className={`pe-10 ${confirmError ? "border-destructive" : ""}`}
                        autoComplete="new-password"
                        aria-invalid={!!confirmError}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={t(showConfirmPassword ? 'auth.password.hide' : 'auth.password.show')}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmError && (
                      <p className="text-sm text-destructive">
                        {confirmError}
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col p-0 mt-8 gap-4">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="me-2 h-5 w-5 animate-spin" />
                        {t('auth.register.submitting')}
                      </>
                    ) : (
                      <>
                        {t('auth.register.submit')}
                        <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('auth.register.hasAccount')}{" "}
                    <Link
                      to="/login"
                      className="text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                      {t('auth.register.signIn')}
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
