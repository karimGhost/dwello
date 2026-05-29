"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignup = mode === "signup";

 async function saveUserToFirestore(user: any, extraData?: any) {
  try {
    console.log("Saving user:", user.uid);

    const userRef = doc(db, "users", user.uid);

    console.log("Before setDoc");

    await setDoc(userRef, {
      uid: user.uid,
      fullName: extraData?.fullName || user.displayName || "",
      email: user.email || "",
      phone: extraData?.phone || "",
      location: extraData?.location || "",
      role: "customer",
      cart: [],
      wishlist: [],
      ordersCount: 0,
      provider: user.providerData?.[0]?.providerId || "email",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("After setDoc - user saved");
  } catch (error: any) {
    console.error("Firestore save error:", error.code, error.message);
    alert(error.message);
  }
}
// 1gd_lNG1H6kKD6WhEWc677Uf6VrTWcYbufnGLJrrRHrqA1JN
  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        const res = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(res.user, {
          displayName: fullName,
        });

        await saveUserToFirestore(res.user, {
          fullName,
          phone,
          location,
        });

        alert("Account created successfully!");

      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(res.user);
                  

        alert("Logged in successfully!");
                  router.push("/");

      }

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      await saveUserToFirestore(res.user);
      alert("Google login successful!");
          router.push("/");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      alert("Enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent to your email.");
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-white to-zinc-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border">
        <section className="hidden lg:flex flex-col justify-between bg-zinc-950 text-white p-10">
        
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to <span className="text-primary">Dwello</span>
            </h1>
            <p className="mt-4 text-zinc-300">
              Buy furniture, home appliances, and manage your orders easily.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white/10 p-5">
              <h3 className="font-semibold">Fast Checkout</h3>
              <p className="text-sm text-zinc-300">
                Save your details for quicker shopping.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <h3 className="font-semibold">Track Orders</h3>
              <p className="text-sm text-zinc-300">
                View your order history and delivery status.
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 md:p-10">
          <div className="mb-8">
              <Link href="/" className=" lg:hidden font-headline text-2xl font-bold tracking-tight text-primary">
            DWELLO
          </Link>
            <h2 className="text-3xl font-bold text-zinc-900">
              {isSignup ? "Create Account" : "Login"}
            </h2>
            <p className="text-zinc-500 mt-2">
              {isSignup
                ? "Sign up to start shopping."
                : "Welcome back, continue shopping."}
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-xl border flex items-center justify-center gap-3 hover:bg-zinc-50 transition disabled:opacity-60"
          >
            <span className="font-bold text-lg">G</span>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-zinc-200 flex-1" />
            <span className="text-sm text-zinc-400">or</span>
            <div className="h-px bg-zinc-200 flex-1" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignup && (
              <>
                <InputBox
                  icon={<User size={18} />}
                  placeholder="Full name"
                  value={fullName}
                  onChange={setFullName}
                  required
                />

                <InputBox
                  icon={<Phone size={18} />}
                  placeholder="Phone number"
                  value={phone}
                  onChange={setPhone}
                  required
                />

                <InputBox
                  icon={<MapPin size={18} />}
                  placeholder="Delivery location"
                  value={location}
                  onChange={setLocation}
                  required
                />
              </>
            )}

            <InputBox
              icon={<Mail size={18} />}
              placeholder="Email address"
              value={email}
              onChange={setEmail}
              type="email"
              required
            />

            <div className="relative">
              <InputBox
                icon={<Lock size={18} />}
                placeholder="Password"
                value={password}
                onChange={setPassword}
                type={showPassword ? "text" : "password"}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {!isSignup && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-brown-600 hover:underline"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-white font-semibold hover:bg-amber-900 transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setMode(isSignup ? "login" : "signup")}
              className="text-primary font-semibold hover:underline"
            >
              {isSignup ? "Login" : "Sign up"}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}

function InputBox({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
        {icon}
      </div>

      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-xl border bg-white pl-12 pr-4 outline-none focus:border-amber-500 focus:ring-4 focus:ring-orange-100 transition"
      />
    </div>
  );
}

