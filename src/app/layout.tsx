import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Plane, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlightM - Flight Management System",
  description: "Book and manage your flights with ease.",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900`}>
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
              <Plane className="h-6 w-6" />
              <span>FlightM</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/search" className="text-sm font-medium hover:text-blue-600">Search</Link>
              <Link href="/my-bookings" className="text-sm font-medium hover:text-blue-600">My Bookings</Link>
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                    <div className="rounded-full bg-blue-100 p-1">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>{user.user_metadata?.full_name || user.email}</span>
                  </Link>
                  <LogoutButton />
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <button className="text-sm font-medium hover:text-blue-600">Log In</button>
                  </Link>
                  <Link href="/register">
                    <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t bg-white py-8 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            © 2024 FlightM. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
