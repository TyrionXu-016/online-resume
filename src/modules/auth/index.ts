export {
  assertAuthenticated,
  isEmailVerified,
  normalizeEmail,
  profileFromAuthUser,
} from "./profile";
export {
  ensureUserProfile,
  getCurrentUser,
  requireUser,
  requireUserOrRedirect,
  signOut,
} from "./service";
export type { CurrentUser } from "./service";
