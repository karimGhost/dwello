"use client";

import Link from "next/link";
import { Search,LogOut, ShoppingBag, Settings, ShoppingCart, Heart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { auth } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

export function Navbar() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
const [authLoading, setAuthLoading] =
  useState(true);

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
          setAuthLoading(false);

  });

  return () => unsub();
}, []);

async function handleLogout() {
  await signOut(auth);
}


  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
            DWELLO
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
            {/* <Link href="/style-match" className="hover:text-primary transition-colors">AI Advisor</Link> */}
            <Link href="/products?category=furniture" className="hover:text-primary transition-colors">Furniture</Link>
            <Link href="/products?category=appliances" className="hover:text-primary transition-colors">Appliances</Link>
          </div>
        </div>

        <div className="flex-1 max-w-md hidden lg:flex relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search for sofas, fridges..." 
            className="pl-9 bg-secondary/50 border-none focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-2">
                    <Link href="/wishlist">

          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Heart className="h-5 w-5" />
          </Button>
          </Link>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-accent text-[10px] flex items-center justify-center text-white">0</span>
            </Button>
          </Link>

         {currentUser ? (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <User className="h-5 w-5" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-56">
      <div className="px-3 py-2 border-b">
        <p className="font-semibold text-sm">
          {currentUser.displayName || "My Account"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {currentUser.email}
        </p>
      </div>

      <DropdownMenuItem asChild>
        <Link href="/account">
          <User className="h-4 w-4 mr-2" />
          Profile
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <Link href="/orders">
          <ShoppingBag className="h-4 w-4 mr-2" />
          My Orders
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <Link href="/wishlist">
          <Heart className="h-4 w-4 mr-2" />
          Wishlist
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <Link href="/settings">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={handleLogout}
        className="text-red-600 cursor-pointer"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
) : (
  <Link href="/auth">
    <Button variant="ghost" size="icon">
      <User className="h-5 w-5" />
    </Button>
  </Link>
)}
          
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/products" className="text-lg font-medium">Shop All</Link>
                {/* <Link href="/style-match" className="text-lg font-medium">AI Advisor</Link> */}
                <Link href="/products?category=furniture" className="text-lg font-medium">Furniture</Link>
                <Link href="/products?category=appliances" className="text-lg font-medium">Appliances</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}