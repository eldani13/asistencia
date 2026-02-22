"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      router.push("/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al ingresar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginCard
      email={email}
      password={password}
      showPassword={showPassword}
      error={error}
      loading={loading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onTogglePassword={() => setShowPassword((prev) => !prev)}
      onSubmit={handleSubmit}
    />
  );
}
