"use client";

import { useEffect, useState } from "react";

export default function DateDisplay({ date }: { date: Date | string }) {
  // We use a "mounted" state to ensure the date matches the user's browser
  // This prevents "Hydration Errors" (Server saying one time, Client saying another)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>--:--:--</span>; // Placeholder while loading
  }

  return <span>{new Date(date).toLocaleString()}</span>;
}