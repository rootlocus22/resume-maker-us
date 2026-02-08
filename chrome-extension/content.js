// Strategies for different LinkedIn views (Collections, Direct, Search)
const strategies = [
    // Strategy 1: Unified Job View (Collections/Search)
    {
        title: '.job-details-jobs-unified-top-card__job-title, .jobs-details-top-card__job-title',
        company: '.job-details-jobs-unified-top-card__company-name, .jobs-details-top-card__company-info a',
        description: '#job-details, .jobs-description__content',
        location: '.job-details-jobs-unified-top-card__bullet, .jobs-details-top-card__bullet, .job-details-jobs-unified-top-card__workplace-type'
    },
    // Strategy 2: Standalone Page
    {
        title: '.top-card-layout__title',
        company: '.topcard__org-name-link',
        description: '.description__text',
        location: '.topcard__flavor--bullet, .topcard__flavor:nth-child(2)'
    }
];

function scrapeJobDetails() {
    let title, company, description, location;

    for (const selectors of strategies) {
        title = document.querySelector(selectors.title)?.innerText?.trim();
        company = document.querySelector(selectors.company)?.innerText?.trim();
        description = document.querySelector(selectors.description)?.innerText?.trim();
        location = document.querySelector(selectors.location)?.innerText?.trim();

        // Clean up location if it contains dividers (bullet points, etc)
        if (location) {
            location = location.replace(/·/g, '').trim();
        }

        if (title && company) break;
    }

    if (title && company) {
        chrome.runtime.sendMessage({
            type: 'JOB_DATA',
            payload: {
                title,
                company,
                location: location || "Location not specified",
                description,
                url: window.location.href,
                timestamp: new Date().toISOString()
            }
        });

        // Also save to storage for persistence
        chrome.storage.local.set({
            'current_job': {
                title,
                company,
                location: location || "Location not specified",
                description,
                url: window.location.href,
                timestamp: new Date().toISOString()
            }
        });
    }
}

// Initial run
scrapeJobDetails();

// Watch for URL changes
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(scrapeJobDetails, 2000); // Wait for DOM update
    }
}).observe(document, { subtree: true, childList: true });

// Periodic check
setInterval(scrapeJobDetails, 3000);
