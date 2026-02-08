
import InterviewSEOContent from '../../components/interview-gyani/InterviewSEOContent';

export const metadata = {
    title: "Free AI Mock Interview Simulator 2026 | Practice with Real-Time Feedback",
    description: "Don't practice in the mirror. Use our Free AI Mock Interview Simulator to get instant feedback on your answers, body language (voice), and confidence. Try it now.",
    keywords: ["ai mock interview", "free mock interview tool", "interview simulator", "practice interview online", "ai interview coach free"],
    openGraph: {
        title: "Practice Interviews with AI (Free Analysis)",
        description: "Simulate real interviews and get instant actionable feedback. Stop guessing if your answers are good.",
    }
};

export default function MockInterviewAIPage() {
    const content = {
        title: "AI Mock Interview Simulator",
        hookTitle: "The Best Way to Fail an Interview is to Practice on a Real Recruiter.",
        hookSubtitle: "Don't burn your dream opportunity. Simulate the entire interview with AI first, make your mistakes here, and walk in flawless.",
        problemTitle: "Why Traditional Mock Interviews Fail",
        problemDescription: "Asking your friend to interview you is awkward and unhelpful. They don't know the industry standards, they can't grade your answer structure, and they're too nice to tell you that you're rambling.",
        solutionTitle: "The World's First 'Result-Oriented' AI Simulator",
        solutionDescription: "InterviewGyani doesn't just ask questions. It acts like a Senior Hiring Manager. It detects weak points in your story, asks follow-up questions to test your depth, and gives you a 0-100 score.",
        faq: [
            {
                q: "Is this mock interview really free?",
                a: "Yes. You can start your first full interview session completely for free. We want you to experience the power of AI feedback."
            },
            {
                q: "What types of roles can I practice for?",
                a: "Our AI is trained on 7,000+ job descriptions. Whether you're a Software Engineer, Product Manager, or Marketing Intern, the questions will be tailored to your specific role."
            },
            {
                q: "Does it give feedback on my answers?",
                a: "Absolutely. After every answer, you get instant analysis: Was it too long? Did you miss the metrics? Did you sound confident? You get specific tips to improve."
            }
        ]
    };

    return <InterviewSEOContent content={content} />;
}
