"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  MessageCircle,
  Truck,
  Eye,
  ImagePlus,
  LogOut,
} from "lucide-react";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
type Product = {
  coverImage: string;
  id: string;
  name: string;
  brand?: string;
  sku?: string;
  category: string;
  description?: string;
  price: number;
  salePrice?: number;
  stock: number;
  deliveryFee?: number;
  imageUrl?: string;
  sellerId: string;
  storeName?: string;
  status: string;
  soldCount?: number;
  views?: number;
};

type Seller = {
  status?: string;
  verified?: boolean;
  store?: {
    storeName?: string;
  };
};

type Order = {
  id: string;
  customerName?: string;
  customerId?: string;
  productName?: string;
  productId?: string;
  quantity?: number;
  total?: number;
  status?: string;
};

export default function SellerDashboard() {
  const router = useRouter();
const [currentUser, setCurrentUser] =useState<FirebaseUser | null>(null);

  const [sellerId, setSellerId] = useState("");
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
const CLOUDINARY_CLOUD_NAME = "dzhoslb52";
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    sku: "",
    category: "",
    description: "",
    price: "",
    salePrice: "",
    stock: "",
    deliveryFee: "",
  });

useEffect(() => {
  const unsubAuth = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.push("/auth/seller/login");
      return;
    }

    setCurrentUser(user);
    setSellerId(user.uid);

    const sellerRef = doc(db, "sellers", user.uid);
    const sellerSnap = await getDoc(sellerRef);

    if (!sellerSnap.exists()) {
      router.push("/auth/seller/register");
      return;
    }

    const sellerData = sellerSnap.data() as Seller;
    setSeller(sellerData);

    if (sellerData.status !== "approved" || sellerData.verified !== true) {
      router.push("/seller/pending");
      return;
    }

    setLoading(false);
  });

  return () => unsubAuth();
}, [router]);

  useEffect(() => {
    if (!sellerId) return;

    const q = query(
      collection(db, "products"),
      where("sellerId", "==", sellerId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setProducts(
        snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as Product[]
      );
    });

    return () => unsub();
  }, [sellerId]);

  useEffect(() => {
    if (!sellerId) return;

    const q = query(
      collection(db, "orders"),
      where("sellerId", "==", sellerId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as Order[]
      );
    });

    return () => unsub();
  }, [sellerId]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.name} ${product.category} ${product.brand || ""}`;
      return text.toLowerCase().includes(search.toLowerCase());
    });
  }, [products, search]);

  const activeListings = products.filter((p) => p.status === "Active").length;
  const stockAlerts = products.filter((p) => Number(p.stock) <= 3).length;
  const outOfStock = products.filter((p) => Number(p.stock) <= 0).length;

  const totalStockValue = products.reduce((sum, product) => {
    return sum + Number(product.price || 0) * Number(product.stock || 0);
  }, 0);

  const totalSales = orders.reduce((sum, order) => {
    return sum + Number(order.total || 0);
  }, 0);

  async function uploadToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      throw new Error("Cloudinary config missing in .env.local");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);
    formData.append("folder", "dwello/products");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
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

  function resetForm() {
    setForm({
      name: "",
      brand: "",
      sku: "",
      category: "",
      description: "",
      price: "",
      salePrice: "",
      stock: "",
      deliveryFee: "",
    });

    setProductImages([]);
    setEditingId(null);
    setShowForm(false);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!sellerId) return;

    const stockNumber = Number(form.stock);
    const priceNumber = Number(form.price);
    const salePriceNumber = Number(form.salePrice || 0);
    const deliveryFeeNumber = Number(form.deliveryFee || 0);

    const productStatus =
      stockNumber <= 0
        ? "Out of Stock"
        : stockNumber <= 3
        ? "Low Stock"
        : "Active";

    let imageUrls: string[] = [];

if (productImages.length > 0) {
  imageUrls = await Promise.all(
    productImages.map((file) =>
      uploadToCloudinary(file)
    )
  );
}

    if (editingId) {
      await updateDoc(doc(db, "products", editingId), {
        name: form.name,
        brand: form.brand,
        sku: form.sku,
        category: form.category,
        description: form.description,
        price: priceNumber,
        salePrice: salePriceNumber,
        stock: stockNumber,
        deliveryFee: deliveryFeeNumber,
        status: productStatus,
        ...(imageUrls.length > 0 && {
  images: imageUrls,
  coverImage: imageUrls[0],
}),
        updatedAt: serverTimestamp(),
      });

      resetForm();
      return;
    }

    const productRef = doc(collection(db, "products"));

    await setDoc(productRef, {
      name: form.name,
      brand: form.brand,
      sku: form.sku,
      category: form.category,
      description: form.description,
      price: priceNumber,
      salePrice: salePriceNumber,
      stock: stockNumber,
      deliveryFee: deliveryFeeNumber,
 images: imageUrls,
  coverImage:imageUrls[0] || "",     
   status: productStatus,

      sellerId,
      storeName: seller?.store?.storeName || "",

      soldCount: 0,
      views: 0,
      rating: 0,
      reviewCount: 0,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    resetForm();
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setShowForm(true);

    setForm({
      name: product.name || "",
      brand: product.brand || "",
      sku: product.sku || "",
      category: product.category || "",
      description: product.description || "",
      price: String(product.price || ""),
      salePrice: String(product.salePrice || ""),
      stock: String(product.stock || ""),
      deliveryFee: String(product.deliveryFee || ""),
    });
  }

  async function deleteProduct(productId: string) {
    const confirmDelete = confirm("Delete this product?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "products", productId));
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await updateDoc(doc(db, "orders", orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  }


 

async function logoutSeller() {
  const ok = confirm("Do you want to logout?");
  if (!ok) return;

  await fetch("/api/seller/session", {
    method: "DELETE",
  });

  await signOut(auth);
  router.push("/auth/seller");
}
//    useEffect(() => {
//   const unsub = onAuthStateChanged(auth, (user) => {
//     setCurrentUser(user);
//   });

//   return () => unsub();
// }, []); imageurl


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading seller dashboard...
      </div>
    );
  }


  return (
    <div className="p-4 md:p-8 space-y-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
            DWELLO
          </Link>
          <h1 className="text-3xl font-headline font-bold">Seller Studio</h1>
          <h2>{    currentUser?.displayName || ""}</h2>
          <p className="text-muted-foreground">
            Manage products, orders, stock alerts and buyer chats
          </p>
        </div>
<Button variant="outline" onClick={logoutSeller}>
  <LogOut className="h-4 w-4 mr-2" />
  Logout
</Button>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => router.push("/seller/chats")}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Buyer Chats
          </Button>

          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product" : "Add Product"}</CardTitle>
            <CardDescription>
              Add complete product details for your ecommerce store
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={saveProduct} className="grid md:grid-cols-4 gap-4">
              <Input required placeholder="Product name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Brand" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
              <Input placeholder="SKU / Product code" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
              <Input required placeholder="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
              <Input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
              <Input type="number" placeholder="Sale price optional" value={form.salePrice} onChange={(e) => setForm((p) => ({ ...p, salePrice: e.target.value }))} />
              <Input required type="number" placeholder="Stock quantity" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
              <Input type="number" placeholder="Delivery fee" value={form.deliveryFee} onChange={(e) => setForm((p) => ({ ...p, deliveryFee: e.target.value }))} />

              <label className="md:col-span-2 rounded-xl border p-4 cursor-pointer hover:bg-muted/50">
                <div className="flex items-center gap-2 font-medium">
                  <ImagePlus className="h-4 w-4" />
                  Product Image
                </div>

               <input
  type="file"
  accept="image/*"
  multiple
  onChange={(e) =>
    setProductImages(Array.from(e.target.files || []))
  }
/>

                {productImages && (
                  <p className="text-xs text-green-600 mt-2">
                    Selected: {productImages[0]?.name}
                  </p>
                )}
              </label>

              <textarea
                placeholder="Product description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="md:col-span-2 min-h-28 rounded-xl border p-3 outline-none focus:ring-4 focus:ring-primary/10"
              />

              <div className="md:col-span-4 flex gap-3">
                <Button type="submit">
                  {editingId ? "Update Product" : "Save Product"}
                </Button>

                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatsCard title="Total Sales" value={`KSh ${totalSales.toLocaleString()}`} icon={<ShoppingBag className="h-6 w-6" />} />
        <StatsCard title="Stock Value" value={`KSh ${totalStockValue.toLocaleString()}`} icon={<Package className="h-6 w-6" />} />
        <StatsCard title="Orders" value={orders.length.toString()} icon={<Truck className="h-6 w-6" />} />
        <StatsCard title="Active Listings" value={activeListings.toString()} icon={<Eye className="h-6 w-6" />} />
        <StatsCard title="Stock Alerts" value={`${stockAlerts} items`} icon={<AlertTriangle className="h-6 w-6" />} />
      </div>

      {outOfStock > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            You have {outOfStock} product(s) out of stock. Update stock to continue selling.
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Recent Purchased Items</CardTitle>
          <CardDescription>Orders customers bought from your store</CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Chat</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No purchased items yet
                  </TableCell>
                </TableRow>
              )}

              {orders.slice(0, 6).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.productName || "Product"}</TableCell>
                  <TableCell>{order.customerName || "Customer"}</TableCell>
                  <TableCell>{order.quantity || 1}</TableCell>
                  <TableCell>KSh {Number(order.total || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <select
                      value={order.status || "pending"}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="rounded-lg border px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/seller/chats?buyer=${order.customerId || ""}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="font-headline">Inventory Manager</CardTitle>
              <CardDescription>Track and update your products</CardDescription>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="Search inventory..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No products found
                  </TableCell>
                </TableRow>
              )}

              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                 <TableCell>
  <img
    src={
      product.coverImage ||
      "/placeholder.png"
    }
    alt={product.name}
    className="
      h-12
      w-12
      rounded-xl
      object-cover
      border
    "
  />
</TableCell>

                  <TableCell>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.brand || "No brand"} • {product.sku || "No SKU"}
                    </p>
                  </TableCell>

                  <TableCell>{product.category}</TableCell>

                  <TableCell>
                    <p>KSh {Number(product.price || 0).toLocaleString()}</p>
                    {Number(product.salePrice || 0) > 0 && (
                      <p className="text-xs text-green-600">
                        Sale: KSh {Number(product.salePrice || 0).toLocaleString()}
                      </p>
                    )}
                  </TableCell>

                  <TableCell>{product.stock} units</TableCell>

                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        product.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : product.status === "Low Stock"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>

                  <TableCell>{product.soldCount || 0}</TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(product)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => deleteProduct(product.id)} className="cursor-pointer text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
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
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          {icon}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

