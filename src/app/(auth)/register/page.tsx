import Link from "next/link";
import { CredentialsForm } from "@/components/auth-forms";
import { signUpAction } from "@/modules/auth/actions";

export default function RegisterPage() {
  return (
    <div>
      <p className="text-sm font-medium text-primary">账户</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight text-ink">注册</h1>
      <p className="mt-3 text-[14px] leading-7 text-muted">
        创建账户后可以进入工作台。请查收验证邮件完成邮箱验证，未验证前不能发布简历。
      </p>
      <CredentialsForm
        action={signUpAction}
        submitLabel="创建账户"
        mode="register"
        successMessage="验证邮件已发送，请查收后登录。"
      />
      <p className="mt-4 text-[13px] text-muted">
        已有账户？{" "}
        <Link href="/login" className="text-primary">
          登录
        </Link>
      </p>
    </div>
  );
}
