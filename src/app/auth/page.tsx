"use client";

import Link from "next/link";
import { ShoppingBag, Store, ArrowRight } from "lucide-react";

export default function AuthSelectionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">

        <div className="text-center mb-10">
             <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
            DWELLO
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome
          </h1>

          <p className="text-zinc-500 mt-3">
            Continue shopping or start selling on our platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* CUSTOMER */}

          <Link href="/auth/customer">
            <div className="
            h-full
            rounded-3xl
            border
            bg-white
            p-8
            cursor-pointer
            transition-all
            hover:shadow-2xl
            hover:-translate-y-1
            group">

              <div className="
              w-16
              h-16
              rounded-2xl
              bg-amber-100
              flex
              items-center
              justify-center">

                <ShoppingBag
                  className="
                  text-amber-700"
                  size={30}
                />

              </div>

              <h2 className="
              text-2xl
              font-bold
              mt-6">

                Shop Products

              </h2>

              <p className="
              text-zinc-500
              mt-3">

                Login or create an account to browse products, save items, track orders and checkout.

              </p>

              <div className="
              mt-6
              flex
              items-center
              text-amber-900
              font-semibold">

                Continue

                <ArrowRight
                  className="
                  ml-2
                  group-hover:translate-x-2
                  transition"
                  size={18}
                />

              </div>

            </div>
          </Link>


          {/* SELLER */}

          <Link href="/auth/seller">
            <div className="
            h-full
            rounded-3xl
            bg-zinc-950
            text-white
            p-8
            cursor-pointer
            transition-all
            hover:shadow-2xl
            hover:-translate-y-1
            group">

              <div className="
              w-16
              h-16
              rounded-2xl
              bg-primary
              flex
              items-center
              justify-center">

                <Store size={30} />

              </div>

              <h2 className="
              text-2xl
              font-bold
              mt-6">

                Become a Seller

              </h2>

              <p className="
              text-zinc-400
              mt-3">

                Create your store, upload products, manage orders and track analytics.

              </p>

              <div className="
              mt-6
              flex
              items-center
              text-amber-900
              font-semibold">

                Start Selling

                <ArrowRight
                  className="
                  ml-2
                  group-hover:translate-x-2
                  transition"
                  size={18}
                />

              </div>

            </div>
          </Link>

        </div>
      </div>
    </main>
  );
}

