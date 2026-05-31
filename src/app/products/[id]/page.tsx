"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Truck,
  ShieldCheck,
  Heart,
  ShoppingCart,
  Share2,
  ChevronRight,
} from "lucide-react";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { any } from "zod";

type Product = {
  id: string;
  name: string;
  brand?: string;
  sku?: string;
  category?: string;
  description?: string;
  price: number;
  salePrice?: number;
  stock?: number;
  deliveryFee?: number;
  coverImage?: string;
  images?: string[];
  storeName?: string;
  rating?: number;
  reviewCount?: number;
  status?: string;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
function addToWishlist(prod: Product) {
  const item = {
    id: prod.id,
    name: prod.name,
    price: Number(prod.salePrice || prod.price || 0),
    image: prod.coverImage || prod.images?.[0] || "/placeholder.png",
    brand: prod.brand || "",
    category: prod.category || "",
  };

  const wishlist = JSON.parse(localStorage.getItem("dwello_wishlist") || "[]");

  const exists = wishlist.find((x: any) => x.id === prod.id);

  if (exists) {
    alert("Already in wishlist");
    return;
  }

  localStorage.setItem("dwello_wishlist", JSON.stringify([...wishlist, item]));
  alert("Added to wishlist");
}
  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct({
        id: productSnap.id,
        ...productSnap.data(),
      } as Product);

      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  function addToCart() {
  if (!product) return;

  const cartItem = {
    id: product.id,
    name: product.name,
    price: Number(product.salePrice || product.price || 0),
    quantity: 1,
    image: product.coverImage || product.images?.[0] || "/placeholder.png",
    sellerId: (product as any).sellerId || "",
    storeName: product.storeName || "",
    deliveryFee: Number(product.deliveryFee || 0),
  };

  const existingCart = JSON.parse(localStorage.getItem("dwello_cart") || "[]");

  const itemExists = existingCart.find((item: any) => item.id === product.id);

  let updatedCart;

  if (itemExists) {
    updatedCart = existingCart.map((item: any) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  } else {
    updatedCart = [...existingCart, cartItem];
  }

  localStorage.setItem("dwello_cart", JSON.stringify(updatedCart));

  alert("Added to cart");
}

  const productImages = useMemo(() => {
    if (!product) return ["/placeholder.png"];

    const imgs = [
      product.coverImage,
      ...(product.images || []),
    ].filter(Boolean) as string[];

    return Array.from(new Set(imgs)).length > 0
      ? Array.from(new Set(imgs))
      : ["/placeholder.png"];
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          Loading product...
        </div>
      </div>
    );
  }
// addto cart
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 space-y-4">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Button onClick={() => router.push("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const displayPrice = Number(product.salePrice || product.price || 0);
  const normalPrice = Number(product.price || 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span>{product.category || "Product"}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border">
              <Image
                src={productImages[selectedImage] || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                {product.category || "Product"}
              </Badge>

              <h1 className="text-4xl md:text-5xl font-headline font-bold">
                {product.name}
              </h1>

              <p className="text-sm text-muted-foreground">
                Sold by {product.storeName || "Dwello Seller"}
              </p>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= Math.round(product.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      }`}
                    />
                  ))}

                  <span className="ml-1 text-sm font-bold">
                    {product.rating || 0}
                  </span>
                </div>

                <span className="text-sm text-muted-foreground border-l pl-6">
                  {product.reviewCount || 0} reviews
                </span>
              </div>

              <div>
                <p className="text-3xl font-bold text-primary">
                  KSh {displayPrice.toLocaleString()}
                </p>

                {product.salePrice && product.salePrice > 0 && (
                  <p className="text-sm text-muted-foreground line-through">
                    KSh {normalPrice.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description || "No description added for this product."}
            </p>

            <div>
              <Badge
                className={
                  Number(product.stock || 0) > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              >
                {Number(product.stock || 0) > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
             <Button
  size="lg"
  disabled={Number(product.stock || 0) <= 0}
  onClick={addToCart}
  className="flex-1 bg-primary text-white hover:bg-primary/90 h-14 text-lg rounded-none"
>
  <ShoppingCart className="mr-2 h-5 w-5" />
  Add to Cart
</Button>

                 <Button
  size="icon"
  variant="secondary"
  onClick={(e) => {
    e.preventDefault();
    addToWishlist(product);
  }}
  className="rounded-full shadow-lg"
>
  <Heart className="h-4 w-4" />
</Button>

              <Button
                size="lg"
                variant="outline"
                className="h-14 w-14 p-0 rounded-none"
                onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
              >
                <Share2 className="h-6 w-6 text-primary" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Delivery Fee</p>
                  <p className="text-xs text-muted-foreground">
                    KSh {Number(product.deliveryFee || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Verified Seller</p>
                  <p className="text-xs text-muted-foreground">
                    Secure Dwello checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-14 p-0 gap-8">
              <TabsTrigger value="details">Product Details</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="pt-10">
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                {product.description || "No extra product details available."}
              </p>
            </TabsContent>

            <TabsContent value="specs" className="pt-10">
              <div className="max-w-xl space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="font-medium">{product.brand || "N/A"}</span>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">SKU</span>
                  <span className="font-medium">{product.sku || "N/A"}</span>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{product.category || "N/A"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-medium">{product.stock || 0}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}