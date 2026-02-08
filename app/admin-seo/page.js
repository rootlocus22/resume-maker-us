import SeoDashboard from '../components/admin/SeoDashboard';

export const metadata = {
    title: 'pSEO Command Center | ExpertResume Admin',
    description: 'Manage programmatic SEO content across all verticals.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminSeoPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <SeoDashboard />
        </div>
    );
}
