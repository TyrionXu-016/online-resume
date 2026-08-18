"use client";

import Link from "next/link";
import { useAutosave } from "@/hooks/use-autosave";
import { useEditorStore } from "@/stores/editor-store";

function saveStatusLabel(status: string) {
  switch (status) {
    case "dirty":
      return "未保存";
    case "saving":
      return "保存中…";
    case "saved":
      return "已保存";
    case "error":
      return "保存失败";
    default:
      return "";
  }
}

export function EditorToolbar() {
  const title = useEditorStore((state) => state.title);
  const slug = useEditorStore((state) => state.slug);
  const saveStatus = useEditorStore((state) => state.saveStatus);
  const conflictError = useEditorStore((state) => state.conflictError);
  const { retrySave } = useAutosave();

  return (
    <header className="border-b border-border bg-white">
      {conflictError ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-[13px] text-amber-900">
          {conflictError}{" "}
          <button type="button" className="underline" onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      ) : null}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="shrink-0 rounded-[9px] border border-border px-3 py-2 text-[13px] text-ink"
          >
            返回工作台
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-semibold text-ink">{title}</h1>
            <p className="truncate text-[12px] text-muted">/u/{slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-muted">
          {saveStatusLabel(saveStatus) ? <span>{saveStatusLabel(saveStatus)}</span> : null}
          {saveStatus === "error" ? (
            <button type="button" className="text-primary underline" onClick={retrySave}>
              重试
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
