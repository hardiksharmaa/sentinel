"use client";

import { Trash2, Loader2 } from "lucide-react";
import { deleteStatusPage } from "./actions";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this status page?")) {
      setLoading(true);
      await deleteStatusPage(id);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
      title="Delete Page"
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
    </button>
  );
}