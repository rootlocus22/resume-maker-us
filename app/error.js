'use client';

import ErrorFallback from './components/ErrorFallback';

export default function Error({ error, reset }) {
    return (
        <ErrorFallback
            error={error}
            reset={reset}
            title="Something went wrong"
            message="We encountered an unexpected error. Please try again or return home."
        />
    );
}
