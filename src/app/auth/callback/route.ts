import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/app-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const origin = requestUrl.origin;

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
  } else {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
