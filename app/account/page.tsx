import { redirect } from "next/navigation";

// /account was the old dashboard. The new product structure puts authenticated
// surfaces under /dashboard, so redirect any old links / bookmarks there.
export default function AccountRedirectPage() {
  redirect("/dashboard");
}
