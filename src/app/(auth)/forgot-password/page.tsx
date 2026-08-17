import Link from "next/link";
import { EmailForm } from "@/components/auth-forms";
import { forgotPasswordAction } from "@/modules/auth/actions";

export default function ForgotPasswordPage() {
  return (
    <div>
      <p className="text-sm font-medium text-primary">账户</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight text-ink">找回密码</h1>
      <p className="mt-3 text-[14px] leading-7 text-muted">输入注册邮箱，我们会发送重置链接。</p>
      <EmailForm
        action={forgotPasswordAction}
        submitLabel="发送重置邮件"
        successMessage="如果该邮箱已注册，你会收到重置邮件。"
      />
      <p className="mt-4 text-[13px] text-muted">
        <Link href="/login" className="text-primary">
          返回登录
        </Link>
      </p>
    </div>
  );
}
