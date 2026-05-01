import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import DashboardSidebar from "@/components/DashboardSidebar";
import { FREE_CHECK_LIMIT } from "@/lib/usage";

async function loadSessionUser() {
  const token = cookies().get("sr_session")?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await loadSessionUser();
  if (!user) redirect("/login");

  const usage = {
    premium: user.premium,
    credits: user.credits,
    count: user.count,
    freeLimit: FREE_CHECK_LIMIT,
  };

  return (
    <div className="site-shell flex min-h-screen flex-col bg-[#04080d] text-white md:flex-row">
      <DashboardSidebar email={user.email} usage={usage} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
