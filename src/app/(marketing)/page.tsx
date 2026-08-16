import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <span className="text-[14px] font-medium text-ink">Resume</span>
          <nav className="flex items-center gap-3 text-[13px]">
            <Link href="/login" className="rounded-[9px] px-3 py-2 text-muted hover:text-ink">
              登录
            </Link>
            <Link
              href="/register"
              className="rounded-[9px] bg-primary px-3 py-2 font-medium text-white"
            >
              开始创建
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-20">
        <p className="text-sm font-medium text-primary">ONLINE RESUME PLATFORM</p>
        <h1 className="mt-3 max-w-2xl text-[40px] font-bold leading-tight tracking-tight text-ink">
          创建、发布并分享一份专业在线简历
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
          结构化编辑、实时预览、唯一 URL。草稿与已发布版本隔离，公开页只读取不可变快照。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-[9px] bg-primary px-5 py-3 text-[14px] font-medium text-white"
          >
            免费开始
          </Link>
          <Link
            href="/dashboard"
            className="rounded-[9px] border border-border bg-white px-5 py-3 text-[14px] font-medium text-ink"
          >
            进入工作台
          </Link>
        </div>
      </main>
    </div>
  );
}
