import type { ReactNode } from "react";
import { requireUserOrRedirect } from "@/modules/auth/service";

export default async function EditorLayout({ children }: { children: ReactNode }) {
  await requireUserOrRedirect("/editor");
  return children;
}
