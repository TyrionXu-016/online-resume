export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "resume-assets";

export function buildObjectKey(input: {
  userId: string;
  resumeId?: string;
  kind: string;
  assetId: string;
  ext: string;
}) {
  const { userId, resumeId, kind, assetId, ext } = input;
  if (!resumeId) {
    return `users/${userId}/avatars/${assetId}.${ext}`;
  }

  const folder =
    kind === "AVATAR"
      ? "avatars"
      : kind === "PROJECT_IMAGE"
        ? "projects"
        : kind === "CERTIFICATE"
          ? "certificates"
          : kind === "LOGO"
            ? "logos"
            : "attachments";

  return `users/${userId}/resumes/${resumeId}/${folder}/${assetId}.${ext}`;
}
