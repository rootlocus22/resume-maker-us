"use client";
import dynamic from "next/dynamic";
import CategoryListSkeleton from "./CategoryListSkeleton";

const LazyCategoryList = dynamic(() => import("./LazyCategoryList"), {
    ssr: false,
    loading: () => <CategoryListSkeleton />
});

export default function ListingPageLazyWrapper({ categories }) {
    return <LazyCategoryList categories={categories} />;
}
