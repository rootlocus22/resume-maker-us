import { BASE_URL, BRAND_NAME } from "../lib/appConfig";
import { getCanonicalUrl } from "../lib/canonical";
import InterviewPrepKitContent from "./InterviewPrepKitContent";

export async function generateMetadata() {
  const canonical = await getCanonicalUrl("/interview-prep-kit");
  return {
    title: `Interview Prep Kit - Master Your Next Job Interview | ${BRAND_NAME}`,
    description:
      "Ace your next job interview with our comprehensive prep kit. Professional cheat sheets, common questions with expert answers, and interview strategy guides.",
    alternates: {
      canonical,
      languages: {
        'en-US': `${BASE_URL}/interview-prep-kit`,
        'en-IN': `https://www.expertresume.us/interview-prep-kit`,
        'x-default': `${BASE_URL}/interview-prep-kit`,
      }
    },
    openGraph: {
      title: "Interview Prep Kit | ExpertResume",
      description: "Master your job interview with expert cheatsheets and answers.",
      url: canonical,
      type: "website",
    },
  };
}

export default function InterviewPrepKitPage() {
  return <InterviewPrepKitContent />;
}

