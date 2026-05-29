"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Bell, Lock, LogOut, Shield } from "lucide-react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

export default function SettingsPage() {
  const router = useRouter();

  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      setUid(user.uid);
      setEmail(user.email || "");

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();

        setNotifications(data.notifications ?? true);
        setMarketingEmails(data.marketingEmails ?? false);
      }
    });

    return () => unsub();
  }, [router]);

  async function saveSettings() {
    if (!uid) return;

    await updateDoc(doc(db, "users", uid), {
      notifications,
      marketingEmails,
      updatedAt: serverTimestamp(),
    });

    alert("Settings saved.");
  }

  async function resetPassword() {
    if (!email) return;

    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent.");
  }

  async function logout() {
    await signOut(auth);
    router.push("/");
  }

  return (
    <div>
                      <Navbar />

    
    <main className="min-h-screen bg-zinc-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-10">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-zinc-500 mt-1">
          Manage account security and preferences.
        </p>

        <div className="space-y-5 mt-8">
          <SettingRow
            icon={<Bell />}
            title="Order Notifications"
            description="Receive updates about your orders and deliveries."
            checked={notifications}
            onChange={setNotifications}
          />

          <SettingRow
            icon={<Shield />}
            title="Marketing Emails"
            description="Receive offers, discounts and product updates."
            checked={marketingEmails}
            onChange={setMarketingEmails}
          />

          <div className="border rounded-2xl p-5 flex items-center justify-between">
            <div className="flex gap-4">
              <Lock />
              <div>
                <p className="font-semibold">Password</p>
                <p className="text-sm text-zinc-500">
                  Send password reset link to {email}
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={resetPassword}>
              Reset
            </Button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={saveSettings}>Save Settings</Button>

            <Button variant="destructive" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </main>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
   
        
    
    <div className="border rounded-2xl p-5 flex items-center justify-between gap-4">
      <div className="flex gap-4">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5"
      />
    </div>
  );
}