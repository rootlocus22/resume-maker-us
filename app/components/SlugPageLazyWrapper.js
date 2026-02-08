"use client";
import LazyRoleContent from "./LazyRoleContent";

export default function SlugPageLazyWrapper({ role, relatedRoles }) {
    // CLS OPTIMIZATION: Reserve substantial vertical space for this client-side component 
    // to prevent the footer from jumping down 2000px+ after hydration.
    return (
        <div className="min-h-[1200px]">
            <LazyRoleContent role={role} relatedRoles={relatedRoles} />
        </div>
    );
}
