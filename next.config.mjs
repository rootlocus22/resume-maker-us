/** @type {import('next').NextConfig} */
const nextConfig = {
    // Keep Puppeteer/Chromium external so they work in serverless (Vercel)
    serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium"],

    // Image optimization for better LCP and performance
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'encrypted-tbn0.gstatic.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'https',
                hostname: '*.google.com',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
            },
            {
                protocol: 'https',
                hostname: 'example.com',
            },
        ],

    },

    // Compression for faster page loads
    compress: true,

    // Production optimizations
    productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles



    // Headers for caching and security
    async headers() {
        return [
            {
                source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/fonts/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex, nofollow',
                    },
                ],
            },
            {
                source: '/_next/:path*',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex, nofollow',
                    },
                ],
            },
        ];
    },

    // Redirects – India-only routes → home (US product, no US SEO)
    async redirects() {
        const indiaRoutes = [
            '/cv-maker-india',
            '/ai-resume-builder-india',
            '/resume-builder-jobs-india',
            '/ats-resume-india',
            '/ats-friendly-resume-builder',
            '/resume-format-for-freshers',
            '/resume-builder-government-jobs-india',
            '/banking-resume-builder-india',
            '/best-ai-resume-builder-india',
            '/best-resume-builder-for-freshers-india',
            '/best-resume-builder-india',
            '/job-specific-resume-builder-india',
            '/professional-cover-letter-builder-india',
            '/how-to-make-ats-friendly-resume-india',
            '/how-to-make-resume-for-freshers-india',
            '/internship-resume-builder-india',
            '/mba-resume-builder-india',
            '/modern-resume-builder-india',
            '/resume-upload-enhancement-india',
            '/resume-format-freshers-india',
            '/free-ats-resume-checker-india',
            '/jobs-in-india',
            '/one-page-resume-india',
            '/chatgpt-resume-prompts-india',
        ];
        const indiaRedirects = indiaRoutes.map((source) => ({
            source,
            destination: '/',
            permanent: true,
        }));
        // Missing blog slugs (old links / typos) → blog hub so they don’t 404
        const missingBlogRedirects = [
            '/blog/resume-government-jobs-guide',
            '/blog/resume-remote-work-guide',
            '/blog/resume-freelance-work-guide',
            '/blog/resume-finance-career-guide',
            '/blog/resume-healthcare-career-guide',
            '/blog/resume-education-career-guide',
            '/blog/resume-cover-letter-guide',
            '/blog/resume-writing-tips-for-career-changers',
            '/blog/resume-interests-section-guide',
        ].map((source) => ({ source, destination: '/blog', permanent: true }));

        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
            {
                source: '/job-specific-resume-builder',
                destination: '/resume-builder',
                permanent: false,
            },
            ...missingBlogRedirects,
            ...indiaRedirects,
        ];
    },

    // Experimental features for better performance
    experimental: {
        optimizePackageImports: ['react-icons', 'lucide-react', 'framer-motion'],
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },

    // Optimize CSS delivery
    webpack: (config, { dev, isServer }) => {
        if (!dev && !isServer) {
            // Optimize CSS extraction
            config.optimization.splitChunks = {
                ...config.optimization.splitChunks,
                cacheGroups: {
                    ...config.optimization.splitChunks?.cacheGroups,
                    styles: {
                        name: 'styles',
                        test: /\.(css|scss)$/,
                        chunks: 'all',
                        enforce: true,
                        priority: 10,
                    },
                },
            };
        }
        return config;
    },
};

export default nextConfig;
