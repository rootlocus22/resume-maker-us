// app/lib/downloadUtils.js
// Robust PDF download utility with retry logic, error handling, and alternative methods

/**
 * Downloads a PDF blob with retry logic and error handling
 * @param {Blob} blob - The PDF blob to download
 * @param {string} filename - The filename for the download
 * @param {Object} options - Download options
 * @returns {Promise<boolean>} - Success status
 */
export async function downloadPDFBlob(blob, filename, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onProgress = null,
    onError = null,
    timeout = 30000,
  } = options;

  // Validate inputs
  if (!blob || !(blob instanceof Blob)) {
    const error = new Error('Invalid blob provided for download');
    if (onError) onError(error);
    throw error;
  }

  if (!filename || typeof filename !== 'string') {
    filename = `resume_${Date.now()}.pdf`;
  }

  // Clean filename (remove invalid characters)
  const cleanFilename = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (onProgress) {
        onProgress({ stage: 'preparing', attempt, maxRetries });
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = cleanFilename;
      link.style.display = 'none';

      // Add to DOM
      document.body.appendChild(link);

      if (onProgress) {
        onProgress({ stage: 'triggering', attempt, maxRetries });
      }

      // Trigger download with timeout
      const downloadPromise = new Promise((resolve, reject) => {
        // Set up timeout
        const timeoutId = setTimeout(() => {
          reject(new Error('Download timeout - please try again'));
        }, timeout);

        // Try to trigger download
        try {
          link.click();

          // Wait a bit to see if download starts
          setTimeout(() => {
            clearTimeout(timeoutId);
            resolve(true);
          }, 500);
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      await downloadPromise;

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      if (onProgress) {
        onProgress({ stage: 'success', attempt, maxRetries });
      }

      return true;
    } catch (error) {
      lastError = error;
      console.error(`Download attempt ${attempt} failed:`, error);

      if (onError && attempt === maxRetries) {
        onError(error, attempt);
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  throw lastError || new Error('Download failed after all retries');
}

/**
 * Downloads PDF from URL with retry logic
 * @param {string} url - The PDF URL
 * @param {string} filename - The filename for the download
 * @param {Object} options - Download options
 * @returns {Promise<boolean>} - Success status
 */
export async function downloadPDFFromUrl(url, filename, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onProgress = null,
    onError = null,
    timeout = 30000,
  } = options;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (onProgress) {
        onProgress({ stage: 'fetching', attempt, maxRetries });
      }

      // Fetch PDF with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (onProgress) {
        onProgress({ stage: 'converting', attempt, maxRetries });
      }

      const blob = await response.blob();

      if (onProgress) {
        onProgress({ stage: 'downloading', attempt, maxRetries });
      }

      // Use blob download function
      await downloadPDFBlob(blob, filename, {
        maxRetries: 1, // Already retrying at this level
        onProgress,
        onError,
        timeout,
      });

      return true;
    } catch (error) {
      lastError = error;
      console.error(`Download from URL attempt ${attempt} failed:`, error);

      if (onError && attempt === maxRetries) {
        onError(error, attempt);
      }

      // Wait before retry
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Download from URL failed after all retries');
}

/**
 * Generates a download link that can be shared or emailed
 * @param {Blob} blob - The PDF blob
 * @param {string} filename - The filename
 * @returns {Promise<string>} - Data URL (for small files) or object URL
 */
export async function generateDownloadLink(blob, filename) {
  // For small files (< 5MB), use data URL
  if (blob.size < 5 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // For larger files, use object URL (temporary)
  return window.URL.createObjectURL(blob);
}

/**
 * Opens PDF in new tab as fallback download method
 * @param {Blob} blob - The PDF blob
 * @param {string} filename - The filename
 */
export function openPDFInNewTab(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');

  if (!newWindow) {
    // Popup blocked - show instructions
    const message = `Popup blocked. Please allow popups for this site, or right-click the link and select "Save As".`;
    alert(message);
    return false;
  }

  // Clean up URL after window closes (best effort)
  setTimeout(() => {
    try {
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // Ignore errors
    }
  }, 10000);

  return true;
}

/**
 * Checks if browser supports download attribute
 * @returns {boolean}
 */
export function supportsDownloadAttribute() {
  const link = document.createElement('a');
  return typeof link.download !== 'undefined';
}

/**
 * Checks if user is on mobile device
 * @returns {boolean}
 */
export function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768 && window.innerHeight <= 1024);
}

/**
 * Gets user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly message
 */
export function getDownloadErrorMessage(error) {
  const errorMessage = error?.message?.toLowerCase() || '';

  if (errorMessage.includes('timeout')) {
    return 'Download timed out. The file might be large. Please try again.';
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (errorMessage.includes('abort')) {
    return 'Download was cancelled. Please try again.';
  }

  if (errorMessage.includes('permission') || errorMessage.includes('blocked')) {
    return 'Download blocked by browser. Please allow downloads for this site.';
  }

  if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
    return 'Not enough storage space. Please free up space and try again.';
  }

  return 'Download failed. Please try again or contact support if the problem persists.';
}

/**
 * Log download error to analytics
 * @param {Object} errorData - Error data to log
 */
async function logDownloadError(errorData) {
  try {
    const response = await fetch('/api/download-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...errorData,
        timestamp: new Date().toISOString(),
      }),
    });
    return await response.json();
  } catch (err) {
    console.error('Failed to log download error:', err);
    return { success: false };
  }
}

