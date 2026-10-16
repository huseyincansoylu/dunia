"use client";

import { useActionState } from "react";
import { MailCheckIcon } from "lucide-react";
import {
  chooseUsername,
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
  type AuthFormState,
} from "@/app/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-rules";
import { AuthField, FormError, SubmitButton } from "./auth-fields";
import { AuthHeading, TextLink } from "./auth-shell";
import { UsernameField } from "./username-field";

const withNext = (path: string, next: string) => (next === "/atlas" ? path : `${path}?next=${encodeURIComponent(next)}`);

function CheckInbox({ title, email, children }: { title: string; email?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4" role="status">
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
        <MailCheckIcon className="size-6" />
      </span>
      <AuthHeading title={title} />
      <p className="text-muted-foreground">
        We sent an email to <strong className="font-medium text-foreground">{email}</strong>. {children} It can
        take a minute to arrive, and it may land in spam.
      </p>
    </div>
  );
}

export function SignInForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signIn, {});

  return (
    <form action={action} className="grid gap-5" noValidate>
      <AuthHeading title="Sign in to Dunia">Welcome back. Your map is where you left it.</AuthHeading>
      <FormError message={state.error ?? notice} />
      <input type="hidden" name="next" value={next} />
      <AuthField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <AuthField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
        aside={<TextLink href="/forgot-password">Forgot password?</TextLink>}
      />
      <SubmitButton pending={pending} pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
      <p className="text-sm text-muted-foreground">
        New to Dunia? <TextLink href={withNext("/signup", next)}>Create an account</TextLink>
      </p>
    </form>
  );
}

export function SignUpForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signUp, {});

  if (state.sent) {
    return (
      <CheckInbox title="Confirm your email" email={state.email}>
        Open the link in it to finish creating your account. Your map will live at dunia/{state.username}.
      </CheckInbox>
    );
  }

  return (
    <form action={action} className="grid gap-5" noValidate>
      <AuthHeading title="Create your map">Pick your address and sign up. It takes a few seconds.</AuthHeading>
      <FormError message={state.error} />
      <input type="hidden" name="next" value={next} />
      <UsernameField defaultValue={state.username} error={state.fieldErrors?.username} />
      <AuthField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <AuthField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        error={state.fieldErrors?.password}
      />
      <SubmitButton pending={pending} pendingLabel="Creating your account…">
        Create account
      </SubmitButton>
      <p className="text-sm text-muted-foreground">
        Already have an account? <TextLink href={withNext("/login", next)}>Sign in</TextLink>
      </p>
    </form>
  );
}

export function ForgotPasswordForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(requestPasswordReset, {});

  if (state.sent) {
    return (
      <CheckInbox title="Check your inbox" email={state.email}>
        If there&apos;s an account for this address, the email has a link to choose a new password.
      </CheckInbox>
    );
  }

  return (
    <form action={action} className="grid gap-5" noValidate>
      <AuthHeading title="Reset your password">
        Enter your email and we&apos;ll send you a link to choose a new one.
      </AuthHeading>
      <FormError message={state.error ?? notice} />
      <AuthField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <SubmitButton pending={pending} pendingLabel="Sending…">
        Send reset link
      </SubmitButton>
      <p className="text-sm text-muted-foreground">
        Remembered it? <TextLink href="/login">Sign in</TextLink>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ email }: { email?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(updatePassword, {});

  return (
    <form action={action} className="grid gap-5" noValidate>
      <AuthHeading title="Choose a new password">
        {email ? <>For {email}.</> : null} You&apos;ll stay signed in after saving it.
      </AuthHeading>
      <FormError message={state.error} />
      {/* Lets password managers attach the new password to the right account. */}
      {email && <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />}
      <AuthField
        id="password"
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        error={state.fieldErrors?.password}
      />
      <AuthField
        id="confirm"
        name="confirm"
        type="password"
        label="Repeat new password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirm}
      />
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save password
      </SubmitButton>
    </form>
  );
}

export function WelcomeForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(chooseUsername, {});

  return (
    <form action={action} className="grid gap-5" noValidate>
      <AuthHeading title="Pick your username">
        It&apos;s the address of your map, the link you&apos;ll put in your bio.
      </AuthHeading>
      <FormError message={state.error} />
      <UsernameField defaultValue={state.username} error={state.fieldErrors?.username} />
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Continue
      </SubmitButton>
    </form>
  );
}
