"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const steps = [
  "Register Seller Account",
  "Qualification Information",
  "Settlement Information",
  "Store Information",
  "Review Application",
];

export default function SellerRegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [idCopyImage, setIdCopyImage] = useState<File | null>(null);
  const [businessDocumentImage, setBusinessDocumentImage] = useState<File | null>(null);
  const [storefrontImage, setStorefrontImage] = useState<File | null>(null);

  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    password: "",
    phone: "",

    idNumber: "",
    businessType: "",
    businessRegistrationNumber: "",
    taxNumber: "",

    bankName: "",
    accountName: "",
    accountNumber: "",
    mpesaNumber: "",

    storeName: "",
    storeCategory: "",
    storeLocation: "",
    storeDescription: "",
  });

  function updateField(name: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function uploadToCloudinary(file: File, folder: string) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary config missing in .env.local");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Image upload failed");
    }

    return data.secure_url;
  }

  async function submitApplication() {
    if (!idCopyImage || !businessDocumentImage || !storefrontImage) {
      alert("Please upload ID copy, business document, and storefront image.");
      return;
    }

    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await updateProfile(res.user, {
        displayName: form.ownerName,
      });

      const idCopyUrl = await uploadToCloudinary(
        idCopyImage,
        "dwello/sellers/id-copies"
      );

      const businessDocumentUrl = await uploadToCloudinary(
        businessDocumentImage,
        "dwello/sellers/business-documents"
      );

      const storefrontUrl = await uploadToCloudinary(
        storefrontImage,
        "dwello/sellers/storefronts"
      );

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        fullName: form.ownerName,
        email: form.email,
        phone: form.phone,
        role: "seller",
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "sellers", res.user.uid), {
        uid: res.user.uid,

        account: {
          ownerName: form.ownerName,
          email: form.email,
          phone: form.phone,
        },

        qualification: {
          idNumber: form.idNumber,
          businessType: form.businessType,
          businessRegistrationNumber: form.businessRegistrationNumber,
          taxNumber: form.taxNumber,
          idCopyUrl,
          businessDocumentUrl,
        },

        settlement: {
          bankName: form.bankName,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          mpesaNumber: form.mpesaNumber,
        },

        store: {
          storeName: form.storeName,
          storeCategory: form.storeCategory,
          storeLocation: form.storeLocation,
          storeDescription: form.storeDescription,
          storefrontUrl,
        },

        status: "pending",
        verified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert(
        "Seller application submitted successfully. We will email or contact you once your account is approved. Thank you."
      );

      router.push("/");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-11 w-11 rounded-full border flex items-center justify-center hover:bg-amber-700 transition"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <Link
                href="/"
                className="font-headline text-2xl font-bold tracking-tight text-primary"
              >
                DWELLO
              </Link>

              <h1 className="text-3xl font-bold">Seller Registration</h1>

              <p className="text-zinc-500 text-sm mt-1">
                Complete your seller application
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-10">
          {steps.map((item, index) => (
            <div
              key={item}
              className={`rounded-2xl p-4 border ${
                index === step
                  ? "bg-primary text-white border-amber-600"
                  : index < step
                  ? "bg-green-50 border-green-400"
                  : "bg-white"
              }`}
            >
              <div className="font-bold">{index + 1}</div>
              <p className="text-sm">{item}</p>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Owner Name" value={form.ownerName} onChange={(v) => updateField("ownerName", v)} />
            <Input label="Email" value={form.email} onChange={(v) => updateField("email", v)} />
            <Input label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
            <Input label="Password" type="password" value={form.password} onChange={(v) => updateField("password", v)} />
          </div>
        )}

        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="ID Number" value={form.idNumber} onChange={(v) => updateField("idNumber", v)} />
            <Input label="Business Type" value={form.businessType} onChange={(v) => updateField("businessType", v)} />
            <Input label="Business Registration Number" value={form.businessRegistrationNumber} onChange={(v) => updateField("businessRegistrationNumber", v)} />
            <Input label="Tax Number / KRA PIN" value={form.taxNumber} onChange={(v) => updateField("taxNumber", v)} />

            <FileInput
              label="ID Copy Image"
              file={idCopyImage}
              onChange={setIdCopyImage}
            />

            <FileInput
              label="Business Document Image"
              file={businessDocumentImage}
              onChange={setBusinessDocumentImage}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Bank Name" value={form.bankName} onChange={(v) => updateField("bankName", v)} />
            <Input label="Account Name" value={form.accountName} onChange={(v) => updateField("accountName", v)} />
            <Input label="Account Number" value={form.accountNumber} onChange={(v) => updateField("accountNumber", v)} />
            <Input label="M-Pesa Number" value={form.mpesaNumber} onChange={(v) => updateField("mpesaNumber", v)} />
          </div>
        )}

        {step === 3 && (
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Store Name" value={form.storeName} onChange={(v) => updateField("storeName", v)} />
            <Input label="Store Category" value={form.storeCategory} onChange={(v) => updateField("storeCategory", v)} />
            <Input label="Store Location" value={form.storeLocation} onChange={(v) => updateField("storeLocation", v)} />

            <FileInput
              label="Storefront Image"
              file={storefrontImage}
              onChange={setStorefrontImage}
            />

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Store Description</label>
              <textarea
                value={form.storeDescription}
                onChange={(e) => updateField("storeDescription", e.target.value)}
                className="mt-2 w-full min-h-28 rounded-xl border px-4 py-3 outline-none focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Review Application</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Review label="Owner Name" value={form.ownerName} />
              <Review label="Email" value={form.email} />
              <Review label="Phone" value={form.phone} />
              <Review label="Business Type" value={form.businessType} />
              <Review label="Bank Name" value={form.bankName} />
              <Review label="M-Pesa Number" value={form.mpesaNumber} />
              <Review label="Store Name" value={form.storeName} />
              <Review label="Store Category" value={form.storeCategory} />
              <Review label="Store Location" value={form.storeLocation} />
              <Review label="ID Copy" value={idCopyImage?.name || "Not uploaded"} />
              <Review label="Business Document" value={businessDocumentImage?.name || "Not uploaded"} />
              <Review label="Storefront Image" value={storefrontImage?.name || "Not uploaded"} />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-10">
          <button
            disabled={step === 0 || loading}
            onClick={() => setStep((prev) => prev - 1)}
            className="px-6 py-3 rounded-xl border disabled:opacity-40"
          >
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              disabled={loading}
              onClick={() => setStep((prev) => prev + 1)}
              className="px-6 py-3 rounded-xl bg-amber-900 text-white disabled:opacity-60"
            >
              Next
            </button>
          ) : (
            <button
              disabled={loading}
              onClick={submitApplication}
              className="px-6 py-3 rounded-xl bg-amber-900 text-white disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 rounded-xl border px-4 outline-none focus:ring-4 focus:ring-amber-100"
      />
    </div>
  );
}

function FileInput({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="mt-2 w-full rounded-xl border px-4 py-3"
      />

      {file && (
        <p className="text-xs text-green-600 mt-1">
          Selected: {file.name}
        </p>
      )}
    </div>
  );
}

function Review({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-medium break-words">{value || "Not provided"}</p>
    </div>
  );
}