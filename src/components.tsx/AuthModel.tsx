"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  CheckCircle2,
  CircleDashed,
  KeyRound,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { signIn } from "next-auth/react";

type PropType = {
  open: boolean;
  onClose: () => void;
};

type StepType = "login" | "signup" | "otp" | "forgot" | "reset";

export default function AuthModel({ open, onClose }: PropType) {
  const [step, setStep] = useState<StepType>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const resetForm = () => {
    setErr("");
    setSuccessMsg("");
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setErr("");
    try {
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setSuccessMsg("Verification code sent to your email!");
      setStep("otp");
    } catch (error: any) {
      setErr(error.response?.data?.message ?? "Something went wrong during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    setErr("");
    try {
      await axios.post("/api/auth/verify-email", {
        email,
        otp: otp.join(""),
      });
      setOtp(["", "", "", "", "", ""]);
      setSuccessMsg("Email verified! You can now log in.");
      setStep("login");
    } catch (error: any) {
      setErr(
        error.response?.data?.message ?? "Verification failed, please check your OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setErr(
          res.error === "CredentialsSignin"
            ? "Invalid email or password"
            : res.error
        );
      } else if (res?.ok) {
        setErr("");
        onClose();
        window.location.reload();
      }
    } catch (error: any) {
      setErr("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google");
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErr("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const { data } = await axios.post("/api/auth/forgot-password", { email });
      setSuccessMsg(data.message || "Reset code sent to your email!");
      setStep("reset");
    } catch (error: any) {
      setErr(error.response?.data?.message ?? "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword) {
      setErr("Please enter the 6-digit code and your new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const { data } = await axios.post("/api/auth/reset-password", {
        email,
        token: resetCode,
        newPassword,
      });
      setSuccessMsg(data.message || "Password updated! You can now log in.");
      setPassword("");
      setStep("login");
    } catch (error: any) {
      setErr(error.response?.data?.message ?? "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOtp = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 z-[100] text-slate-800"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            {/* Header Brand */}
            <div className="text-center mb-6 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-green-500/25 mb-3">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Sapphire<span className="text-green-600">IQ</span> RealEstate
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Buy, Rent & Explore Verified Properties
              </p>
            </div>

            {/* Success Alert */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Social Auth (Login/Signup Only) */}
            {(step === "login" || step === "signup") && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-11 rounded-xl border border-slate-200 flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Image
                    src="/google.png"
                    alt="google"
                    width={18}
                    height={18}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    OR
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </>
            )}

            {/* STEP: LOGIN */}
            {step === "login" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
                    <Mail size={16} className="text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full bg-transparent outline-none text-xs text-slate-800"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                    />
                  </div>

                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
                    <Lock size={16} className="text-slate-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full bg-transparent outline-none text-xs text-slate-800"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setStep("forgot");
                      }}
                      className="text-xs text-green-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-green-600 text-white font-semibold text-xs hover:bg-green-700 transition flex items-center justify-center shadow-md shadow-green-500/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <CircleDashed size={16} className="animate-spin text-white" />
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  {err && <p className="text-rose-500 text-xs text-center">*{err}</p>}
                </div>

                <p className="mt-5 text-center text-xs text-slate-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-green-600 font-semibold hover:underline ml-1"
                    onClick={() => {
                      resetForm();
                      setStep("signup");
                    }}
                  >
                    Create Account
                  </button>
                </p>
              </motion.div>
            )}

            {/* STEP: SIGNUP */}
            {step === "signup" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
                    <User size={16} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full bg-transparent outline-none text-xs text-slate-800"
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                    />
                  </div>

                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
                    <Mail size={16} className="text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full bg-transparent outline-none text-xs text-slate-800"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                    />
                  </div>

                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
                    <Lock size={16} className="text-slate-400" />
                    <input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      className="w-full bg-transparent outline-none text-xs text-slate-800"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                    />
                  </div>

                  <button
                    onClick={handleSignUp}
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-green-600 text-white font-semibold text-xs hover:bg-green-700 transition flex items-center justify-center shadow-md shadow-green-500/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <CircleDashed size={16} className="animate-spin text-white" />
                    ) : (
                      "Create Account & Send OTP"
                    )}
                  </button>

                  {err && <p className="text-rose-500 text-xs text-center">*{err}</p>}
                </div>

                <p className="mt-5 text-center text-xs text-slate-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-green-600 font-semibold hover:underline ml-1"
                    onClick={() => {
                      resetForm();
                      setStep("login");
                    }}
                  >
                    Sign In
                  </button>
                </p>
              </motion.div>
            )}

            {/* STEP: OTP VERIFICATION */}
            {step === "otp" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-center mb-5">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Verify Your Email
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the 6-digit OTP code sent to <b>{email}</b>
                  </p>
                </div>

                <div className="flex justify-between gap-2 mb-4">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      value={digit}
                      maxLength={1}
                      className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-green-500 outline-none transition"
                      onChange={(e) => handleChangeOtp(i, e.target.value)}
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyEmail}
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-green-600 text-white font-semibold text-xs hover:bg-green-700 transition flex items-center justify-center shadow-md shadow-green-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <CircleDashed size={16} className="animate-spin text-white" />
                  ) : (
                    "Verify & Complete Registration"
                  )}
                </button>

                {err && <p className="text-rose-500 text-xs text-center mt-3">*{err}</p>}
              </motion.div>
            )}

            {/* STEP: FORGOT PASSWORD */}
            {step === "forgot" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Reset Your Password
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your email to receive a 6-digit password reset code.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
                    <Mail size={16} className="text-slate-400" />
                    <input
                      type="email"
                      placeholder="Registered email address"
                      className="w-full bg-transparent outline-none text-xs text-slate-800"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                    />
                  </div>

                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-green-600 text-white font-semibold text-xs hover:bg-green-700 transition flex items-center justify-center shadow-md shadow-green-500/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <CircleDashed size={16} className="animate-spin text-white" />
                    ) : (
                      "Send Reset Code"
                    )}
                  </button>

                  {err && <p className="text-rose-500 text-xs text-center">*{err}</p>}
                </div>

                <p className="mt-5 text-center text-xs text-slate-500">
                  Remember your password?{" "}
                  <button
                    type="button"
                    className="text-green-600 font-semibold hover:underline ml-1"
                    onClick={() => {
                      resetForm();
                      setStep("login");
                    }}
                  >
                    Back to Sign In
                  </button>
                </p>
              </motion.div>
            )}

            {/* STEP: RESET PASSWORD */}
            {step === "reset" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Set New Password
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the code sent to <b>{email}</b> and your new password.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
                    <KeyRound size={16} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="6-digit reset code"
                      maxLength={6}
                      className="w-full bg-transparent outline-none text-xs text-slate-800 tracking-widest font-mono"
                      onChange={(e) => setResetCode(e.target.value)}
                      value={resetCode}
                    />
                  </div>

                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
                    <Lock size={16} className="text-slate-400" />
                    <input
                      type="password"
                      placeholder="New password (min 6 characters)"
                      className="w-full bg-transparent outline-none text-xs text-slate-800"
                      onChange={(e) => setNewPassword(e.target.value)}
                      value={newPassword}
                    />
                  </div>

                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-green-600 text-white font-semibold text-xs hover:bg-green-700 transition flex items-center justify-center shadow-md shadow-green-500/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <CircleDashed size={16} className="animate-spin text-white" />
                    ) : (
                      "Update Password"
                    )}
                  </button>

                  {err && <p className="text-rose-500 text-xs text-center">*{err}</p>}
                </div>

                <p className="mt-5 text-center text-xs text-slate-500">
                  <button
                    type="button"
                    className="text-green-600 font-semibold hover:underline"
                    onClick={() => {
                      resetForm();
                      setStep("login");
                    }}
                  >
                    Back to Sign In
                  </button>
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
