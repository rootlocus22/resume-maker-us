import axios from 'axios';

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const JSEARCH_HOST = 'jsearch.p.rapidapi.com';

/**
 * Searches for jobs using the JSearch API.
 * 
 * @param {Object} params
 * @param {string} params.query - The search query (e.g., "Python Developer in Bangalore")
 * @param {string} [params.date_posted] - 'all' | 'today' | '3days' | 'week' | 'month'
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.num_pages=1] - Number of pages to return
 * @returns {Promise<Array>} List of jobs
 */
export async function searchJobs({ query, date_posted = 'month', page = 1, num_pages = 1 }) {
    if (!RAPID_API_KEY) {
        throw new Error("RAPID_API_KEY is not set. Please add it to .env.local");
    }

    try {
        const response = await axios.get(`https://${JSEARCH_HOST}/search`, {
            params: {
                query,
                page,
                num_pages,
                date_posted
            },
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': JSEARCH_HOST
            }
        });

        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("JSearch API Error:", errorMessage);
        throw new Error(errorMessage);
    }
}
