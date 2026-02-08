
import InterviewSEOContent from '../../components/ai-interview/InterviewSEOContent';

export const metadata = {
    title: "Mock Interview for Freshers (Campus Placements 2026) – ExpertResume",
    description: "Nervous about your first job interview? Practice common entry-level questions for top companies and startups. Build confidence with free AI mock interviews.",
    keywords: ["entry level interview questions", "new grad mock interview", "interview practice for students", "first job interview questions", "hr interview questions for new grads"],
    openGraph: {
        title: "Fresher/Campus Placement Mock Interview",
        description: "Ace your campus placements. Practice HR and Technical basics with an AI interviewer designed for students.",
    }
};

export default function FresherInterviewPage() {
    const content = {
        title: "Campus Placement Interview Prep",
        hookTitle: "First Interview Jitters? Don't let Anxiety Ruin Your Placement.",
        hookSubtitle: "You have the grades. You have the project. Now, master the one thing they don't teach in college: How to sell yourself in 30 minutes.",
        problemTitle: "The Fresher's Dilemma",
        problemDescription: "As a student, you don't have work experience to rely on. Interviewers judge you purely on your potential, communication skills, and confidence. One awkward silence can cost you the offer.",
        solutionTitle: "Your Personal Placement Trainer",
        solutionDescription: "AI Interview Pro is designed for campus placements. It asks standard questions like 'Tell me about your final year project' or 'Why do you want to join us?' and helps you refine your answers to sound professional, not academic.",
        faq: [
            {
                q: "I have no experience. What should I say?",
                a: "The AI helps you structure answers around your projects and internships. Even without a job, you have valuable experiences—we help you frame them."
            },
            {
                q: "Is this helpful for Fortune 500 companies?",
                a: "Yes! We have a database of common HR and Technical questions asked by major employers like Google, Amazon, Deloitte, and more. It's the perfect practice ground."
            },
            {
                q: "Can I practice different interview formats?",
                a: "Yes! Our AI supports behavioral, technical, and situational interview formats. It adapts to your target role and industry."
            }
        ]
    };

    return <InterviewSEOContent content={content} />;
}
