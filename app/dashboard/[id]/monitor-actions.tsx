"use client";

import { triggerCheck, deleteMonitor } from "./actions";
import { useState } from "react";
import { Play, Trash2, Loader2 } from "lucide-react";

export default function MonitorActions({ id, url }: { id: string, url: string }) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    await triggerCheck(id, url);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this monitor?")) {
        setIsDeleting(true);
        await deleteMonitor(id);
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleCheck}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
        Run Check
      </button>

      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-white rounded-md hover:bg-red-50"
      >
        <Trash2 size={16} />
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}