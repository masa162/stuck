"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ArticlesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">リダイレクト中...</div>
    </div>
  );
}
