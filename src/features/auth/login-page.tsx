import { useState, type FormEvent } from "react";
import { useI18n } from '@/lib/i18n';
import { Link, useNavigate } from "react-router-dom";
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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) {
      next.email = t('auth.login.errors.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = t('auth.login.errors.email.invalid');
    }
    if (!password) {
      next.password = t('auth.login.errors.password.required');
    } else if (password.length < 6) {
      next.password = t('auth.login.errors.password.min');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      login(response.user, response.token);
      toast.success(t('auth.login.toast.welcome'));
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      toast.error(message);
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

            <div className="p-8 md:p-10">
              <div className="flex items-center gap-2 mb-6 md:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {t('auth.login.brand')}
                </span>
              </div>

              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {t('auth.login.title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  {t('auth.login.description')}
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="p-0 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      {t('auth.login.emailLabel')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.login.emailPlaceholder')}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={errors.email ? "border-destructive" : ""}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground">
                        {t('auth.login.passwordLabel')}
                      </Label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-teal-600 hover:text-teal-700 transition-colors font-medium"
                      >
                        {t('auth.login.forgotPassword')}
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
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
                        className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
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
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col p-0 mt-8 gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 text-base font-medium transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {t('auth.login.submit')}
                        <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 h-4 w-4 rtl:rotate-180" />
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('auth.login.noAccount')} {" "}
                    <Link
                      to="/register"
                      className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                    >
                      {t('auth.login.createAccount')}
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
