import type { ReactNode } from "react";
import Link from "next/link";
import { CreateResumeButton } from "@/components/create-resume-button";
import { SignOutButton } from "@/components/sign-out-button";
import { requireUserOrRedirect } from "@/modules/auth/service";

const NAV = [
  { href: "/dashboard", label: "工作台" },
  { href: "/resumes", label: "我的简历" },
  { href: "/templates", label: "模板管理" },
  { href: "/analytics", label: "访问数据" },
  { href: "/settings", label: "账户设置" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUserOrRedirect("/dashboard");

  return (
    <div className="flex min-h-full bg-canvas">
      <aside className="hidden w-[248px] shrink-0 border-r border-border bg-white md:block">
        <div className="flex h-16 items-center px-5 text-[14px] font-medium">Resume</div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[9px] px-3 py-2 text-[13px] text-ink hover:bg-canvas"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
          <span className="truncate text-[14px] font-medium">{user.email}</span>
          <div className="flex items-center gap-2">
            <SignOutButton />
            <CreateResumeButton />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
