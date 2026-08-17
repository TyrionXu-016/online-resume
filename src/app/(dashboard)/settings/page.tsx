import { requireUser } from "@/modules/auth/service";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16">
      <p className="text-sm font-medium text-primary">账户</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight text-ink">账户设置</h1>
      <p className="mt-3 max-w-xl text-[14px] leading-7 text-muted">当前登录信息。资料编辑将在后续阶段开放。</p>
      <dl className="mt-8 divide-y divide-border rounded-[12px] border border-border bg-white">
        <div className="flex items-center justify-between px-4 py-3 text-[14px]">
          <dt className="text-muted">邮箱</dt>
          <dd className="font-medium text-ink">{user.email}</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-[14px]">
          <dt className="text-muted">邮箱验证</dt>
          <dd className="font-medium text-ink">{user.emailVerified ? "已验证" : "未验证"}</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-[14px]">
          <dt className="text-muted">套餐</dt>
          <dd className="font-medium text-ink">{user.plan}</dd>
        </div>
      </dl>
    </main>
  );
}
