import Link from "next/link";
import { CredentialsForm } from "@/components/auth-forms";
import { signInAction } from "@/modules/auth/actions";
import { safeNextPath } from "@/lib/app-url";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  return (
    <div>
      <p className="text-sm font-medium text-primary">账户</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight text-ink">登录</h1>
      <p className="mt-3 text-[14px] leading-7 text-muted">使用邮箱和密码进入简历工作台。</p>
      {params.error ? <p className="mt-4 text-[13px] text-red-600">登录链接无效或已过期，请重试。</p> : null}
      <CredentialsForm action={signInAction} submitLabel="登录" next={next} />
      <p className="mt-4 text-[13px] text-muted">
        还没有账户？{" "}
        <Link href="/register" className="text-primary">
          注册
        </Link>
        {" · "}
        <Link href="/forgot-password" className="text-primary">
          忘记密码
        </Link>
      </p>
    </div>
  );
}
