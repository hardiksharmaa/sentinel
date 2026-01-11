// app/dashboard/monitor-form.tsx
"use client";

import { createMonitor } from "./actions";
import { useState } from "react";
import { Plus } from "lucide-react"; // Icon

export default function MonitorForm() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* The Trigger Button */}
      <button 
        onClick={() => setOpen(true)}
        className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2 cursor-pointer"
      >
        <Plus size={16} /> Add New Monitor
      </button>

      {/* The Modal Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add New Monitor</h2>
            
            <form 
              action={async (formData) => {
                await createMonitor(formData);
                setOpen(false); // Close modal on success
              }} 
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  name="name" 
                  placeholder="e.g. My Portfolio" 
                  className="w-full border rounded-md p-2" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL to Track</label>
                <input 
                  name="url" 
                  type="url"
                  placeholder="https://..." 
                  className="w-full border rounded-md p-2" 
                  required 
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}