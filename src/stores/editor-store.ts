import { create } from "zustand";
import type { TemplateRecord } from "@/modules/template";
import type { OwnedResume } from "@/modules/resume";
import type { SectionType } from "@/types/resume";

export type EditorSection = {
  id: string;
  type: SectionType;
  schemaVersion: number;
  sortOrder: number;
  isVisible: boolean;
  data: Record<string, unknown>;
};

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

type EditorState = {
  resumeId: string;
  title: string;
  slug: string;
  contentVersion: number;
  template: TemplateRecord;
  sections: EditorSection[];
  selectedSectionId: string | null;
  dirtySectionIds: string[];
  saveStatus: SaveStatus;
  conflictError: string | null;
  mobileTab: "edit" | "preview";
  hydrate: (initial: OwnedResume) => void;
  selectSection: (id: string) => void;
  patchSectionData: (id: string, data: Record<string, unknown>) => void;
  setSectionVisible: (id: string, isVisible: boolean) => void;
  reorderSectionsLocal: (orderedIds: string[]) => void;
  addSectionLocal: (section: EditorSection) => void;
  setSaveStatus: (status: SaveStatus) => void;
  markSectionClean: (id: string) => void;
  markSectionDirty: (id: string) => void;
  applyServerVersion: (contentVersion: number, section?: EditorSection) => void;
  setConflictError: (message: string | null) => void;
  setMobileTab: (tab: "edit" | "preview") => void;
};

function markDirtyIds(current: string[], id: string) {
  return current.includes(id) ? current : [...current, id];
}

export const useEditorStore = create<EditorState>((set, get) => ({
  resumeId: "",
  title: "",
  slug: "",
  contentVersion: 1,
  template: {
    id: "",
    slug: "classic",
    name: "经典",
    category: "general",
    version: 1,
    config: { layout: "single-column", sectionLabels: {} },
    isActive: true,
  },
  sections: [],
  selectedSectionId: null,
  dirtySectionIds: [],
  saveStatus: "idle",
  conflictError: null,
  mobileTab: "edit",

  hydrate(initial) {
    const template = initial.template ?? get().template;
    set({
      resumeId: initial.id,
      title: initial.title,
      slug: initial.slug,
      contentVersion: initial.contentVersion,
      template,
      sections: initial.sections.map((section) => ({
        id: section.id,
        type: section.type as SectionType,
        schemaVersion: section.schemaVersion,
        sortOrder: section.sortOrder,
        isVisible: section.isVisible,
        data: section.data,
      })),
      selectedSectionId: initial.sections[0]?.id ?? null,
      dirtySectionIds: [],
      saveStatus: "idle",
      conflictError: null,
      mobileTab: "edit",
    });
  },

  selectSection(id) {
    set({ selectedSectionId: id, mobileTab: "edit" });
  },

  patchSectionData(id, data) {
    set((state) => ({
      sections: state.sections.map((section) => (section.id === id ? { ...section, data } : section)),
      dirtySectionIds: markDirtyIds(state.dirtySectionIds, id),
      saveStatus: "dirty",
    }));
  },

  setSectionVisible(id, isVisible) {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id ? { ...section, isVisible } : section,
      ),
      dirtySectionIds: markDirtyIds(state.dirtySectionIds, id),
      saveStatus: "dirty",
    }));
  },

  reorderSectionsLocal(orderedIds) {
    set((state) => ({
      sections: orderedIds
        .map((sectionId, index) => {
          const section = state.sections.find((item) => item.id === sectionId);
          return section ? { ...section, sortOrder: index } : null;
        })
        .filter((section): section is EditorSection => section !== null),
    }));
  },

  addSectionLocal(section) {
    set((state) => ({
      sections: [...state.sections, section],
      selectedSectionId: section.id,
      saveStatus: "saved",
    }));
  },

  setSaveStatus(status) {
    set({ saveStatus: status });
  },

  markSectionClean(id) {
    set((state) => ({
      dirtySectionIds: state.dirtySectionIds.filter((sectionId) => sectionId !== id),
      saveStatus: state.dirtySectionIds.length <= 1 ? "saved" : state.saveStatus,
    }));
  },

  markSectionDirty(id) {
    set((state) => ({
      dirtySectionIds: markDirtyIds(state.dirtySectionIds, id),
      saveStatus: "dirty",
    }));
  },

  applyServerVersion(contentVersion, section) {
    set((state) => {
      if (!section) {
        return { contentVersion };
      }

      const exists = state.sections.some((item) => item.id === section.id);
      return {
        contentVersion,
        sections: exists
          ? state.sections.map((item) => (item.id === section.id ? section : item))
          : [...state.sections, section],
      };
    });
  },

  setConflictError(message) {
    set({ conflictError: message, saveStatus: "error" });
  },

  setMobileTab(tab) {
    set({ mobileTab: tab });
  },
}));

export function selectPreviewSections(state: EditorState) {
  return state.sections;
}
