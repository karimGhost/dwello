"use client";

import Link from "next/link";
import { Store, UserPlus, LogIn } from "lucide-react";

export default function SellerEntry() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">

        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-700 flex items-center justify-center">
            <Store className="text-white" size={35}/>
          </div>
 <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
            DWELLO
          </Link>
          <h1 className="text-3xl font-bold mt-5">
            Seller Center
          </h1>

          <p className="text-zinc-500 mt-2">
            Sell products and manage your store
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <Link href="/auth/seller/login">
            <div className="border rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
              <LogIn className="text-amber-700 mb-4" size={35} />

              <h2 className="text-xl font-bold">
                I already have an account
              </h2>

              <p className="text-zinc-500 mt-2">
                Login to manage products, orders and analytics
              </p>
            </div>
          </Link>

          <Link href="/auth/seller/register">
            <div className="bg-zinc-950 text-white rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
              <UserPlus className="mb-4" size={35} />

              <h2 className="text-xl font-bold">
                I'm new here
              </h2>

              <p className="text-zinc-400 mt-2">
                Register your business and submit your seller application
              </p>
            </div>
          </Link>

        </div>
      </div>
    </main>
  );
}
