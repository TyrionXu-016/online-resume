import { signOutAction } from "@/modules/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-[9px] px-3 py-2 text-[13px] text-muted hover:bg-canvas hover:text-ink"
      >
        退出
      </button>
    </form>
  );
}
