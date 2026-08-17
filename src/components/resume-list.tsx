import { CreateResumeButton } from "@/components/create-resume-button";
import { ResumeCard } from "@/components/resume-card";
import type { ResumeSummary } from "@/modules/resume";

export function ResumeList({
  items,
  title,
  description,
}: {
  items: ResumeSummary[];
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">简历管理</p>
          <h1 className="mt-2 text-[28px] font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-3 max-w-xl text-[14px] leading-7 text-muted">{description}</p>
        </div>
        <CreateResumeButton />
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-[12px] border border-border bg-white px-6 py-16 text-center">
          <p className="text-[16px] font-medium text-ink">还没有简历</p>
          <p className="mt-2 text-[14px] text-muted">创建第一份简历后，会保存在这里。</p>
          <div className="mt-6 flex justify-center">
            <CreateResumeButton />
          </div>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {items.map((item) => (
            <ResumeCard key={item.id} resume={item} />
          ))}
        </ul>
      )}
    </main>
  );
}
