"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";
import { signOut, useSession } from "next-auth/react";
import AuthModel from "./AuthModel";
import {
  Building2,
  Calendar,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Sparkles,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "AI Hub", href: "/ai-hub" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session, status } = useSession();
  const { userData } = useSelector((state: RootState) => state.user);

  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync NextAuth session with Redux store
  useEffect(() => {
    if (session?.user) {
      dispatch(
        setUserData({
          ...session.user,
          role: (session.user as any).role || "user",
        })
      );
    } else if (status === "unauthenticated") {
      dispatch(setUserData(null));
    }
  }, [session, status, dispatch]);

  const handleLogOut = async () => {
    await signOut({ redirect: false });
    dispatch(setUserData(null));
    setProfileOpen(false);
    router.push("/");
  };

  const currentUser = userData || session?.user;

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50
         rounded-2xl bg-white backdrop-blur-md text-black border border-slate-800 shadow-xl py-3 px-5"
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-800 to-green-700 flex items-center justify-center shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight flex items-center gap-1.5">
                Real<span className="text-green-400">State</span>
              </span>
              <span className="text-[10px] text-black-400 tracking-wider uppercase font-semibold">
                Urban Living
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition flex items-center gap-1.5 ${
                    active
                      ? "text-green-400 font-semibold"
                      : "text-black hover:text-green-600"
                  }`}
                >
                  {item.label === "AI Hub" && (
                    <Sparkles className="w-3.5 h-3.5 text-green-700" />
                  )}
                  {item.label}
                </Link>
              );
            })}
            {currentUser && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition ${
                  pathname === "/dashboard"
                    ? "text-green-400 font-semibold"
                    : "text-black-300 hover:text-green-500"
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Post Property Button */}
            <Link
              href="/properties/new"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              List Property
            </Link>

            {/* User Profile or Sign In */}
            {!currentUser ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition shadow-sm"
              >
                Sign In
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-white border border-slate-100 transition text-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-600 to-green-600 text-white font-bold flex items-center justify-center text-xs">
                    {(currentUser.name || currentUser.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <span className="font-medium max-w-[100px] truncate hidden sm:inline">
                    {currentUser.name || "User"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-slate-200"
                    >
                      <div className="p-3 border-b border-slate-800 mb-1">
                        <p className="font-semibold text-sm text-white truncate">
                          {currentUser.name || "User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {currentUser.email}
                        </p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                          {(currentUser as any).role || "User"}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-800 hover:text-white transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-green-400" />
                          Dashboard 
                        </Link>
                        <Link
                          href="/dashboard?tab=properties"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-800 hover:text-white transition"
                        >
                          <Home className="w-4 h-4 text-emerald-400" />
                          My Listing
                        </Link>
                        <Link
                          href="/dashboard?tab=appointments"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-800 hover:text-white transition"
                        >
                          <Calendar className="w-4 h-4 text-amber-400" />
                          Bookings
                        </Link>
                        <Link
                          href="/properties/new"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-800 hover:text-white transition sm:hidden"
                        >
                          <PlusCircle className="w-4 h-4 text-green-400" />
                          Post New Property
                        </Link>
                      </div>

                      <div className="border-t border-slate-800 mt-1 pt-1">
                        <button
                          onClick={handleLogOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 rounded-xl hover:bg-rose-500/10 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen((m) => !m)}
              className="p-1.5 rounded-xl bg-green-600 text-slate-300 hover:text-white md:hidden"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-[92%] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 md:hidden space-y-2"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  {item.label}
                </Link>
              ))}
              {currentUser && (
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/properties/new"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                List Property
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModel open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
