/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ApiMessage } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token manquant");
      return;
    }

    const verify = async () => {
      try {
        const res = await apiFetch<ApiMessage>(
          `/api/auth/verify-email?token=${token}`,
        );
        setStatus("success");
        setMessage(res.message);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Vérification de l&apos;email</CardTitle>
          <CardDescription>
            {status === "loading" && "Validation en cours..."}
            {status !== "loading" && message}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === "success" && (
            <Button onClick={() => router.push("/login")} className="w-full">
              Aller à la connexion
            </Button>
          )}

          {status === "error" && (
            <Button onClick={() => router.push("/register")} className="w-full">
              Retour à l&apos;inscription
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
