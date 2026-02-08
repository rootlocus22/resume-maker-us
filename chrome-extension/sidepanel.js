// Listen for updates from content script
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.current_job) {
        const jobData = changes.current_job.newValue;
        const iframe = document.getElementById('app-frame');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'EXTENSION_JOB_DATA',
                payload: jobData
            }, 'https://expertresume.us');
        }
    }
});

// Also check initial state
chrome.storage.local.get(['current_job'], (result) => {
    if (result.current_job) {
        const iframe = document.getElementById('app-frame');
        // Wait for iframe to load
        iframe.onload = () => {
            iframe.contentWindow.postMessage({
                type: 'EXTENSION_JOB_DATA',
                payload: result.current_job
            }, 'https://expertresume.us');
        };
    }
});
