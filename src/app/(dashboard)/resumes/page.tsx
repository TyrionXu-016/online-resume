import { ResumeList } from "@/components/resume-list";
import { requireUser } from "@/modules/auth/service";
import { listMine } from "@/modules/resume";

export default async function ResumesPage() {
  const user = await requireUser();
  const items = await listMine(user.id);

  return (
    <ResumeList
      items={items}
      title="我的简历"
      description="支持多份简历、草稿 / 发布状态、复制、改地址和删除。"
    />
  );
}
