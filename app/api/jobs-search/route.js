import { NextResponse } from 'next/server';
import { searchJobs } from '../../lib/jsearch';
import { adminDb } from '../../lib/firebase-admin';

export const maxDuration = 240;
// In-memory cache for ultra-fast session hits (1 hour)
const QUERY_CACHE = new Map();
const MEMORY_CACHE_DURATION = 60 * 60 * 1000; // 1 Hour

export async function POST(request) {
    try {
        const { query, uid, page = 1, num_pages = 1 } = await request.json(); // Accepted uid for history
        const normalizedQuery = query.toLowerCase().trim();
        const pageNumber = Math.max(1, Number(page) || 1);
        const numPages = Math.max(1, Number(num_pages) || 1);
        const cacheKey = `${normalizedQuery}::p${pageNumber}::n${numPages}`;

        // 0. Check Memory Cache (Fastest)
        if (QUERY_CACHE.has(cacheKey)) {
            const { timestamp, data } = QUERY_CACHE.get(cacheKey);
            if (Date.now() - timestamp < MEMORY_CACHE_DURATION) {
                console.log(`[MEMORY HIT] ${cacheKey}`);
                return NextResponse.json({ success: true, jobs: data, cached: true, source: 'memory' });
            }
        }

        // 1. Check Firestore Cache (7 Days Persistence)
        // Composite Key: sanitize string to be a valid doc ID (alphanumeric + dashes)
        const docId = cacheKey.replace(/[^a-z0-9]/g, '-');
        let cachedJobs = null;

        if (adminDb) {
            try {
                const docRef = adminDb.collection('job_search_cache').doc(docId);
                const docSnap = await docRef.get();

                if (docSnap.exists) {
                    const data = docSnap.data();
                    const now = Date.now();
                    // 7 Days in MS = 7 * 24 * 60 * 60 * 1000 = 604800000
                    if (now - data.timestamp < 604800000) {
                        console.log(`[FIRESTORE HIT] ${cacheKey}`);
                        cachedJobs = data.jobs;
                        // Update Memory Cache
                        QUERY_CACHE.set(cacheKey, { timestamp: now, data: cachedJobs });
                    }
                }
            } catch (fsError) {
                console.error("Firestore Cache Read Error:", fsError);
                // Continue to API if cache check fails
            }
        }

        if (cachedJobs) {
            // Log History Async if UID present
            if (uid && adminDb) {
                adminDb.collection('users').doc(uid).collection('job_search_history').add({
                    query: normalizedQuery,
                    timestamp: Date.now(),
                    count: cachedJobs.length || 0
                }).catch(e => console.error("History Log Error", e));

                adminDb.collection('users').doc(uid).set({
                    jobSearchAlerts: {
                        lastQuery: normalizedQuery,
                        lastQueryUpdatedAt: Date.now()
                    }
                }, { merge: true }).catch(e => console.error("Last Query Update Error", e));
            }

            return NextResponse.json({ success: true, jobs: cachedJobs, cached: true, source: 'firestore' });
        }

        // 2. Fetch from API (If Cache Miss)
        console.log(`[API CALL] Fetching ${cacheKey}`);
        const result = await searchJobs({ query, num_pages: numPages, page: pageNumber });
        const jobs = result.data || [];

        // 3. Save to Cache (Firestore + Memory)
        const timestamp = Date.now();

        // Memory (Sync)
        QUERY_CACHE.set(cacheKey, { timestamp, data: jobs });

        // Queue Background Writes
        const writePromises = [];

        // Firestore Cache Write
        if (adminDb && jobs.length > 0) {
            writePromises.push(
                adminDb.collection('job_search_cache').doc(docId).set({
                    query: normalizedQuery,
                    page: pageNumber,
                    num_pages: numPages,
                    jobs: jobs,
                    timestamp: timestamp,
                    expiresAt: timestamp + 604800000 // 7 Days
                }).catch(e => console.error("Firestore Cache Write Error:", e))
            );
        }

        // Log User History
        if (uid && adminDb) {
            writePromises.push(
                adminDb.collection('users').doc(uid).collection('job_search_history').add({
                    query: normalizedQuery,
                    timestamp: timestamp,
                    count: jobs.length
                }).catch(e => console.error("History Log Error", e))
            );
            writePromises.push(
                adminDb.collection('users').doc(uid).set({
                    jobSearchAlerts: {
                        lastQuery: normalizedQuery,
                        lastQueryUpdatedAt: timestamp
                    }
                }, { merge: true }).catch(e => console.error("Last Query Update Error", e))
            );
        }

        // Await all background writes to prevent Vercel from freezing/killing them
        // This adds slight latency but ensures data integrity and prevents DEADLINE_EXCEEDED logs
        if (writePromises.length > 0) {
            await Promise.allSettled(writePromises);
        }

        return NextResponse.json({
            success: true,
            jobs: jobs,
            cached: false,
            source: 'api',
            page: pageNumber,
            num_pages: numPages
        });

    } catch (error) {
        console.error("Job Search API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
}
