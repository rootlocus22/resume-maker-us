'use client';
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCheckCircle, FiMail, FiLoader, FiXCircle } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { event } from "../lib/gtag"; // Assuming you have a gtag setup for analytics

// Export dynamic to force dynamic rendering
export const dynamic = "force-dynamic";

// Main component wrapped in Suspense
export default function UnsubscribePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnsubscribeContent />
    </Suspense>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex flex-col items-center" aria-live="polite">
          <FiLoader className="animate-spin text-blue-600 text-4xl mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
          <p className="text-gray-600 mt-2">Please wait while we load the page.</p>
        </div>
      </div>
    </div>
  );
}

// Main content component
function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const [status, setStatus] = useState("loading");
  const [isResubscribing, setIsResubscribing] = useState(false);
  const [resubscribeSuccess, setResubscribeSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      setStatus("error");
      toast.error("No email provided in the URL.");
      return;
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`, {
          method: "GET",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to unsubscribe");
        }

        const data = await response.json();
        setStatus("success");
        toast.success(data.message);

        // Log unsubscribe event for analytics
        event({
          action: "unsubscribe",
          category: "Email",
          label: email,
        });
      } catch (error) {
        setStatus("error");
        if (error.message.includes("Invalid email")) {
          toast.error("The email address provided is invalid.");
        } else if (error.message.includes("Network")) {
          toast.error("Network error. Please check your connection and try again.");
        } else {
          toast.error(error.message);
        }
      }
    };

    unsubscribe();
  }, [email]);

  const handleResubscribe = async () => {
    if (!email) return;

    setIsResubscribing(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to re-subscribe");
      }

      const data = await response.json();
      setResubscribeSuccess(true);
      toast.success(data.message);

      // Log re-subscribe event for analytics
      event({
        action: "resubscribe",
        category: "Email",
        label: email,
      });

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      toast.error(error.message);
      console.error("Re-subscribe error:", error);
    } finally {
      setIsResubscribing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center" aria-live="polite">
            <FiLoader className="animate-spin text-blue-600 text-4xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Unsubscribing...</h1>
            <p className="text-gray-600 mt-2">Please wait while we process your request.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center" aria-live="polite">
            <FiCheckCircle className="text-blue-500 text-5xl mb-4" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-800">You’ve Been Unsubscribed</h1>
            <p className="text-gray-600 mt-2">
              You will no longer receive emails from ExpertResume.
            </p>
            <p className="text-gray-600 mt-2">
              Changed your mind? You can always re-subscribe to receive updates and offers.
            </p>
            {resubscribeSuccess ? (
              <div className="mt-4 flex flex-col items-center">
                <FiCheckCircle className="text-blue-500 text-3xl mb-2" aria-hidden="true" />
                <p className="text-blue-600 font-semibold">
                  Successfully re-subscribed! Redirecting...
                </p>
              </div>
            ) : (
              <button
                onClick={handleResubscribe}
                disabled={isResubscribing}
                className={`mt-4 flex items-center gap-2 px-6 py-2 rounded-lg text-white font-semibold transition-all ${
                  isResubscribing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
                }`}
                aria-label={isResubscribing ? "Re-subscribing in progress" : "Re-subscribe to emails"}
              >
                {isResubscribing ? (
                  <>
                    <FiLoader className="animate-spin" /> Re-subscribing...
                  </>
                ) : (
                  <>
                    <FiMail /> Re-subscribe
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center" aria-live="polite">
            <FiXCircle className="text-red-500 text-5xl mb-4" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-800">Something Went Wrong</h1>
            <p className="text-gray-600 mt-2">
              We couldn’t process your unsubscribe request. Please try again or contact support.
            </p>
            <a
              href="mailto:support@expertresume.us"
              className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all"
              aria-label="Contact support via email"
            >
              Contact Support
            </a>
          </div>
        )}
      </div>
    </div>
  );
}