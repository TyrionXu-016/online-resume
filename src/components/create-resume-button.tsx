"use client";

import { useActionState } from "react";
import { createResumeAction, type ResumeActionResult } from "@/modules/resume/actions";

export function CreateResumeButton({
  className = "rounded-[9px] bg-primary px-3 py-2 text-[13px] font-medium text-white disabled:opacity-60",
}: {
  className?: string;
}) {
  const [state, action, pending] = useActionState<ResumeActionResult, FormData>(createResumeAction, {});

  return (
    <form action={action} className="inline-flex flex-col items-end gap-1">
      <button type="submit" disabled={pending} className={className}>
        {pending ? "创建中…" : "创建新简历"}
      </button>
      {state.error ? <p className="text-[12px] text-red-600">{state.error.message}</p> : null}
    </form>
  );
}
