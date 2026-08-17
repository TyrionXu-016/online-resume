"use client";

import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { AuthActionResult } from "@/modules/auth/actions";
import { credentialsSchema, emailSchema, passwordSchema } from "@/modules/auth/schemas";

const inputClassName =
  "mt-1 w-full rounded-[8px] border border-border bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-primary";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[12px] text-red-600">{message}</p>;
}

export function CredentialsForm({
  action,
  submitLabel,
  next,
  successMessage,
  mode = "login",
}: {
  action: (prev: AuthActionResult, formData: FormData) => Promise<AuthActionResult>;
  submitLabel: string;
  next?: string;
  successMessage?: string;
  mode?: "login" | "register";
}) {
  const [state, formAction] = useActionState(action, {});
  const [pending, startTransition] = useTransition();
  const form = useForm<z.input<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      className="mt-8 flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) => {
        const data = new FormData();
        data.set("email", values.email);
        data.set("password", values.password);
        if (next) data.set("next", next);
        startTransition(() => {
          formAction(data);
        });
      })}
    >
      <label className="text-[13px] font-medium text-ink">
        邮箱
        <input type="email" autoComplete="email" className={inputClassName} {...form.register("email")} />
        <FieldError message={form.formState.errors.email?.message} />
      </label>
      <label className="text-[13px] font-medium text-ink">
        密码
        <input
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className={inputClassName}
          {...form.register("password")}
        />
        <FieldError message={form.formState.errors.password?.message} />
      </label>
      {state.error ? <p className="text-[13px] text-red-600">{state.error.message}</p> : null}
      {state.checkEmail && successMessage ? (
        <p className="text-[13px] text-success">{successMessage}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[9px] bg-primary px-4 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
      >
        {pending ? "提交中…" : submitLabel}
      </button>
    </form>
  );
}

export function EmailForm({
  action,
  submitLabel,
  successMessage,
}: {
  action: (prev: AuthActionResult, formData: FormData) => Promise<AuthActionResult>;
  submitLabel: string;
  successMessage: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const [pending, startTransition] = useTransition();
  const form = useForm<z.input<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  return (
    <form
      className="mt-8 flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) => {
        const data = new FormData();
        data.set("email", values.email);
        startTransition(() => {
          formAction(data);
        });
      })}
    >
      <label className="text-[13px] font-medium text-ink">
        邮箱
        <input type="email" autoComplete="email" className={inputClassName} {...form.register("email")} />
        <FieldError message={form.formState.errors.email?.message} />
      </label>
      {state.error ? <p className="text-[13px] text-red-600">{state.error.message}</p> : null}
      {state.checkEmail ? <p className="text-[13px] text-success">{successMessage}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[9px] bg-primary px-4 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
      >
        {pending ? "提交中…" : submitLabel}
      </button>
    </form>
  );
}

export function PasswordForm({
  action,
  submitLabel,
}: {
  action: (prev: AuthActionResult, formData: FormData) => Promise<AuthActionResult>;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const [pending, startTransition] = useTransition();
  const form = useForm<z.input<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  return (
    <form
      className="mt-8 flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) => {
        const data = new FormData();
        data.set("password", values.password);
        startTransition(() => {
          formAction(data);
        });
      })}
    >
      <label className="text-[13px] font-medium text-ink">
        新密码
        <input
          type="password"
          autoComplete="new-password"
          className={inputClassName}
          {...form.register("password")}
        />
        <FieldError message={form.formState.errors.password?.message} />
      </label>
      {state.error ? <p className="text-[13px] text-red-600">{state.error.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[9px] bg-primary px-4 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
      >
        {pending ? "提交中…" : submitLabel}
      </button>
    </form>
  );
}
