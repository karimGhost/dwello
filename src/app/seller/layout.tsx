import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("seller_session")?.value;

  if (!session) {
    redirect("/auth/seller");
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);

    const userSnap = await adminDb.collection("users").doc(decoded.uid).get();

    if (!userSnap.exists || userSnap.data()?.role !== "seller") {
      redirect("/");
    }
  } catch {
    redirect("/auth/seller");
  }

  return <>{children}</>;
}