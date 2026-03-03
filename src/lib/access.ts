import { supabase } from "./supabaseClient";

export async function userIsActive(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  const email = data?.user?.email;
  if (!email) return false;

  const { data: row } = await supabase
    .from("user_access")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  return row?.status === "active";
}