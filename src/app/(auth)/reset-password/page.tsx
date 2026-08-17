import { PasswordForm } from "@/components/auth-forms";
import { updatePasswordAction } from "@/modules/auth/actions";

export default function ResetPasswordPage() {
  return (
    <div>
      <p className="text-sm font-medium text-primary">账户</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight text-ink">重置密码</h1>
      <p className="mt-3 text-[14px] leading-7 text-muted">从邮件链接进入此页，设置新密码。</p>
      <PasswordForm action={updatePasswordAction} submitLabel="保存新密码" />
    </div>
  );
}
