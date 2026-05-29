import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { sellerId, idToken } = await req.json();

    const decoded = await adminAuth.verifyIdToken(idToken);

    const adminSnap = await adminDb.collection("users").doc(decoded.uid).get();

    if (adminSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    await adminDb.collection("sellers").doc(sellerId).update({
      status: "rejected",
      verified: false,
      rejectedAt: new Date(),
      rejectedBy: decoded.uid,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}