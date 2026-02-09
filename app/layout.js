import { Poppins, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ClientLayout from "./ClientLayout";
import Script from "next/script";
import { LocationProvider } from "./context/LocationContext";
import { Suspense } from "react";
import ReferralCodeCapture from "./components/ReferralCodeCapture";
import ChunkLoadHandler from "./components/ChunkLoadHandler";
import { Analytics } from "@vercel/analytics/next";
import { BASE_URL, BRAND_NAME, GA_MEASUREMENT_ID, CLARITY_ID, GOOGLE_ADS_ID } from "./lib/appConfig";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// US-only SEO – no India keywords
export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "ExpertResume | AI Resume Builder for US Jobs – ATS-Optimized in Minutes",
  description: "AI-powered resume optimization for the US job market. Get past ATS, match job descriptions, and get more interviews. Trusted by professionals applying to top US companies.",
  keywords: [
    "resume builder",
    "ATS resume checker",
    "resume optimizer",
    "job application",
    "US job market",
    "resume for software engineer",
    "resume for data analyst",
    "cover letter builder",
    "interview prep",
    "resume score",
    "ATS score",
    "professional resume",
    "resume templates",
    "AI resume builder",
    "resume writer",
  ],
  authors: [{ name: BRAND_NAME }],
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  openGraph: {
    title: `AI Resume Builder for US Jobs | ${BRAND_NAME}`,
    description: "Get your resume past ATS. Optimize for each job description. Get more interviews.",
    url: BASE_URL,
    siteName: BRAND_NAME,
    type: "website",
    locale: "en_US",
    images: [{ url: `${BASE_URL}/ExpertResume.png`, width: 1200, height: 630, alt: `${BRAND_NAME} - AI Resume Builder` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `AI Resume Builder for US Jobs | ${BRAND_NAME}`,
    description: "ATS-optimized resumes in minutes. Built for the US job market.",
    images: [`${BASE_URL}/ExpertResume.png`],
  },
  other: {
    "application-name": BRAND_NAME,
    "msapplication-TileColor": "#0B1F3B",
    "theme-color": "#0B1F3B",
    "google": "notranslate",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

// US-only structured data
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I create an ATS-optimized resume for US jobs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ExpertResume helps you build an ATS-friendly resume in minutes. Upload your resume or start from scratch, match it to job descriptions, and download a PDF optimized for US applicant tracking systems.",
      },
    },
    {
      "@type": "Question",
      name: "Are ExpertResume templates ATS-friendly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All templates are designed to pass common ATS systems used by US employers. You can also check your ATS score before applying.",
      },
    },
    {
      "@type": "Question",
      name: "Can I tailor my resume to each job description?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ExpertResume’s job description match feature lets you optimize keywords and phrasing for each role you apply to.",
      },
    },
  ],
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vendax Systems LLC",
  alternateName: BRAND_NAME,
  url: "https://vendaxsystemlabs.com",
  logo: { "@type": "ImageObject", url: `${BASE_URL}/ExpertResume.png`, width: "280", height: "96" },
  description: "AI-powered resume optimization for the US job market. ExpertResume is operated by Vendax Systems LLC.",
  areaServed: { "@type": "Country", name: "United States" },
  slogan: "Get past ATS. Get more interviews.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "28 Geary St STE 650 Suite #500",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94108",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@expertresume.us",
    contactType: "customer service",
    areaServed: "US",
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND_NAME,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    description: "Free tier; premium plans in USD",
    seller: { "@type": "Organization", name: BRAND_NAME },
  },
  url: BASE_URL,
  inLanguage: "en",
  audience: { "@type": "Audience", audienceType: "Job Seekers", geographicArea: { "@type": "Country", name: "United States" } },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND_NAME,
  url: BASE_URL,
  description: "AI resume builder and ATS optimizer for the US job market.",
  publisher: { "@type": "Organization", name: BRAND_NAME, logo: { "@type": "ImageObject", url: `${BASE_URL}/ExpertResume.png` } },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Resume Builder", item: `${BASE_URL}/resume-builder` },
    { "@type": "ListItem", position: 3, name: "Templates", item: `${BASE_URL}/templates` },
    { "@type": "ListItem", position: 4, name: "ATS Checker", item: `${BASE_URL}/ats-score-checker` },
  ],
};

