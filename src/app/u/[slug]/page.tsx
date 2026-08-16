import { PlaceholderPage } from "@/components/placeholder-page";

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PlaceholderPage
      eyebrow="公开简历"
      title={`/${slug}`}
      description="公开页只读取已发布快照，草稿变化不会影响线上版本。"
    />
  );
}
