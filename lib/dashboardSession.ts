import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";

export type DashboardUser = {
  id: string;
  email: string;
  name: string | null;
  premium: boolean;
  credits: number;
  count: number;
  createdAt: Date;
};

export async function requireDashboardUser(): Promise<DashboardUser> {
  const token = cookies().get("sr_session")?.value;
  if (!token) redirect("/login");

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) redirect("/login");

  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    premium: u.premium,
    credits: u.credits,
    count: u.count,
    createdAt: u.createdAt,
  };
}
