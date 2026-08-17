import { AppError } from "@/lib/errors";

export function assertOwned<T>(row: T | null | undefined): T {
  if (!row) {
    throw new AppError("RESUME_NOT_FOUND", "简历不存在", 404);
  }

  return row;
}
