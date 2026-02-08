"use client";
import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLocation } from "../context/LocationContext";

const CurrencySwitcher = ({ 
  className = "", 
  showLabel = true, 
  variant = "default", // "default", "compact", "minimal"
  onCurrencyChange = null 
}) => {
  const { currency, switchCurrency, isLoadingGeo } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "INR", symbol: "₹", name: "US Rupee" },
  ];

  const handleCurrencyChange = (newCurrency) => {
    switchCurrency(newCurrency);
    if (onCurrencyChange) {
      onCurrencyChange(newCurrency);
    }
    setIsOpen(false);
  };

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

  if (isLoadingGeo) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium">{currentCurrency.code}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr.code)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                  curr.code === currency ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{curr.symbol} {curr.code}</span>
                  {curr.code === currency && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
        >
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">{currentCurrency.symbol} {currentCurrency.code}</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                  curr.code === currency ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{curr.symbol} {curr.code}</div>
                    <div className="text-xs text-gray-500">{curr.name}</div>
                  </div>
                  {curr.code === currency && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-gray-500" />
          <div className="text-left">
            <div className="font-medium text-gray-900">{currentCurrency.symbol} {currentCurrency.code}</div>
            <div className="text-sm text-gray-500">{currentCurrency.name}</div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.code)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 ${
                curr.code === currency ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              } ${curr.code === currencies[0].code ? 'rounded-t-lg' : ''} ${curr.code === currencies[currencies.length - 1].code ? 'rounded-b-lg' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{curr.symbol} {curr.code}</div>
                    <div className="text-sm text-gray-500">{curr.name}</div>
                  </div>
                </div>
                {curr.code === currency && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySwitcher; 