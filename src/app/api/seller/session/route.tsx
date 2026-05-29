import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing ID token" },
        { status: 400 }
      );
    }

    const decoded = await adminAuth.verifyIdToken(idToken);

    const userSnap = await adminDb
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userSnap.exists || userSnap.data()?.role !== "seller") {
      return NextResponse.json(
        { error: "Access denied. Sellers only." },
        { status: 403 }
      );
    }

    const sellerSnap = await adminDb
      .collection("sellers")
      .doc(decoded.uid)
      .get();

    if (!sellerSnap.exists) {
      return NextResponse.json(
        { error: "Seller profile not found." },
        { status: 404 }
      );
    }

    const sellerData = sellerSnap.data();

    if (
      sellerData?.status !== "approved" ||
      sellerData?.verified !== true
    ) {
      return NextResponse.json(
        { error: "Seller account is pending approval." },
        { status: 403 }
      );
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const cookieStore = await cookies();

    cookieStore.set("seller_session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Seller session error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create seller session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();

  cookieStore.set("seller_session", "", {
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json({
    success: true,
  });
}