import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen">
        <Sidebar userName={session.user.name} userEmail={session.user.email} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
