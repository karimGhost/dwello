import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;

  if (!session) {
    redirect("/auth/admin");
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);

    const userSnap = await adminDb.collection("users").doc(decoded.uid).get();

    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      redirect("/");
    }
  } catch {
    redirect("/auth/admin");
  }

  return <>{children}</>;
}