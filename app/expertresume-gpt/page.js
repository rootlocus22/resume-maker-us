import ExpertResumeGPTClient from './ExpertResumeGPTClient';

export const metadata = {
  title: "ExpertResume GPT - Your AI Career & Learning Partner | Interview Prep, Study Help & Professional Growth",
  description: "Ultimate AI assistant for students & professionals. Get help with interview prep, system design, math problems, coding practice, resume building, career guidance & more. All-in-one AI solution powered by advanced GPT technology.",
  keywords: [
    "AI career assistant",
    "interview preparation AI",
    "study help AI",
    "resume AI helper",
    "system design interview",
    "coding interview prep",
    "math problem solver AI",
    "career guidance AI",
    "professional development AI",
    "student learning assistant",
    "job interview coach",
    "technical interview prep",
    "AI tutor",
    "career growth AI",
    "ExpertResume GPT"
  ],
  authors: [{ name: "ExpertResume" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/expertresume-gpt",
  },
  openGraph: {
    title: "ExpertResume GPT - Your All-in-One AI Career & Learning Partner",
    description: "From interview prep to solving math problems - ExpertResume GPT is your ultimate AI companion for career growth and learning. Students, professionals, job seekers - we've got you covered!",
    url: "https://expertresume.us/expertresume-gpt",
    siteName: "ExpertResume",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "ExpertResume GPT - AI Career & Learning Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@expertresume",
    title: "ExpertResume GPT - Your All-in-One AI Career & Learning Partner",
    description: "Interview prep, study help, career guidance & more - all powered by advanced AI. Your ultimate companion for professional & academic success.",
    images: ["https://expertresume.us/ExpertResume.png"],
  },
};

export default function ExpertResumeGPTPage() {
  return <ExpertResumeGPTClient />;
}

