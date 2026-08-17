"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  deleteResumeAction,
  duplicateResumeAction,
  updateResumeMetaAction,
  type ResumeActionResult,
} from "@/modules/resume/actions";
import type { ResumeSummary } from "@/modules/resume";

const inputClassName =
  "mt-1 w-full rounded-[8px] border border-border bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-primary";

function statusLabel(status: string) {
  if (status === "PUBLISHED") {
    return "已发布";
  }

  return "草稿";
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(new Date(value));
}

export function ResumeCard({ resume }: { resume: ResumeSummary }) {
  const [editing, setEditing] = useState(false);
  const [duplicateState, duplicateAction, duplicating] = useActionState<ResumeActionResult, FormData>(
    duplicateResumeAction,
    {},
  );
  const [deleteState, deleteAction, deleting] = useActionState<ResumeActionResult, FormData>(
    deleteResumeAction,
    {},
  );
  const [metaState, metaAction, savingMeta] = useActionState<ResumeActionResult, FormData>(
    updateResumeMetaAction,
    {},
  );

  const error = duplicateState.error ?? deleteState.error ?? metaState.error;
  const published = resume.status === "PUBLISHED";

  return (
    <li className="rounded-[12px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-[16px] font-medium text-ink">{resume.title}</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-[12px] ${
                published ? "bg-green-50 text-success" : "bg-canvas text-muted"
              }`}
            >
              {statusLabel(resume.status)}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-muted">
            最后更新：{formatUpdatedAt(resume.updatedAt)} · /u/{resume.slug}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/editor/${resume.id}`}
            className="rounded-[9px] bg-primary px-3 py-2 text-[13px] font-medium text-white"
          >
            编辑
          </Link>
          <form action={duplicateAction}>
            <input type="hidden" name="resumeId" value={resume.id} />
            <button
              type="submit"
              disabled={duplicating}
              className="rounded-[9px] border border-border px-3 py-2 text-[13px] text-ink disabled:opacity-60"
            >
              {duplicating ? "复制中…" : "复制"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setEditing((open) => !open)}
            className="rounded-[9px] border border-border px-3 py-2 text-[13px] text-ink"
          >
            {editing ? "取消" : "改标题 / 地址"}
          </button>
          <form
            action={deleteAction}
            onSubmit={(event) => {
              if (!window.confirm("确定删除这份简历？删除后可从列表消失，地址暂不可复用。")) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="resumeId" value={resume.id} />
            <button
              type="submit"
              disabled={deleting}
              className="rounded-[9px] px-3 py-2 text-[13px] text-red-600 disabled:opacity-60"
            >
              {deleting ? "删除中…" : "删除"}
            </button>
          </form>
        </div>
      </div>

      {editing ? (
        <form action={metaAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input type="hidden" name="resumeId" value={resume.id} />
          <label className="text-[13px] font-medium text-ink">
            标题
            <input
              name="title"
              defaultValue={resume.title}
              maxLength={160}
              className={inputClassName}
            />
          </label>
          <label className="text-[13px] font-medium text-ink">
            公开地址
            <input
              name="slug"
              defaultValue={resume.slug}
              maxLength={80}
              className={inputClassName}
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={savingMeta}
              className="rounded-[9px] border border-border px-3 py-2 text-[13px] text-ink disabled:opacity-60"
            >
              {savingMeta ? "保存中…" : "保存"}
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="mt-3 text-[13px] text-red-600">{error.message}</p> : null}
    </li>
  );
}
