"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  loginSchema,
  type LoginInput,
} from "@/features/auth/schemas/login-schema";
import {
  AuthError,
  signInWithEmail,
} from "@/features/auth/services/auth-client";
import { ROUTES } from "@/lib/constants/routes";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || ROUTES.admin.dashboard;

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signInWithEmail(values.email, values.password);
      toast.success("Signed in successfully");
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof AuthError ? error.message : "Sign-in failed.";
      toast.error(message);
      form.setError("password", { message: " " });
    }
  });

  return {
    form,
    onSubmit,
  };
}
