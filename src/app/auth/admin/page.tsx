"use client";

import { useState } from "react";
import {
 signInWithEmailAndPassword,
 GoogleAuthProvider,
 signInWithPopup
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
 const router = useRouter();

 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [show,setShow]=useState(false);
 const [loading,setLoading]=useState(false);

 async function verifyAdmin(uid:string){

   const userRef=doc(db,"users",uid);

   const snap=await getDoc(userRef);

   if(!snap.exists()){
      throw new Error("No account found");
   }

   const data=snap.data();

   if(data.role!=="admin"){
      throw new Error(
       "Access denied. Admin only."
      );
   }

   return true;
 }

async function login(e: any) {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);

    await verifyAdmin(res.user.uid);

    const idToken = await res.user.getIdToken();

    const sessionRes = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!sessionRes.ok) {
      const data = await sessionRes.json();
      throw new Error(data.error || "Failed to create admin session");
    }

    router.push("/admin/dashboard");
  } catch (err: any) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
}

 async function googleLogin(){

 try{

 const provider=
 new GoogleAuthProvider();

 const res=
 await signInWithPopup(
 auth,
 provider
 );

 await verifyAdmin(
 res.user.uid
 );

 
 const idToken = await res.user.getIdToken();

const sessionRes = await fetch("/api/admin/session", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ idToken }),
});

if (!sessionRes.ok) {
  const data = await sessionRes.json();
  throw new Error(data.error || "Failed to create admin session");
}

 router.push("/admin/dashboard")

 }catch(err:any){
   alert(err.message)
 }

 }

 return(

 <main className="
 min-h-screen
 bg-gradient-to-br
 from-zinc-950
 via-black
 to-amber-950
 flex
 items-center
 justify-center
 p-6">

<div className="
w-full
max-w-md
bg-white
rounded-3xl
shadow-2xl
p-8">

<div className="
mx-auto
h-20
w-20
rounded-full
bg-amber-800
flex
items-center
justify-center">

<Shield size={35}/>

</div>

<h1 className="
text-center
font-bold
text-3xl
mt-5">

Admin Portal

</h1>

<p className="
text-center
text-zinc-500
mb-8">

Authorized staff only

</p>

<button
onClick={googleLogin}
className="
w-full
h-12
rounded-xl
border
mb-5">

Continue with Google

</button>

<form
onSubmit={login}
className="space-y-4">

<div className="relative">

<Mail
size={18}
className="
absolute
left-4
top-4
text-zinc-400"
/>

<input
value={email}
onChange={(e)=>
setEmail(
e.target.value
)}
placeholder="Admin email"
className="
w-full
pl-12
h-12
border
rounded-xl"
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
placeholder="Password"
className="
w-full
pl-12
pr-12
h-12
border
rounded-xl"
/>

<button
type="button"
onClick={()=>
setShow(!show)
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
disabled={loading}
className="
w-full
h-12
bg-amber-800
text-white
rounded-xl">

{
loading
?
"Loading..."
:
"Login Admin"
}

</button>

</form>

</div>
</main>

)

}