/**
 * Comprehensive download handler with all fallbacks
 * @param {Blob|string} source - PDF blob or URL
 * @param {string} filename - Filename for download
 * @param {Object} options - Download options
 * @returns {Promise<{success: boolean, method: string, error?: Error}>}
 */
export async function downloadPDF(source, filename, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onProgress = null,
    onError = null,
    timeout = 30000,
    showToast = null, // toast function from react-hot-toast
  } = options;

  const isMobile = isMobileDevice();
  const supportsDownload = supportsDownloadAttribute();

  try {
    // Convert URL to blob if needed
    let blob;
    if (typeof source === 'string') {
      if (onProgress) {
        onProgress({ stage: 'fetching', attempt: 1, maxRetries: 1 });
      }

      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      blob = await response.blob();
    } else {
      blob = source;
    }

    // Validate blob
    if (!blob || blob.size === 0) {
      throw new Error('Invalid or empty PDF file');
    }

    if (onProgress) {
      onProgress({ stage: 'preparing', attempt: 1, maxRetries: 1 });
    }

    // Try primary download method
    try {
      await downloadPDFBlob(blob, filename, {
        maxRetries,
        retryDelay,
        onProgress,
        onError,
        timeout,
      });

      if (showToast) {
        showToast.success('PDF downloaded successfully!');
      }

      return { success: true, method: 'direct' };
    } catch (primaryError) {
      console.warn('Primary download method failed, trying alternatives:', primaryError);

      // Fallback 1: Try opening in new tab (especially for mobile)
      if (isMobile || !supportsDownload) {
        try {
          const opened = openPDFInNewTab(blob, filename);
          if (opened) {
            if (showToast) {
              showToast.info('PDF opened in new tab. Use your browser\'s download option to save it.');
            }
            return { success: true, method: 'new-tab' };
          }
        } catch (fallbackError) {
          console.warn('New tab fallback failed:', fallbackError);
        }
      }

      // Fallback 2: Generate shareable link
      try {
        const link = await generateDownloadLink(blob, filename);
        if (showToast) {
          showToast(
            (t) => (
              <div className="flex flex-col gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-800">Download Alternative</p>
                <p className="text-sm text-blue-700">
                  Right-click the link below and select "Save As" to download:
                </p>
                <a
                  href={link}
                  download={filename}
                  className="text-blue-600 underline break-all"
                  onClick={() => showToast.dismiss(t.id)}
                >
                  {filename}
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                    showToast.success('Link copied to clipboard!');
                    showToast.dismiss(t.id);
                  }}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Copy Link
                </button>
              </div>
            ),
            { duration: 10000 }
          );
        }
        return { success: true, method: 'link' };
      } catch (linkError) {
        console.warn('Link generation failed:', linkError);
      }

      // All methods failed - log error
      await logDownloadError({
        type: 'download_failed',
        error: primaryError?.message || 'Unknown error',
        filename,
        method: 'all_failed',
        userAgent: navigator.userAgent,
        blobSize: blob?.size || 0,
      });

      const errorMessage = getDownloadErrorMessage(primaryError);
      if (showToast) {
        showToast.error(errorMessage);
      }
      if (onError) {
        onError(primaryError, maxRetries);
      }

      return { success: false, method: 'none', error: primaryError };
    }
  } catch (error) {
    console.error('Download failed:', error);
    
    // Log error
    await logDownloadError({
      type: 'download_error',
      error: error?.message || 'Unknown error',
      filename,
      method: 'none',
      userAgent: navigator.userAgent,
    });

    const errorMessage = getDownloadErrorMessage(error);
    if (showToast) {
      showToast.error(errorMessage);
    }
    if (onError) {
      onError(error, 0);
    }

    return { success: false, method: 'none', error };
  }
}

/**
 * Send PDF via email as alternative download method
 * @param {Blob} blob - PDF blob
 * @param {string} email - Recipient email
 * @param {string} filename - Filename
 * @param {Object} options - Options
 * @returns {Promise<{success: boolean, error?: Error}>}
 */
export async function emailPDF(blob, email, filename, options = {}) {
  const { userId = null, resumeName = null, showToast = null } = options;

  try {
    // Convert blob to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const response = await fetch('/api/send-pdf-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfBlob: base64,
        email,
        filename,
        userId,
        resumeName: resumeName || filename,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    if (showToast) {
      showToast.success(`PDF sent to ${email}!`);
    }

    return { success: true };
  } catch (error) {
    console.error('Email PDF failed:', error);
    if (showToast) {
      showToast.error(`Failed to send email: ${error.message}`);
    }
    return { success: false, error };
  }
}
