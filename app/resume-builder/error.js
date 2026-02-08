'use client';

import ErrorFallback from '../components/ErrorFallback';

export default function ResumeBuilderError({ error, reset }) {
    return (
        <div className="p-4 md:p-8">
            <ErrorFallback
                error={error}
                reset={reset}
                title="Resume Builder Error"
                message="The resume builder encountered an issue. Don't worry, your progress is saved locally. Try refreshing."
            />
        </div>
    );
}
