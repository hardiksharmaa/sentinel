"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { createStatusPage } from "./actions"; // Import the Server Action

type Monitor = {
  id: string;
  url: string;
  name: string | null;
};

export default function CreatePageModal({ monitors }: { monitors: Monitor[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    
    // Call the Server Action
    const result = await createStatusPage(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setIsOpen(false);
      setLoading(false);
      // The page will automatically refresh due to revalidatePath in the action
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2 cursor-pointer"
      >
        <Plus size={18} /> New Page
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Create Public Status Page</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input 
              name="title" 
              required 
              placeholder="e.g. Acme Corp Status" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
            <div className="flex items-center">
              <span className="bg-gray-100 border border-r-0 border-gray-300 text-gray-500 px-3 py-2 rounded-l-lg text-sm">
                /status/
              </span>
              <input 
                name="slug" 
                required 
                placeholder="acme-status" 
                className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea 
              name="description" 
              rows={2} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Monitors to Display</label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {monitors.length === 0 && (
                <p className="p-3 text-sm text-gray-400 text-center">No monitors found. Create one first!</p>
              )}
              {monitors.map((m) => (
                <label key={m.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" name="monitors" value={m.id} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700 font-medium truncate">{m.url}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Create Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}