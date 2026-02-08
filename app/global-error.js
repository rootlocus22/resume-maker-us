'use client';

import ErrorFallback from './components/ErrorFallback';

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <ErrorFallback
                    error={error}
                    reset={reset}
                    title="Critical Error"
                    message="A critical error occurred. Please refresh the page."
                    showHomeButton={false}
                />
            </body>
        </html>
    );
}
