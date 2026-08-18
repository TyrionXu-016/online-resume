import { notFound } from "next/navigation";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
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

  return <EditorWorkspace initial={resume} />;
}
