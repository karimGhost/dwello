"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  Truck,
  ShieldCheck,
} from "lucide-react";

import { collection, onSnapshot, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  coverImage?: string;
  images?: string[];
  rating?: number;
  status?: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
const router = useRouter();

async function handleSellClick() {
  const user = auth.currentUser;

  if (!user) {
    router.push("/auth");
    return;
  }

  const confirmLogout = confirm(
    "You are currently logged in. Logout first to continue to seller authentication?"
  );

  if (!confirmLogout) return;

  try {
    await signOut(auth);
    router.push("/auth");
  } catch (err) {
    console.error(err);
    alert("Failed to logout.");
  }
}



async function handleProfileClick() {
  const user = auth.currentUser;

  if (!user) {
    router.push("/auth");
    return;
  }

  try {
   
    router.push("/account");
  } catch (err) {
    console.error(err);
    alert("Failed to logout.");
  }
}



  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("status", "==", "Active"),
      orderBy("createdAt", "desc"),
      limit(8)
    );

    const unsub = onSnapshot(q, (snap) => {
      setProducts(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
      );
    });

    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

    return unique.slice(0, 4).map((cat) => {
      const product = products.find((p) => p.category === cat);

      return {
        name: cat,
        image: product?.coverImage || product?.images?.[0] || "/placeholder.png",
      };
    });
  }, [products]);

  const heroImage =
    products[0]?.coverImage ||
    products[0]?.images?.[0] ||
    "/placeholder.png";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="relative w-full h-[70vh] flex items-center overflow-hidden">
        <Image
          src={heroImage}
          alt="Dwello home products"
          fill
          className="object-cover brightness-75"
          priority
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 leading-tight">
              Crafted for Your <br /> Perfect Home
            </h1>

            <p className="text-lg md:text-xl mb-8 text-white/90 font-light">
              Shop real furniture and home appliances from verified sellers.
            </p>

            <Link href="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-none px-8">
                Shop Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Seller Delivery</p>
                <p className="text-xs text-muted-foreground">Delivery fee shown per item</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Verified Sellers</p>
                <p className="text-xs text-muted-foreground">Approved merchant stores</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Quality Products</p>
                <p className="text-xs text-muted-foreground">Furniture and appliances</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-headline font-bold mb-2">Shop by Category</h2>
              <p className="text-muted-foreground">Real categories from seller products.</p>
            </div>

            <Link href="/products" className="text-primary font-bold flex items-center gap-1 group">
              View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.length === 0 && (
              <p className="text-muted-foreground">No categories yet.</p>
            )}

            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-white text-xl font-headline font-semibold">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-headline font-bold mb-4">Trending Products</h2>
            <p className="text-muted-foreground">
              Latest active products uploaded by sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length === 0 && (
              <p className="text-muted-foreground">No products available yet.</p>
            )}

            {products.map((prod) => (
              <Card key={prod.id} className="group border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-white">
                    <Image
                      src={prod.coverImage || prod.images?.[0] || "/placeholder.png"}
                      alt={prod.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      {prod.category}
                    </p>

                    <Link href={`/products/${prod.id}`}>
                      <h3 className="font-headline text-lg group-hover:text-primary transition-colors">
                        {prod.name}
                      </h3>
                    </Link>

                    <p className="font-bold text-primary">
                      KSh {Number(prod.salePrice || prod.price || 0).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-secondary/20 py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <Link href="/" className="font-headline text-3xl font-bold tracking-tight text-primary">
                DWELLO
              </Link>

              <p className="text-muted-foreground leading-relaxed">
                Furniture and home appliances from verified sellers.
              </p>
            </div>

            <div>
              <h4 className="font-headline font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary">Products</Link></li>
<li>
  <button
    onClick={handleSellClick}
    className="hover:text-primary"
  >
    Sell on Dwello
  </button>
</li>                <li>
   <button
    onClick={handleProfileClick}
    className="hover:text-primary"
  >
My Account  </button>
  </li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/orders" className="hover:text-primary">Order Tracking</Link></li>
                <li><Link href="/" className="hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline font-bold mb-6">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe for offers and updates.
              </p>

              <div className="flex gap-2">
                <Input placeholder="Your email" className="bg-white" />
                <Button>Join</Button>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Dwello Home Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}