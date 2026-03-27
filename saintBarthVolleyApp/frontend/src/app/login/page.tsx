"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((user) => {
        if (user.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      })
      .catch(() => {
        // pas connecté → OK
      })
      .finally(() => setCheckingAuth(false));
  }, [router]);

  // 🔒 évite flash login
  if (checkingAuth) return null;

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