export default function RootLayout({ children }) {
  const isProduction = process.env.NODE_ENV === "production";
  const hasGA = isProduction && GA_MEASUREMENT_ID;
  const hasClarity = isProduction && CLARITY_ID;
  const hasAds = isProduction && GOOGLE_ADS_ID;

  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#0B1F3B" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="preload" as="image" href="/ExpertResume.png" fetchPriority="high" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/ExpertResume.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className={`${poppins.variable} ${manrope.variable} antialiased bg-[#F5F7FA] text-[#0B1F3B]`}>
        {(hasGA || hasAds) && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${hasGA ? GA_MEASUREMENT_ID : GOOGLE_ADS_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());${hasGA ? ` gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });` : ""}${hasAds ? ` gtag('config', '${GOOGLE_ADS_ID}');` : ""}`}
            </Script>
          </>
        )}
        {hasClarity && (
          <Script id="microsoft-clarity" strategy="lazyOnload">
            {`(function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments);}; t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i; y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y); })(window, document, "clarity", "script", "${CLARITY_ID}");`}
          </Script>
        )}
        {hasGA && (
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${GA_MEASUREMENT_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
          </noscript>
        )}
        <LocationProvider>
          <ChunkLoadHandler />
          <Suspense fallback={null}>
            <ReferralCodeCapture />
          </Suspense>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </LocationProvider>
        <Analytics />
        <Script id="referrer-tracker" strategy="lazyOnload">
          {`
            (function() {
              try {
                const STORAGE_KEY = 'expertresume_referrer';
                const SESSION_KEY = 'expertresume_session_start';
                const parseReferrer = function(referrer, urlParams) {
                  const data = { source: 'direct', medium: 'none', campaign: null, term: null, content: null, referrerUrl: referrer || 'direct', landingPage: window.location.href, timestamp: new Date().toISOString() };
                  if (urlParams.has('utm_source')) { data.source = urlParams.get('utm_source'); data.medium = urlParams.get('utm_medium') || 'unknown'; data.campaign = urlParams.get('utm_campaign'); data.term = urlParams.get('utm_term'); data.content = urlParams.get('utm_content'); return data; }
                  if (urlParams.has('gclid')) { data.source = 'google'; data.medium = 'cpc'; data.gclid = urlParams.get('gclid'); return data; }
                  if (urlParams.has('fbclid')) { data.source = 'facebook'; data.medium = 'cpc'; data.fbclid = urlParams.get('fbclid'); return data; }
                  if (referrer) {
                    try {
                      const refUrl = new URL(referrer);
                      const hostname = refUrl.hostname.toLowerCase();
                      if (hostname.includes('expertresume')) { data.source = 'expertresume'; data.medium = 'internal'; return data; }
                      if (hostname.includes('google.')) { data.source = 'google'; data.medium = 'organic'; if (refUrl.searchParams.get('q')) data.term = refUrl.searchParams.get('q'); return data; }
                      if (hostname.includes('facebook.') || hostname.includes('fb.')) { data.source = 'facebook'; data.medium = 'social'; return data; }
                      if (hostname.includes('linkedin.')) { data.source = 'linkedin'; data.medium = 'social'; return data; }
                      data.source = hostname; data.medium = 'referral'; return data;
                    } catch (e) {}
                  }
                  return data;
                };
                const lastSession = localStorage.getItem(SESSION_KEY);
                const now = Date.now();
                const isNewSession = !lastSession || (now - parseInt(lastSession)) > 30 * 60 * 1000;
                localStorage.setItem(SESSION_KEY, now.toString());
                const existingData = localStorage.getItem(STORAGE_KEY);
                const urlParams = new URLSearchParams(window.location.search);
                const currentReferrer = parseReferrer(document.referrer, urlParams);
                let shouldUpdate = !existingData || (isNewSession && (() => { try { const s = JSON.parse(existingData); return s.source !== currentReferrer.source || (currentReferrer.campaign && currentReferrer.campaign !== s.campaign) || (s.source === 'direct' && currentReferrer.source !== 'direct'); } catch(e) { return true; } })());
                if (shouldUpdate) localStorage.setItem(STORAGE_KEY, JSON.stringify(currentReferrer));
              } catch (e) {}
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
