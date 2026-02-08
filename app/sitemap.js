import { templates } from "./lib/templates";

export default async function sitemap() {
  const siteUrl = "https://expertresume.us/";

  const staticRoutes = [
    { path: "", priority: 1.0, changefreq: "daily" },
    { path: "resume-builder", priority: 1.0, changefreq: "daily" },
    { path: "free-ai-resume-builder", priority: 1.0, changefreq: "daily" },
    { path: "job-description-resume-builder", priority: 1.0, changefreq: "daily" },
    { path: "job-specific-resume-builder", priority: 1.0, changefreq: "daily" },
    { path: "ats-score-checker", priority: 1.0, changefreq: "daily" },
    { path: "upload-resume", priority: 0.9, changefreq: "daily" },
    { path: "cover-letter-builder", priority: 0.9, changefreq: "weekly" },
    { path: "one-pager-resume", priority: 0.9, changefreq: "weekly" },
    { path: "one-page-resume-builder", priority: 0.9, changefreq: "weekly" },
    { path: "salary-analyzer", priority: 0.8, changefreq: "weekly" },
    { path: "interview-gyani", priority: 1.0, changefreq: "daily" },
    { path: "pricing", priority: 0.8, changefreq: "monthly" },
    { path: "features", priority: 0.7, changefreq: "monthly" },
    { path: "resume-templates", priority: 0.7, changefreq: "monthly" },
    { path: "enterprise", priority: 0.7, changefreq: "monthly" },
    { path: "testimonials", priority: 0.6, changefreq: "monthly" },
    { path: "contact-us", priority: 0.5, changefreq: "yearly" },
    { path: "about-us", priority: 0.5, changefreq: "yearly" },
    { path: "faqs", priority: 0.4, changefreq: "monthly" },
    { path: "privacy", priority: 0.3, changefreq: "yearly" },
    { path: "terms", priority: 0.3, changefreq: "yearly" },
    { path: "refund", priority: 0.3, changefreq: "yearly" },
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date().toISOString(),
    priority: route.priority,
    changefreq: route.changefreq,
  }));

  const templateUrls = Object.keys(templates).map((slug) => ({
    url: `${siteUrl}resume-templates/${slug}`,
    lastModified: new Date().toISOString(),
    priority: 0.8,
    changefreq: "monthly",
  }));

  return [...staticUrls, ...templateUrls];
}
