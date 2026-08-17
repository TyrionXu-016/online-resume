import { notFound } from "next/navigation";
import Link from "next/link";
import { AppError } from "@/lib/errors";
import { requireUser } from "@/modules/auth/service";
import { getOwned } from "@/modules/resume";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = await params;
  const user = await requireUser();

  let resume;
  try {
    resume = await getOwned(user.id, resumeId);
  } catch (error) {
    if (error instanceof AppError && error.code === "RESUME_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium text-primary">编辑器</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight text-ink">{resume.title}</h1>
      <p className="mt-3 max-w-xl text-[14px] leading-7 text-muted">
        结构化编辑、拖拽排序和实时预览将在下一阶段实现。当前地址为 /u/{resume.slug}。
      </p>
      <Link
        href="/dashboard"
        className="mt-8 w-fit rounded-[9px] border border-border px-3 py-2 text-[13px] text-ink"
      >
        返回工作台
      </Link>
    </main>
  );
}
