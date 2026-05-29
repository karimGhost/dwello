"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Eye,
   Search,
    Store,
     Mail,
      Phone,
       MapPin,
       LogOut,
       
       
} from "lucide-react";


import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
type Seller = {
  id: string;
  status: string;
  verified: boolean;

  account?: {
    ownerName?: string;
    email?: string;
    phone?: string;
  };

  qualification?: {
    idNumber?: string;
    businessType?: string;
    businessRegistrationNumber?: string;
    taxNumber?: string;
  };

  settlement?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    mpesaNumber?: string;
  };

  store?: {
    storeName?: string;
    storeCategory?: string;
    storeLocation?: string;
    storeDescription?: string;
  };
};

type Order = {
  id: string;
  customerName?: string;
  status?: string;
  total?: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [usersCount, setUsersCount] = useState(0);
  const [sellersCount, setSellersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingSellers, setPendingSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
const [sellerSearch, setSellerSearch] = useState("");

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [orders]);

  async function loadDashboard() {
    setLoading(true);

    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const sellersSnap = await getDocs(collection(db, "sellers"));
      const productsSnap = await getDocs(collection(db, "products"));

      const ordersSnap = await getDocs(
        query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(10))
      );

      const pendingSnap = await getDocs(
        query(collection(db, "sellers"), where("status", "==", "pending"))
      );


      setUsersCount(usersSnap.size);
      setSellersCount(sellersSnap.size);
      setProductsCount(productsSnap.size);

      setOrders(
        ordersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]
      );

      setPendingSellers(
        pendingSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Seller[]
      );
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function approveSeller(sellerId: string) {
    const idToken = await auth.currentUser?.getIdToken();

    if (!idToken) {
      alert("Admin not logged in");
      return;
    }

    await fetch("/api/admin/sellers/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sellerId, idToken }),
    });

    await loadDashboard();
  }

  async function rejectSeller(sellerId: string) {
    const idToken = await auth.currentUser?.getIdToken();

    if (!idToken) {
      alert("Admin not logged in");
      return;
    }

    await fetch("/api/admin/sellers/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sellerId, idToken }),
    });

    await loadDashboard();
  }


const filteredPendingSellers = useMemo(() => {
  return pendingSellers.filter((seller) => {
    const name = seller.store?.storeName?.toLowerCase() || "";
    const owner = seller.account?.ownerName?.toLowerCase() || "";
    const email = seller.account?.email?.toLowerCase() || "";
    const search = sellerSearch.toLowerCase();

    return (
      name.includes(search) ||
      owner.includes(search) ||
      email.includes(search)
    );
  });
}, [pendingSellers, sellerSearch]);

async function logoutAdmin() {
  await fetch("/api/admin/session", {
    method: "DELETE",
  });

  await auth.signOut();
  router.push("/auth/admin");
}
  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-headline font-bold">Admin Hub</h1>
        <p className="text-muted-foreground">
          Global overview of Dwello operations
        </p>
        <LogOut style={{float:"right"}} onClick={() => logoutAdmin()}>Logout</LogOut>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`KSh ${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
        />

        <StatCard
          title="Total Orders"
          value={orders.length.toString()}
          icon={<ShoppingBag className="h-5 w-5" />}
        />

        <StatCard
          title="Total Users"
          value={usersCount.toString()}
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          title="Total Products"
          value={productsCount.toString()}
          icon={<Package className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders across the platform</CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No orders yet
                    </TableCell>
                  </TableRow>
                )}

                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName || "Customer"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      KSh {Number(order.total || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
  <CardHeader>
    <CardTitle>Merchant Requests</CardTitle>
    <CardDescription>Pending seller registrations</CardDescription>

    <div className="relative mt-4">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search sellers..."
        className="pl-9"
        value={sellerSearch}
        onChange={(e) => setSellerSearch(e.target.value)}
      />
    </div>
  </CardHeader>

  <CardContent className="space-y-5">
    {filteredPendingSellers.length === 0 && (
      <p className="text-sm text-muted-foreground">
        No pending seller applications.
      </p>
    )}

    {filteredPendingSellers.map((seller) => (
      <div
        key={seller.id}
        className="flex items-center justify-between gap-3 border rounded-2xl p-4"
      >
        <div>
          <p className="text-sm font-bold">
            {seller.store?.storeName || "Unnamed Store"}
          </p>

          <p className="text-xs text-muted-foreground">
            {seller.store?.storeCategory || "No category"}
          </p>

          <p className="text-xs text-muted-foreground">
            Owner: {seller.account?.ownerName || "Unknown"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedSeller(seller)}
            className="h-9 w-9 p-0 text-blue-600"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => rejectSeller(seller.id)}
            className="h-9 w-9 p-0 text-red-600"
          >
            <AlertCircle className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => approveSeller(seller.id)}
            className="h-9 w-9 p-0 text-green-600"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ))}
  </CardContent>
</Card>
      </div>

      <Dialog
  open={!!selectedSeller}
  onOpenChange={() => setSelectedSeller(null)}
>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {selectedSeller?.store?.storeName || "Seller Application"}
      </DialogTitle>

      <DialogDescription>
        Review seller details before approval.
      </DialogDescription>
    </DialogHeader>

    {selectedSeller && (
      <div className="space-y-6">
        <Section title="Account Information">
          <Info label="Owner Name" value={selectedSeller.account?.ownerName} />
          <Info label="Email" value={selectedSeller.account?.email} />
          <Info label="Phone" value={selectedSeller.account?.phone} />
        </Section>

        <Section title="Qualification Information">
          <Info label="ID Number" value={selectedSeller.qualification?.idNumber} />
          <Info label="Business Type" value={selectedSeller.qualification?.businessType} />
          <Info label="Business Registration Number" value={selectedSeller.qualification?.businessRegistrationNumber} />
          <Info label="Tax Number / KRA PIN" value={selectedSeller.qualification?.taxNumber} />
        </Section>

        <Section title="Settlement Information">
          <Info label="Bank Name" value={selectedSeller.settlement?.bankName} />
          <Info label="Account Name" value={selectedSeller.settlement?.accountName} />
          <Info label="Account Number" value={selectedSeller.settlement?.accountNumber} />
          <Info label="M-Pesa Number" value={selectedSeller.settlement?.mpesaNumber} />
        </Section>

        <Section title="Store Information">
          <Info label="Store Name" value={selectedSeller.store?.storeName} />
          <Info label="Category" value={selectedSeller.store?.storeCategory} />
          <Info label="Location" value={selectedSeller.store?.storeLocation} />
          <Info label="Description" value={selectedSeller.store?.storeDescription} />
        </Section>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            className="text-red-600"
            onClick={() => {
              rejectSeller(selectedSeller.id);
              setSelectedSeller(null);
            }}
          >
            Reject Seller
          </Button>

          <Button
            onClick={() => {
              approveSeller(selectedSeller.id);
              setSelectedSeller(null);
            }}
          >
            Approve Seller
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <h3 className="font-bold mb-4">{title}</h3>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium break-words">
        {value || "Not provided"}
      </p>
    </div>
  );
}