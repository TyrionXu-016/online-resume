import { ResumeList } from "@/components/resume-list";
import { requireUser } from "@/modules/auth/service";
import { listMine } from "@/modules/resume";

export default async function DashboardPage() {
  const user = await requireUser();
  const items = await listMine(user.id);

  return (
    <ResumeList
      items={items}
      title="我的工作台"
      description="创建、复制和管理你的在线简历。编辑器内容将在下一阶段接入。"
    />
  );
}
