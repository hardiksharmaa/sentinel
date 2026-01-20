"use client";

import { useEffect, useState } from "react";

export default function DateDisplay({ date }: { date: Date | string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>--:--:--</span>; 
  }

  return <span>{new Date(date).toLocaleString()}</span>;
}