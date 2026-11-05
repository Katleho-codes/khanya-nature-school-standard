import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/toast";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <ToastProvider>
      <AdminShell user={user}>{children}</AdminShell>
    </ToastProvider>
  );
}
