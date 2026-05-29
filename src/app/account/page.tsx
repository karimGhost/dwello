"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";

export default function AccountPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      setCurrentUser(user);

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();

        setForm({
          fullName: data.fullName || user.displayName || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          location: data.location || "",
        });
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  async function saveProfile() {
    if (!currentUser) return;

    await updateDoc(doc(db, "users", currentUser.uid), {
      fullName: form.fullName,
      phone: form.phone,
      location: form.location,
      updatedAt: serverTimestamp(),
    });

    alert("Profile updated successfully.");
  }

  if (loading) {
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <div>

      <Navbar />

   
    <main className="min-h-screen bg-zinc-100 p-4 md:p-8">
        
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-10">
        
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-zinc-500 mt-1">
          Manage your personal and delivery information.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mt-8">
          <Field    icon={<User className="h-5 w-5" />} label="Full Name">
            <Input
              value={form.fullName}
              onChange={(e) =>
                setForm((p) => ({ ...p, fullName: e.target.value }))
              }
            />
          </Field>

          <Field icon={<Mail className="h-5 w-5" />} label="Email">
            <Input value={form.email} disabled />
          </Field>

          <Field icon={<Phone className="h-5 w-5"/>} label="Phone">
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </Field>

          <Field icon={<MapPin className="h-5 w-5"/>} label="Delivery Location">
            <Input
              value={form.location}
              onChange={(e) =>
                setForm((p) => ({ ...p, location: e.target.value }))
              }
            />
          </Field>
        </div>

        <Button onClick={saveProfile} className="mt-8">
          Save Changes
        </Button>
      </div>
    </main> </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium flex items-center gap-2 mb-2">
        <span className="h-4 w-4">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}