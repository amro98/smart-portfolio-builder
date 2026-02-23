import { useState, type FormEvent } from "react";
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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function validate(): boolean {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
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
      toast.success("Reset link sent to your email");
    } catch {
      toast.error("Something went wrong. Please try again.");
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
            Smart Portfolio Builder
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
                  Check your email
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  We sent a password reset link to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Please check your inbox and follow the instructions.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 pb-2">
                <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 text-teal-600 shrink-0" />
                    <p>
                      If you don&apos;t see the email, check your spam folder.
                      The link will expire in 24 hours.
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
                  Try a different email
                </Button>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back to sign in
                </Link>
              </CardFooter>
            </motion.div>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Forgot your password?
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Enter your email and we&apos;ll send you a link to reset your
                  password.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
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
                        <Mail className="mr-2 h-4 w-4" />
                        Send reset link
                      </>
                    )}
                  </Button>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to sign in
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
