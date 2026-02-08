
import InterviewSEOContent from '../../components/ai-interview/InterviewSEOContent';

export const metadata = {
    title: "Software Engineer Mock Interview (System Design & Coding) – ExpertResume",
    description: "Ace your SDE/Dev interview. Practice technical behavioral questions, system design discussions, and coding explainers with an AI Engineering Manager.",
    keywords: ["software engineer mock interview", "sde interview practice", "system design interview ai", "coding interview behavioral questions", "java developer interview practice"],
    openGraph: {
        title: "Software Engineer AI Mock Interview",
        description: "Practice technical and behavioral questions for SDE roles. Get feedback on your system design explanations.",
    }
};

export default function SoftwareEngineerInterviewPage() {
    const content = {
        title: "Software Engineer AI Interview Prep",
        hookTitle: "You Know How to Code. But Can You Explain *Why* You Chose That Stack?",
        hookSubtitle: "Technical skills get you the interview. Communication skills get you the job. Practice explaining your architecture and trade-offs to an AI Engineering Manager.",
        problemTitle: "Where Engineers Fail Interviews",
        problemDescription: "It's rarely about syntax. Engineers often fail because they can't clearly articulate trade-offs (e.g., SQL vs NoSQL) or they struggle with behavioral questions like 'Tell me about a bug you fixed'.",
        solutionTitle: "Technical Interview Simulation",
        solutionDescription: "Select 'Software Engineer' in our setup, and the AI switches context. It expects technical depth, asks about scalability, and challenges your design choices—just like a real CTO would.",
        faq: [
            {
                q: "Does it ask coding questions?",
                a: "It focuses on the *verbal* side of engineering interviews: System Design discussions, behavioral scenarios, and explaining technical concepts. For LeetCode style problems, we recommend dedicated coding platforms, but for *explaining* your solution, use us."
            },
            {
                q: "Can I practice for specific stacks like Java or React?",
                a: "Yes. When setting up, you can specify your tech stack. The AI will tailor questions to your specific expertise."
            },
            {
                q: "Is this useful for Senior Engineers?",
                a: "Especially for Seniors. At senior levels, communication and leadership answers matter more than raw coding speed. Our AI tests your ability to lead and architect."
            }
        ]
    };

    return <InterviewSEOContent content={content} />;
}
