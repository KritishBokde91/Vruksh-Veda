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
      className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 shadow-md border-b border-green-200"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-teal-700 bg-clip-text text-transparent">
            VrukshaVeda
          </span>
        </Link>
        <div className="flex gap-4">
          {session ? (
            <>
              <Link href="/admin" className="text-green-700 font-medium hover:text-teal-600">Dashboard</Link>
              <button onClick={logout} className="text-red-600 font-medium hover:text-red-700">Logout</button>
            </>
          ) : (
            <Link href="/login" className="text-green-700 font-medium hover:text-teal-600">Admin Login</Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

