import { templates } from "./lib/templates";
import { resumeExamples, resumeCategories } from "./lib/resumeExamples";
import { getAllCoverLetterSlugs } from "./lib/coverLetterExamples";
import { getAllArticleSlugs } from "./lib/blogArticles";
import { COUNTRIES, INTENTS } from "./lib/ai-interview/data";
import { getExpandedRoles } from "./lib/ai-interview/roleExpander";
import { adminDb } from "./lib/firebase-admin";

export default async function sitemap() {
  const siteUrl = "https://expertresume.us/";

  const staticRoutes = [
    // Core Pages
    { path: "", priority: 1.0, changefreq: "daily" },
    { path: "resume-builder", priority: 1.0, changefreq: "daily" },
    { path: "free-ai-resume-builder", priority: 1.0, changefreq: "daily" },
    { path: "ats-score-checker", priority: 1.0, changefreq: "daily" },
    { path: "resume-examples", priority: 1.0, changefreq: "daily" },
    { path: "ai-interview", priority: 1.0, changefreq: "daily" },

    // Resume Tools
    { path: "job-description-resume-builder", priority: 0.9, changefreq: "daily" },
    { path: "job-specific-resume-builder", priority: 0.9, changefreq: "daily" },
    { path: "upload-resume", priority: 0.9, changefreq: "daily" },
    { path: "cover-letter-builder", priority: 0.9, changefreq: "weekly" },
    { path: "one-pager-resume", priority: 0.9, changefreq: "weekly" },
    { path: "one-page-resume-builder", priority: 0.9, changefreq: "weekly" },

    // Career Tools
    { path: "salary-analyzer", priority: 0.8, changefreq: "weekly" },
    { path: "career-coach", priority: 0.8, changefreq: "weekly" },
    { path: "interview-trainer", priority: 0.8, changefreq: "weekly" },
    { path: "interview-prep-kit", priority: 0.8, changefreq: "weekly" },

    // AI Interview Sub-pages
    { path: "ai-interview/ai-interview-practice", priority: 0.8, changefreq: "weekly" },
    { path: "ai-interview/mock-interview-ai", priority: 0.8, changefreq: "weekly" },
    { path: "ai-interview/interview-feedback-ai", priority: 0.8, changefreq: "weekly" },
    { path: "ai-interview/fresher-interview-practice", priority: 0.8, changefreq: "weekly" },
    { path: "ai-interview/software-engineer-interview-ai", priority: 0.8, changefreq: "weekly" },
    { path: "ai-interview/directory", priority: 0.7, changefreq: "weekly" },

    // SEO Landing Pages
    { path: "resume-format", priority: 0.9, changefreq: "weekly" },
    { path: "resume-skills", priority: 0.9, changefreq: "weekly" },
    { path: "resume-objective", priority: 0.9, changefreq: "weekly" },
    { path: "resume-summary", priority: 0.9, changefreq: "weekly" },

    // Business Pages
    { path: "pricing", priority: 0.8, changefreq: "monthly" },
    { path: "features", priority: 0.7, changefreq: "monthly" },
    { path: "resume-templates", priority: 0.8, changefreq: "monthly" },
    { path: "enterprise", priority: 0.7, changefreq: "monthly" },
    { path: "testimonials", priority: 0.6, changefreq: "monthly" },

    // Informational
    { path: "contact-us", priority: 0.5, changefreq: "yearly" },
    { path: "about-us", priority: 0.5, changefreq: "yearly" },
    { path: "faqs", priority: 0.5, changefreq: "monthly" },
    { path: "refer-and-earn", priority: 0.5, changefreq: "monthly" },

    // Legal & Privacy
    { path: "privacy", priority: 0.3, changefreq: "yearly" },
    { path: "terms", priority: 0.3, changefreq: "yearly" },
    { path: "refund", priority: 0.3, changefreq: "yearly" },
    { path: "ccpa-opt-out", priority: 0.3, changefreq: "yearly" },

    // Resume Guide Hub
    { path: "resume-guide", priority: 0.9, changefreq: "daily" },
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

  // Resume Example Category Pages
  const categoryUrls = Object.keys(resumeCategories).map((slug) => ({
    url: `${siteUrl}resume-examples/${slug}`,
    lastModified: new Date().toISOString(),
    priority: 0.9,
    changefreq: "weekly",
  }));

  // Individual Resume Example Pages
  const exampleUrls = resumeExamples.map((example) => ({
    url: `${siteUrl}resume-examples/${example.category}/${example.slug}`,
    lastModified: new Date().toISOString(),
    priority: 0.9,
    changefreq: "weekly",
  }));

  // Cover Letter Examples Hub Page
  const coverLetterHubUrl = {
    url: `${siteUrl}cover-letter-examples`,
    lastModified: new Date().toISOString(),
    priority: 0.9,
    changefreq: "weekly",
  };

  // Individual Cover Letter Example Pages
  const coverLetterSlugs = getAllCoverLetterSlugs();
  const coverLetterUrls = coverLetterSlugs.map(({ slug }) => ({
    url: `${siteUrl}cover-letter-examples/${slug}`,
    lastModified: new Date().toISOString(),
    priority: 0.8,
    changefreq: "weekly",
  }));

  // Blog Hub Page
  const blogHubUrl = {
    url: `${siteUrl}blog`,
    lastModified: new Date().toISOString(),
    priority: 0.9,
    changefreq: "weekly",
  };

  // Individual Blog Article Pages
  const blogSlugs = getAllArticleSlugs();
  const blogArticleUrls = blogSlugs.map(({ slug }) => ({
    url: `${siteUrl}blog/${slug}`,
    lastModified: new Date().toISOString(),
    priority: 0.8,
    changefreq: "weekly",
  }));

  // ======================================================
  // AI Interview pSEO Pages (country/role/intent combos)
  // ======================================================
  const aiInterviewUrls = [];
  const countries = Object.keys(COUNTRIES);
  const intents = Object.keys(INTENTS);
  const expandedRoles = getExpandedRoles();

  for (const country of countries) {
    for (const role of expandedRoles) {
      for (const intent of intents) {
        aiInterviewUrls.push({
          url: `${siteUrl}ai-interview/${country}/${role.slug}/${intent}`,
          lastModified: new Date().toISOString(),
          priority: 0.7,
          changefreq: "weekly",
        });
      }
    }
  }

  // ======================================================
  // Global Roles Resume Guide pSEO Pages (from Firestore)
  // ======================================================
  let resumeGuideUrls = [];
  try {
    if (adminDb) {
      const snapshot = await adminDb
        .collection("global_roles")
        .where("country", "==", "us")
        .select("slug")
        .get();

      resumeGuideUrls = snapshot.docs.map((doc) => ({
        url: `${siteUrl}resume-guide/${doc.data().slug}`,
        lastModified: new Date().toISOString(),
        priority: 0.8,
        changefreq: "weekly",
      }));
    }
  } catch (e) {
    console.error("Sitemap: Error fetching global_roles:", e);
  }

  return [
    ...staticUrls,
    ...templateUrls,
    ...categoryUrls,
    ...exampleUrls,
    coverLetterHubUrl,
    ...coverLetterUrls,
    blogHubUrl,
    ...blogArticleUrls,
    ...aiInterviewUrls,
    ...resumeGuideUrls,
  ];
}
