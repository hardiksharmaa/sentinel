// app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  // Check if the user is logged in
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">Sentinel Alpha</h1>
      
      {session ? (
        <div className="text-center">
          <p className="text-xl">Welcome back, {session.user?.name}!</p>
          <p className="text-gray-500">{session.user?.email}</p>
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
            ✅ You are authenticated. User ID: {session.user?.id}
          </div>
          <Link href="/api/auth/signout" className="mt-4 inline-block underline">
            Sign Out
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">You are not logged in.</p>
          <Link 
            href="/api/auth/signin" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Sign In with Google
          </Link>
        </div>
      )}
    </div>
  );
}