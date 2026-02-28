import { useState, type FormEvent } from "react";
import { useI18n } from '@/lib/i18n';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function validate(): boolean {
    if (!email.trim()) {
      setError(t('auth.forgotPassword.errors.email.required'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.forgotPassword.errors.email.invalid'));
      return false;
    }
    setError("");
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
      toast.success(t('auth.forgotPassword.toast.linkSent'));
    } catch {
      toast.error(t('auth.forgotPassword.toast.error'));
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
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            {t('auth.forgotPassword.brand')}
          </span>
        </div>

        <Card className="border shadow-lg">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                  <CheckCircle className="h-7 w-7 text-teal-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {t('auth.forgotPassword.successTitle')}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  {t('auth.forgotPassword.successDescription')}
                  <span className="font-medium text-foreground">{email}</span>
                  . {t('auth.forgotPassword.successInstructions')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 pb-2">
                <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 text-teal-600 shrink-0" />
                    <p>
                      {t('auth.forgotPassword.successNote')}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-4">
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                >
                  {t('auth.forgotPassword.tryDifferentEmail')}
                </Button>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  <ArrowLeft className="mr-1.5 rtl:mr-0 rtl:ml-1.5 h-4 w-4" />
                  {t('auth.forgotPassword.backToSignIn')}
                </Link>
              </CardFooter>
            </motion.div>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {t('auth.forgotPassword.title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  {t('auth.forgotPassword.description')}
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      {t('auth.forgotPassword.emailLabel')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.forgotPassword.emailPlaceholder')}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className={error ? "border-destructive" : ""}
                      autoComplete="email"
                      autoFocus
                    />
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 text-base font-medium transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Mail className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />
                        {t('auth.forgotPassword.submitButton')}
                      </>
                    )}
                  </Button>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    <ArrowLeft className="mr-1.5 rtl:mr-0 rtl:ml-1.5 h-4 w-4 rtl:rotate-180" />
                    {t('auth.forgotPassword.backToSignIn')}
                  </Link>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
