"use client";
import { Inter } from "next/font/google";
import { ExtensionProvider } from "./context/ExtensionContext";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, Settings, FileText, ChevronLeft } from "lucide-react";
import Image from "next/image";
import ThemeLogo from "./components/ThemeLogo";

const inter = Inter({ subsets: ["latin"] });

function ExtensionNav() {
    const router = useRouter();
    const pathname = usePathname();
    const isHome = pathname === '/extension/sidebar';

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                {!isHome && (
                    <button
                        onClick={() => router.back()}
                        className="p-1 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
                <div className="flex items-center cursor-pointer" onClick={() => router.push('/extension/sidebar')}>
                    <ThemeLogo />
                </div>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
                <button
                    onClick={() => router.push('/extension/sidebar')}
                    className={`hover:text-blue-600 transition-colors ${isHome ? 'text-blue-600' : ''}`}
                    title="Job Detection"
                >
                    <Home size={18} />
                </button>
                {/* Placeholder for future features */}
                {/* <button className="hover:text-blue-600 transition-colors"><User size={18} /></button> */}
            </div>
        </header >
    );
}

export default function ExtensionLayout({ children }) {
    return (
        <ExtensionProvider>
            <div className={`min-h-screen bg-white ${inter.className}`}>
                <ExtensionNav />
                <main className="p-0">
                    {children}
                </main>
            </div>
        </ExtensionProvider>
    );
}
