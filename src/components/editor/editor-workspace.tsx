"use client";

import { useEffect, useMemo, useState } from "react";
import type { OwnedResume } from "@/modules/resume";
import { useEditorStore } from "@/stores/editor-store";
import { EditorToolbar } from "./editor-toolbar";
import { LivePreview } from "./live-preview";
import { ActiveSectionForm } from "./section-form-router";
import { SectionSidebar } from "./section-sidebar";

export function EditorWorkspace({ initial }: { initial: OwnedResume }) {
  const hydrate = useEditorStore((state) => state.hydrate);
  const sections = useEditorStore((state) => state.sections);
  const template = useEditorStore((state) => state.template);
  const mobileTab = useEditorStore((state) => state.mobileTab);
  const setMobileTab = useEditorStore((state) => state.setMobileTab);

  const [previewSections, setPreviewSections] = useState(sections);

  useEffect(() => {
    hydrate(initial);
  }, [hydrate, initial]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewSections(useEditorStore.getState().sections);
    }, 300);
    return () => clearTimeout(timer);
  }, [sections]);

  const templateConfig = useMemo(() => template.config, [template.config]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <EditorToolbar />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col lg:flex-row">
        <div className="border-b border-border px-4 py-2 lg:hidden">
          <div className="grid grid-cols-2 gap-2 rounded-[10px] bg-white p-1">
            <button
              type="button"
              className={`rounded-[8px] px-3 py-2 text-[13px] ${
                mobileTab === "edit" ? "bg-canvas font-medium text-ink" : "text-muted"
              }`}
              onClick={() => setMobileTab("edit")}
            >
              编辑
            </button>
            <button
              type="button"
              className={`rounded-[8px] px-3 py-2 text-[13px] ${
                mobileTab === "preview" ? "bg-canvas font-medium text-ink" : "text-muted"
              }`}
              onClick={() => setMobileTab("preview")}
            >
              预览
            </button>
          </div>
        </div>

        <div
          className={`flex w-full flex-col gap-4 border-border p-4 lg:w-[42%] lg:border-r ${
            mobileTab === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          <SectionSidebar />
          <ActiveSectionForm />
        </div>

        <div
          className={`min-h-[60vh] flex-1 lg:sticky lg:top-0 lg:h-[calc(100vh-57px)] ${
            mobileTab === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <LivePreview sections={previewSections} templateConfig={templateConfig} />
        </div>
      </div>
    </div>
  );
}
