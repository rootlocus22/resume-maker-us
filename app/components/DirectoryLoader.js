"use client";
import dynamic from "next/dynamic";

// This component handles the client-side only loading of the heavy directory
const AllRolesDirectory = dynamic(() => import('./AllRolesDirectory'), {
    ssr: false,
    loading: () => <div className="py-20 text-center text-gray-500">Loading directory...</div>
});

export default function DirectoryLoader() {
    return <AllRolesDirectory />;
}
