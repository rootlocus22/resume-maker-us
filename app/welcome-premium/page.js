'use client';
import { Suspense } from "react";
import WelcomePremium from "./WelcomePremium";
import { useSearchParams } from "next/navigation";

// Server-side component to extract search params via Suspense
export default function WelcomePremiumPage({ searchParams }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WelcomePremiumWrapper />
    </Suspense>
  );
}

// Client-side wrapper to use useSearchParams
function WelcomePremiumWrapper() {

  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const billingCycle = searchParams.get("billingCycle");
  const source = searchParams.get("source");
  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency");
  const orderId = searchParams.get("orderId");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const name = searchParams.get("name");
  const hasApplyPro = searchParams.get("hasApplyPro");

  return <WelcomePremium
    plan={plan}
    billingCycle={billingCycle}
    source={source}
    amount={amount}
    currency={currency}
    orderId={orderId}
    email={email}
    phone={phone}
    name={name}
    hasApplyPro={hasApplyPro === 'true'}
  />;
}

// Fallback component for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 animate-pulse">Loading Your Premium Access...</h1>
        <p className="text-sm text-gray-600 mt-2">Just a moment while we set everything up!</p>
      </div>
    </div>
  );
}