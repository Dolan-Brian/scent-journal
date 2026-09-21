import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Top Notes — Private Fragrance Journal" },
      {
        name: "description",
        content:
          "Sign in or create an account on Top Notes, a private journal for the fragrances you've sampled, rated, and bought.",
      },
      { property: "og:title", content: "Top Notes — Private Fragrance Journal" },
      {
        property: "og:description",
        content: "A private journal for the fragrances you've sampled, rated, and bought.",
      },
    ],
  }),
  component: SignInPage,
});

type Mode = "signin" | "signup";

function friendlyMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "That email already has an account. Try signing in instead.";
  if (m.includes("invalid login credentials"))
    return "That email and password don't match an account.";
  if (m.includes("password should be at least"))
    return "Please choose a password of at least 6 characters.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email address first — check your inbox for the link.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled"))
    return "New accounts aren't being accepted at the moment.";
  return message;
}

function SignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/library", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setPending(false);
      if (error) {
        toast.error(friendlyMessage(error.message));
        return;
      }
      if (!data.session) {
        setConfirmSent(true);
        return;
      }
      navigate({ to: "/library", replace: true });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) {
      toast.error(friendlyMessage(error.message));
      return;
    }
    navigate({ to: "/library", replace: true });
  }

  function switchMode(next: Mode) {
    setMode(next);
    setConfirmSent(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl tracking-tight text-foreground">Top Notes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your private record of every fragrance you've tried.
        </p>

        {!isSupabaseConfigured && (
          <p className="mt-6 rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
            Database connection not configured yet — add your Supabase project URL and publishable
            key to enable sign-in.
          </p>
        )}

        <div className="mt-8 flex gap-1 rounded-md border border-border p-1">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className={`flex-1 rounded px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.2em] transition-colors ${
              mode === "signin"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 rounded px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.2em] transition-colors ${
              mode === "signup"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign up
          </button>
        </div>

        {confirmSent ? (
          <div className="mt-6 rounded-md border border-border bg-muted p-4">
            <p className="font-serif text-lg text-foreground">Check your email</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to {email}. Open it to finish creating your account, then
              come back and sign in.
            </p>
            <Button variant="ghost" className="mt-3 px-0" onClick={() => switchMode("signin")}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={mode === "signup" ? 6 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">At least 6 characters.</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={pending || !isSupabaseConfigured}>
              {pending
                ? mode === "signup"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
