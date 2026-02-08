import TestimonialsClient from './TestimonialsClient';

export const metadata = {
  title: 'What Our Users Say - ExpertResume',
  description: 'Read authentic testimonials from professionals who landed their dream jobs using ExpertResume\'s AI-powered resume builder.',
  keywords: 'testimonials, reviews, success stories, resume builder, job search, career growth',
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/testimonials",
  },
};

export default function TestimonialsPage() {
  return <TestimonialsClient />;
} 