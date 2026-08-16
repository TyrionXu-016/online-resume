import { PlaceholderPage } from "@/components/placeholder-page";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = await params;

  return (
    <PlaceholderPage
      eyebrow="编辑器"
      title="在线编辑"
      description={`简历 ${resumeId} 的结构化编辑、拖拽排序和实时预览将在这里实现。`}
    />
  );
}
