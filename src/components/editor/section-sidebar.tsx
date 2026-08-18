"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SECTION_TYPE_LABELS, SINGLE_INSTANCE_SECTION_TYPES } from "@/modules/resume/schemas/sections";
import { SECTION_TYPES, type SectionType } from "@/types/resume";
import { addSectionAction } from "@/modules/resume/draft-actions";
import { persistSectionReorder, persistSectionVisibility } from "@/hooks/use-autosave";
import { useEditorStore, type EditorSection } from "@/stores/editor-store";

function SortableSectionRow({
  section,
  selected,
  onSelect,
  onToggleVisible,
}: {
  section: EditorSection;
  selected: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const label =
    section.type === "CUSTOM"
      ? `自定义 ${section.sortOrder + 1}`
      : SECTION_TYPE_LABELS[section.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-[9px] border px-2 py-2 ${
        selected ? "border-primary bg-white" : "border-border bg-white/70"
      }`}
    >
      <button
        type="button"
        className="cursor-grab px-1 text-muted active:cursor-grabbing"
        aria-label="拖拽排序"
        {...attributes}
        {...listeners}
      >
        ☰
      </button>
      <button type="button" className="flex-1 text-left text-[13px] text-ink" onClick={onSelect}>
        {label}
        {!section.isVisible ? <span className="ml-2 text-[11px] text-muted">已隐藏</span> : null}
      </button>
      <button
        type="button"
        className="text-[11px] text-muted hover:text-ink"
        onClick={onToggleVisible}
        aria-label={section.isVisible ? "隐藏模块" : "显示模块"}
      >
        {section.isVisible ? "隐藏" : "显示"}
      </button>
    </div>
  );
}

export function SectionSidebar() {
  const sections = useEditorStore((state) => state.sections);
  const selectedSectionId = useEditorStore((state) => state.selectedSectionId);
  const selectSection = useEditorStore((state) => state.selectSection);
  const setSectionVisible = useEditorStore((state) => state.setSectionVisible);
  const reorderSectionsLocal = useEditorStore((state) => state.reorderSectionsLocal);
  const applyServerVersion = useEditorStore((state) => state.applyServerVersion);
  const setConflictError = useEditorStore((state) => state.setConflictError);
  const resumeId = useEditorStore((state) => state.resumeId);
  const contentVersion = useEditorStore((state) => state.contentVersion);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const existingTypes = new Set(sorted.map((section) => section.type));
  const addableTypes = SECTION_TYPES.filter(
    (type) => type === "CUSTOM" || !existingTypes.has(type),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sorted.findIndex((section) => section.id === active.id);
    const newIndex = sorted.findIndex((section) => section.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reordered = arrayMove(sorted, oldIndex, newIndex);
    reorderSectionsLocal(reordered.map((section) => section.id));
    await persistSectionReorder(reordered.map((section) => section.id));
  }

  async function handleToggleVisible(section: EditorSection) {
    const nextVisible = !section.isVisible;
    setSectionVisible(section.id, nextVisible);
    await persistSectionVisibility(section.id, nextVisible);
  }

  async function handleAddSection(type: SectionType) {
    const result = await addSectionAction({
      resumeId,
      expectedVersion: contentVersion,
      type,
    });

    if (result.error) {
      if (result.error.code === "RESUME_VERSION_CONFLICT") {
        setConflictError(result.error.message);
      }
      return;
    }

    if (result.section && result.contentVersion) {
      const nextSection = {
        id: result.section.id,
        type: result.section.type as SectionType,
        schemaVersion: result.section.schemaVersion,
        sortOrder: result.section.sortOrder,
        isVisible: result.section.isVisible,
        data: result.section.data,
      };
      applyServerVersion(result.contentVersion, nextSection);
      selectSection(result.section.id);
    }
  }

  return (
    <aside className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-ink">编辑模块</h2>
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-[9px] border border-border px-2 py-1 text-[12px] text-ink">
            ＋ 添加模块
          </summary>
          <div className="absolute right-0 z-10 mt-2 w-44 rounded-[10px] border border-border bg-white p-2 shadow-sm">
            {addableTypes.map((type) => (
              <button
                key={type}
                type="button"
                className="block w-full rounded-[8px] px-2 py-2 text-left text-[12px] hover:bg-canvas"
                onClick={() => void handleAddSection(type)}
              >
                {SECTION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </details>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => void handleDragEnd(event)}>
        <SortableContext items={sorted.map((section) => section.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sorted.map((section) => (
              <SortableSectionRow
                key={section.id}
                section={section}
                selected={section.id === selectedSectionId}
                onSelect={() => selectSection(section.id)}
                onToggleVisible={() => void handleToggleVisible(section)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-[11px] text-muted">
        {SINGLE_INSTANCE_SECTION_TYPES.length > 0
          ? "除自定义模块外，每种类型仅可添加一次。"
          : null}
      </p>
    </aside>
  );
}
