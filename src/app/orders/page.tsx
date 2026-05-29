"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";

type Order = {
  id: string;
  productName?: string;
  productImage?: string;
  total?: number;
  quantity?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: any;
};

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubOrders: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      const q = query(
        collection(db, "orders"),
        where("customerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      unsubOrders = onSnapshot(q, (snap) => {
        setOrders(
          snap.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })) as Order[]
        );

        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubOrders) unsubOrders();
    };
  }, [router]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="p-8">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <main className="min-h-screen bg-zinc-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-5">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-zinc-500">
              Track your purchases and delivery progress.
            </p>
          </div>

          {orders.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center">
              <Package className="mx-auto mb-3 text-zinc-400" />
              <p className="font-semibold">No orders yet</p>
              <p className="text-zinc-500 text-sm">
                Your purchased items will appear here after checkout.
              </p>
            </div>
          )}

          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 flex flex-col md:flex-row gap-5 md:items-center justify-between shadow-sm"
            >
              <div className="flex gap-4 items-center">
                {order.productImage ? (
                  <img
                    src={order.productImage}
                    alt={order.productName || "Product"}
                    className="h-20 w-20 rounded-2xl object-cover border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-zinc-100 flex items-center justify-center">
                    <Package />
                  </div>
                )}

                <div>
                  <p className="font-bold">{order.productName || "Product"}</p>
                  <p className="text-sm text-zinc-500">Order ID: {order.id}</p>
                  <p className="text-sm text-zinc-500">
                    Quantity: {order.quantity || 1}
                  </p>
                  <p className="text-sm text-zinc-500 capitalize">
                    Payment: {order.paymentStatus || "unpaid"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <Badge variant="outline" className="w-fit capitalize">
                  <Truck className="h-3 w-3 mr-1" />
                  {order.status || "pending"}
                </Badge>

                <p className="font-bold">
                  KSh {Number(order.total || 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}