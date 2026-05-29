"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth, db } from "@/lib/firebase";
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

export default function SellerLoginPage() {
  const router = useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);


 
async function verifySeller(uid: string) {
  const userSnap = await getDoc(
    doc(db, "users", uid)
  );

  if (!userSnap.exists()) {
    throw new Error("User account not found.");
  }

  const userData = userSnap.data();

  if (userData.role !== "seller") {
    throw new Error("Access denied. Sellers only.");
  }

  const sellerSnap = await getDoc(
    doc(db, "sellers", uid)
  );

  if (!sellerSnap.exists()) {
    throw new Error("Seller profile not found.");
  }

  const sellerData = sellerSnap.data();

  if (sellerData.status !== "approved") {
    throw new Error("Your seller account is pending approval.");
  }

  if (sellerData.verified !== true) {
    throw new Error("Seller account not verified yet.");
  }

  return true;
}



async function login(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);

    await verifySeller(res.user.uid);

    const idToken = await res.user.getIdToken();

    const sessionRes = await fetch("/api/seller/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!sessionRes.ok) {
      const data = await sessionRes.json();
      throw new Error(data.error || "Failed to create seller session");
    }

    router.push("/seller/dashboard");
  } catch (error: any) {
    alert(error.message);
      

  } finally {
    setLoading(false);
  }
}

  async function googleLogin() {
  try {
    setLoading(true);

    const provider = new GoogleAuthProvider();

    const res = await signInWithPopup(
      auth,
      provider
    );

    await verifySeller(res.user.uid);

    const idToken =
      await res.user.getIdToken();

    const sessionRes = await fetch(
      "/api/seller/session",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          idToken,
        }),
      }
    );

    if (!sessionRes.ok) {
      const data =
        await sessionRes.json();

      throw new Error(
        data.error ||
          "Failed to create seller session"
      );
    }

    router.push(
      "/seller/dashboard"
    );
  } catch (error: any) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
}

  async function forgotPassword(){

    if(!email){
      alert(
      "Enter email first"
      );
      return;
    }

    await sendPasswordResetEmail(
      auth,
      email
    );

    alert(
      "Reset email sent"
    );
  }


  return (

<main className="
min-h-screen
bg-zinc-100
flex
items-center
justify-center
p-6">

<div className="
w-full
max-w-md
bg-white
rounded-3xl
shadow-xl
p-8">

<button
onClick={()=>router.back()}
className="
mb-6
h-10
w-10
rounded-full
border
flex
items-center
justify-center">

<ArrowLeft size={18}/>

</button>

<div className="
w-20
h-20
mx-auto
rounded-3xl
bg-amber-700
flex
items-center
justify-center">

<Store
className="text-white"
size={35}
/>

</div>
 <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
            DWELLO
          </Link>
<h1 className="
text-center
text-3xl
font-bold
mt-5">

Seller Login

</h1>

<p className="
text-center
text-zinc-500
mt-2
mb-6">

Manage your store,
orders and analytics

</p>

<button
onClick={googleLogin}
className="
w-full
h-12
rounded-xl
border
mb-5
hover:bg-zinc-50">

Continue with Google

</button>

<form
onSubmit={login}
className="
space-y-4">

<div className="
relative">

<Mail
size={18}
className="
absolute
left-4
top-4
text-zinc-400"/>

<input
type="email"
value={email}
onChange={(e)=>
setEmail(
e.target.value
)}
placeholder="
Email Address"
className="
w-full
h-12
rounded-xl
border
pl-12"
/>

</div>

<div className="
relative">

<Lock
size={18}
className="
absolute
left-4
top-4
text-zinc-400"
/>

<input
type={
show
?
"text"
:
"password"
}

value={password}

onChange={(e)=>
setPassword(
e.target.value
)}

placeholder="
Password"

className="
w-full
h-12
rounded-xl
border
pl-12
pr-12"
/>

<button
type="button"
onClick={()=>
setShow(
!show
)
}
className="
absolute
right-4
top-4">

{
show
?
<EyeOff/>
:
<Eye/>
}

</button>

</div>

<button
type="button"
onClick={
forgotPassword
}
className="
text-sm
text-amber-700">

Forgot password?

</button>

<button
disabled={loading}
className="
w-full
h-12
rounded-xl
bg-amber-700
text-white">

{
loading
?
"Loading..."
:
"Login"
}

</button>

</form>

<p className="
text-center
mt-6
text-zinc-500">

Don't have an account?

<Link
href="
/auth/seller/register"
className="
ml-2
text-orange-500
font-semibold">

Register

</Link>

</p>

</div>

</main>


)
}