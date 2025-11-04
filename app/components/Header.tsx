"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function Header() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = () => supabase.auth.signOut();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="absolute inset-0 backdrop-blur-lg bg-green-800 shadow-md border-b border-green-200 opacity-40" />
      <div className="w-full px-4 pr-8 py-10 flex justify-between items-center relative">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-22 h-16 bg-transparent rounded-full flex items-center justify-end">
            <Leaf className="w-8 h-8 text-green-200" />
          </div>
          <span className="text-3xl font-bold bg-linear-to-r bg-white bg-clip-text text-white pl-10">
            VrukshaVeda
          </span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/" className="text-green-700 font-medium hover:text-teal-600">Home</Link>
          {session ? (
            <>
              <Link href="/admin" className="text-green-700 font-medium hover:text-teal-600">Admin</Link>
              <button onClick={logout} className="text-red-600 font-medium hover:text-red-700">Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </motion.nav>
  );
}
