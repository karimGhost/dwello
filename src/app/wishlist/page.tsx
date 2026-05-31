"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  category?: string;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("dwello_wishlist") || "[]"));
  }, []);

  function saveWishlist(nextItems: WishlistItem[]) {
    setItems(nextItems);
    localStorage.setItem("dwello_wishlist", JSON.stringify(nextItems));
  }

  function removeItem(id: string) {
    saveWishlist(items.filter((item) => item.id !== id));
  }

  function clearWishlist() {
    saveWishlist([]);
  }

  function addToCart(item: WishlistItem) {
    const cart = JSON.parse(localStorage.getItem("dwello_cart") || "[]");

    const exists = cart.find((x: any) => x.id === item.id);

    const updatedCart = exists
      ? cart.map((x: any) =>
          x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
        )
      : [
          ...cart,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.image,
          },
        ];

    localStorage.setItem("dwello_cart", JSON.stringify(updatedCart));
    alert("Added to cart");
  }

  function addAllToCart() {
    items.forEach((item) => addToCart(item));
  }

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center mb-10">
          <div>
            <h1 className="text-4xl font-headline font-bold">Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length} saved item(s)
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex gap-3">
              <Button onClick={addAllToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>

              <Button variant="outline" onClick={clearWishlist}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-secondary/50 p-8 rounded-full mb-6">
              <Heart className="h-16 w-16 text-muted-foreground" />
            </div>

            <h2 className="text-2xl font-bold mb-2">
              Your wishlist is empty
            </h2>

            <p className="text-muted-foreground mb-8">
              Save products you like and come back to them later.
            </p>

            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <Card key={item.id} className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <Link href={`/products/${item.id}`}>
                  <div className="relative aspect-square bg-white">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                <div className="p-4 space-y-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {item.brand || item.category || "Product"}
                  </p>

                  <Link href={`/products/${item.id}`}>
                    <h3 className="font-headline text-lg font-bold hover:text-primary line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>

                  <p className="font-bold text-primary">
                    KSh {Number(item.price || 0).toLocaleString()}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length > 0 && (
          <div className="mt-10 text-right font-bold text-lg">
            Wishlist Value:{" "}
            <span className="text-primary">
              KSh {total.toLocaleString()}
            </span>
          </div>
        )}
      </main>
    </div>
  );
}