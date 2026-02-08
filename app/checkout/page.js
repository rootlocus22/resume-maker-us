
import { Suspense } from "react";
import CheckoutWrapper from "./CheckoutWrapper";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <CheckoutWrapper />
    </Suspense>
  );
}