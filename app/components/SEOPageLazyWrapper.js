"use client";
import dynamic from 'next/dynamic';

const SEOPagesLazyContent = dynamic(() => import('./SEOPagesLazyContent'), { ssr: false });

export default function SEOPageLazyWrapper({ pageData }) {
    return <SEOPagesLazyContent pageData={pageData} />;
}
