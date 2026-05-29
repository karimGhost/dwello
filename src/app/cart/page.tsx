"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sellerId?: string;
  storeName?: string;
  deliveryFee?: number;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("dwello_cart") || "[]");
    setCartItems(savedCart);
  }, []);

  function saveCart(items: CartItem[]) {
    setCartItems(items);
    localStorage.setItem("dwello_cart", JSON.stringify(items));
  }

  function increaseQuantity(id: string) {
    const updated = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    saveCart(updated);
  }

  function decreaseQuantity(id: string) {
    const updated = cartItems
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      );

    saveCart(updated);
  }

  function removeItem(id: string) {
    const updated = cartItems.filter((item) => item.id !== id);
    saveCart(updated);
  }

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const shipping = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.deliveryFee || 0),
      0
    );
  }, [cartItems]);

  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-secondary/50 p-8 rounded-full mb-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>

          <h2 className="text-2xl font-headline font-bold mb-2">
            Your cart is empty
          </h2>

          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>

          <Link href="/products">
            <Button className="bg-primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-headline font-bold mb-10">
          Shopping Bag
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            {cartItems.map((item) => (
              <Card key={item.id} className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4 sm:p-6 gap-6">
                    <Link
                      href={`/products/${item.id}`}
                      className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-lg overflow-hidden bg-secondary shrink-0"
                    >
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between mb-2">
                        <Link href={`/products/${item.id}`}>
                          <h3 className="font-headline text-lg font-bold truncate hover:text-primary">
                            {item.name}
                          </h3>
                        </Link>

                        <p className="font-bold text-primary">
                          KSh {Number(item.price).toLocaleString()}
                        </p>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {item.storeName || "Dwello Seller"}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-md px-2 py-1 gap-4">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="text-sm font-bold w-4 text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-4">
            <Card className="border-none shadow-lg sticky top-24">
              <CardContent className="p-8">
                <h3 className="text-xl font-headline font-bold mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      KSh {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Delivery</span>
                    <span className="font-medium">
                      KSh {shipping.toLocaleString()}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-primary">
                      KSh {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button className="w-full mt-8 bg-primary hover:bg-primary/90 text-white h-12 text-lg rounded-none">
                  Checkout Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <p>Secure checkout powered by Dwello Pay</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}