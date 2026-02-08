"use client";
import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const LocationContext = createContext(undefined);




export function LocationProvider({ children }) {
  // US app: USD only
  const [countryCode, setCountryCode] = useState("US");
  const [currency, setCurrency] = useState("USD");
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrency("USD");
      setCountryCode("US");
      localStorage.setItem("currency", "USD");
    }
  }, []);

  const switchCurrency = (newCurrency) => {
    if (newCurrency !== "USD") return;
    setCurrency("USD");
    setCountryCode("US");
    if (typeof window !== "undefined") localStorage.setItem("currency", "USD");
    toast.success("Pricing in USD.");
  };

  return (
    <LocationContext.Provider value={{ countryCode, currency, isLoadingGeo, switchCurrency }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};