"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  reorderSectionsAction,
  saveSectionDraftAction,
  setSectionVisibilityAction,
} from "@/modules/resume/draft-actions";
import { useEditorStore, type EditorSection } from "@/stores/editor-store";

const AUTOSAVE_DELAY_MS = 1000;

function toEditorSection(
  section:
    | {
        id: string;
        type: string;
        schemaVersion: number;
        sortOrder: number;
        isVisible: boolean;
        data: Record<string, unknown>;
      }
    | undefined,
): EditorSection | undefined {
  if (!section) {
    return undefined;
  }

  return {
    id: section.id,
    type: section.type as EditorSection["type"],
    schemaVersion: section.schemaVersion,
    sortOrder: section.sortOrder,
    isVisible: section.isVisible,
    data: section.data,
  };
}

export function useAutosave() {
  const resumeId = useEditorStore((state) => state.resumeId);
  const contentVersion = useEditorStore((state) => state.contentVersion);
  const dirtySectionIds = useEditorStore((state) => state.dirtySectionIds);
  const sections = useEditorStore((state) => state.sections);
  const setSaveStatus = useEditorStore((state) => state.setSaveStatus);
  const markSectionClean = useEditorStore((state) => state.markSectionClean);
  const applyServerVersion = useEditorStore((state) => state.applyServerVersion);
  const setConflictError = useEditorStore((state) => state.setConflictError);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const versionRef = useRef(contentVersion);

  useEffect(() => {
    versionRef.current = contentVersion;
  }, [contentVersion]);

  const flushDirtySections = useCallback(async () => {
    const dirty = useEditorStore.getState().dirtySectionIds;
    if (savingRef.current || dirty.length === 0) {
      return;
    }

    savingRef.current = true;
    setSaveStatus("saving");

    try {
      for (const sectionId of dirty) {
        const section = useEditorStore.getState().sections.find((item) => item.id === sectionId);
        if (!section) {
          continue;
        }

        const result = await saveSectionDraftAction({
          resumeId,
          sectionId,
          expectedVersion: versionRef.current,
          data: section.data,
        });

        if (result.error) {
          if (result.error.code === "RESUME_VERSION_CONFLICT") {
            setConflictError(result.error.message);
            return;
          }
          setSaveStatus("error");
          return;
        }

        if (result.contentVersion) {
          versionRef.current = result.contentVersion;
          applyServerVersion(result.contentVersion, toEditorSection(result.section));
          markSectionClean(sectionId);
        }
      }

      if (useEditorStore.getState().dirtySectionIds.length === 0) {
        setSaveStatus("saved");
      }
    } finally {
      savingRef.current = false;
    }
  }, [applyServerVersion, markSectionClean, resumeId, setConflictError, setSaveStatus]);

  useEffect(() => {
    if (dirtySectionIds.length === 0) {
      return;
    }

    setSaveStatus("dirty");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      void flushDirtySections();
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [dirtySectionIds, flushDirtySections, sections, setSaveStatus]);

  const retrySave = useCallback(() => {
    setConflictError(null);
    setSaveStatus("dirty");
    void flushDirtySections();
  }, [flushDirtySections, setConflictError, setSaveStatus]);

  return { retrySave };
}

export async function persistSectionVisibility(sectionId: string, isVisible: boolean) {
  const state = useEditorStore.getState();
  const result = await setSectionVisibilityAction({
    resumeId: state.resumeId,
    sectionId,
    expectedVersion: state.contentVersion,
    isVisible,
  });

  if (result.error) {
    if (result.error.code === "RESUME_VERSION_CONFLICT") {
      state.setConflictError(result.error.message);
    }
    return false;
  }

  if (result.contentVersion) {
    state.applyServerVersion(result.contentVersion, toEditorSection(result.section));
    state.markSectionClean(sectionId);
    state.setSaveStatus("saved");
  }

  return true;
}

export async function persistSectionReorder(orderedSectionIds: string[]) {
  const state = useEditorStore.getState();
  const result = await reorderSectionsAction({
    resumeId: state.resumeId,
    expectedVersion: state.contentVersion,
    orderedSectionIds,
  });

  if (result.error) {
    if (result.error.code === "RESUME_VERSION_CONFLICT") {
      state.setConflictError(result.error.message);
    }
    return false;
  }

  if (result.contentVersion) {
    state.applyServerVersion(result.contentVersion);
    state.setSaveStatus("saved");
  }

  return true;
}
