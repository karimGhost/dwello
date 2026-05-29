"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Filter,
  Star,
  ShoppingCart,
  Heart,
} from "lucide-react";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Product = {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  salePrice?: number;
  rating?: number;
  coverImage?: string;
  images?: string[];
  status?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("status", "==", "Active"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      setProducts(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
      );

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    const unique = products
      .map((p) => p.category)
      .filter(Boolean) as string[];

    return ["all", ...Array.from(new Set(unique))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (category !== "all") {
      list = list.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (search.trim()) {
      const s = search.toLowerCase();

      list = list.filter((p) =>
        `${p.name} ${p.brand || ""} ${p.category || ""}`
          .toLowerCase()
          .includes(s)
      );
    }

    if (sortBy === "low-high") {
      list.sort(
        (a, b) =>
          Number(a.salePrice || a.price || 0) -
          Number(b.salePrice || b.price || 0)
      );
    }

    if (sortBy === "high-low") {
      list.sort(
        (a, b) =>
          Number(b.salePrice || b.price || 0) -
          Number(a.salePrice || a.price || 0)
      );
    }

    return list;
  }, [products, category, search, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 space-y-8 hidden md:block">
            <div>
              <h3 className="font-headline font-bold text-lg mb-4">
                Categories
              </h3>

              <div className="space-y-2">
                {categories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <Checkbox
                      checked={category === cat}
                      onCheckedChange={() => setCategory(cat)}
                    />

                    <span className="text-sm group-hover:text-primary transition-colors capitalize">
                      {cat === "all" ? "All" : cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-headline font-bold">Catalog</h1>
                <p className="text-muted-foreground text-sm">
                  Showing {filteredProducts.length} results
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64"
                />

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="low-high">Price: Low to High</SelectItem>
                    <SelectItem value="high-low">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="md:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Categories</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className="block w-full text-left px-2 py-2 text-sm capitalize hover:bg-muted"
                      >
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {loading && (
              <p className="text-muted-foreground">Loading products...</p>
            )}

            {!loading && filteredProducts.length === 0 && (
              <p className="text-muted-foreground">No products found.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((prod) => {
                const image =
                  prod.coverImage || prod.images?.[0] || "/placeholder.png";

                const price = Number(prod.salePrice || prod.price || 0);

                return (
                  <Card
                    key={prod.id}
                    className="group border-none shadow-none bg-transparent"
                  >
                    <CardContent className="p-0">
                      <Link href={`/products/${prod.id}`}>
                        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-white">
                          <Image
                            src={image}
                            alt={prod.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="rounded-full shadow-lg"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="secondary"
                              className="rounded-full shadow-lg"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Link>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground uppercase tracking-widest">
                            {prod.brand || prod.category || "Product"}
                          </p>

                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold">
                              {prod.rating || 0}
                            </span>
                          </div>
                        </div>

                        <Link href={`/products/${prod.id}`}>
                          <h3 className="font-headline text-lg group-hover:text-primary transition-colors leading-tight">
                            {prod.name}
                          </h3>
                        </Link>

                        <p className="font-bold text-primary">
                          KSh {price.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}