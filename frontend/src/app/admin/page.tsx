"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";

export default function AdminPage() {
  const router = useRouter();

  const handleSwitch = (portal: "public" | "admin" | "company") => {
    if (portal === "public") router.push("/");
    if (portal === "company") router.push("/company");
  };

  return <AdminDashboard onSwitchPortal={handleSwitch} />;
}
