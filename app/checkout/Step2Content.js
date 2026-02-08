{
    step === 2 && (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="space-y-6"
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                    <button
                        onClick={() => setStep(1)}
                        className="text-sm text-[#0B1F3B] font-semibold hover:text-[#0B1F3B]"
                    >
                        Edit
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                    {/* Base Plan Item */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isStandaloneAddon ? 'bg-[#00C4B3]/10' : 'bg-green-100'}`}>
                                {isStandaloneAddon && AddonIcon ? (
                                    <AddonIcon className="text-[#0B1F3B] w-5 h-5" />
                                ) : (
                                    <Crown className="text-green-600 w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">
                                    {isStandaloneAddon ? currentAddonConfig?.name : (
                                        billingCycle === 'basic' ? 'Starter (Trial Pack)' : (
                                            billingCycle === 'monthly' ? "Pro (Job Seeker's Choice)" :
                                                billingCycle === 'quarterly' ? 'Expert (Career Growth Bundle)' :
                                                    billingCycle === 'sixMonth' ? 'Ultimate (Complete Success Kit)' : 'Plan'
                                        )
                                    )}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {billingCycle === 'basic' ? '7 Days Access' :
                                        billingCycle === 'monthly' ? '30 Days Access' :
                                            billingCycle === 'quarterly' ? '90 Days Access' :
                                                billingCycle === 'sixMonth' ? '180 Days Access' : 'Custom Plan'}
                                </p>
                            </div>
                        </div>
                        <p className="font-bold text-gray-900">
                            {isStandaloneAddon ? (
                                formatPrice(
                                  typeof ADDON_CONFIG[addonParam]?.price?.[effectiveCurrency] === 'object'
                                    ? ADDON_CONFIG[addonParam].price[effectiveCurrency][proBillingCycle]
                                    : ADDON_CONFIG[addonParam]?.price?.[effectiveCurrency] || 0,
                                  effectiveCurrency
                                )
                            ) : (
                                formatPrice(pricing[billingCycle], effectiveCurrency)
                            )}
                        </p>
                    </div>

                    {/* Add-ons (Only show if NOT standalone mode, as standalone is the base item itself) */}
                    {!isStandaloneAddon && (
                        <>
                            {includeJobTracker && (['monthly', 'quarterly', 'sixMonth'].includes(billingCycle)) && !isJobTrackerOnlyPurchase && (
                                <div className="flex justify-between items-center pl-10 sm:pl-12">
                                    <div className="text-sm text-gray-600">+ AI Job Search</div>
                                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                        <Gift size={10} /> FREE GIFT
                                    </div>
                                </div>
                            )}

                            {includeInterviewKit && ['sixMonth', 'quarterly'].includes(billingCycle) && !isJobTrackerOnlyPurchase && (
                                <div className="flex justify-between items-center pl-10 sm:pl-12">
                                    <div className="text-sm text-gray-600">+ Interview Prep Kit</div>
                                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                        <Gift size={10} /> FREE GIFT
                                    </div>
                                </div>
                            )}

                            {includeApplyPro && ['sixMonth', 'quarterly'].includes(billingCycle) && (
                                <div className="flex justify-between items-center pl-10 sm:pl-12">
                                    <div className="text-sm text-gray-600">+ Apply Pro Engine</div>
                                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                        <Gift size={10} /> FREE GIFT
                                    </div>
                                </div>
                            )}

                            {['sixMonth', 'quarterly'].includes(billingCycle) && (
                                <div className="flex justify-between items-center pl-10 sm:pl-12">
                                    <div className="text-sm text-gray-600">+ Interview Simulation  Pro</div>
                                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                        <Gift size={10} /> FREE GIFT
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-gray-100 my-4"></div>

                    {/* Totals */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>{formatPrice(taxableAmount, effectiveCurrency)}</span>
                        </div>

                        {selectedDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                <span>Discount ({Math.round(selectedDiscount * 100)}% OFF)</span>
                                <span>-{formatPrice(discountAmount, effectiveCurrency)}</span>
                            </div>
                        )}

                        {effectiveCurrency === "INR" && (
                            <div className="flex justify-between items-center py-1 px-2 bg-emerald-50 rounded text-[10px] font-bold text-emerald-700 uppercase tracking-wider border border-emerald-100">
                                <span className="flex items-center gap-1"><BadgeCheck size={12} /> No Hidden Fees</span>
                                <span>GST Included</span>
                            </div>
                        )}

                        <div className="flex justify-between items-end pt-2 border-t border-gray-100 mt-2">
                            <span className="font-bold text-gray-900">Total to Pay</span>
                            <span className="text-2xl font-black text-[#0B1F3B]">
                                {formatPrice(finalTotal, effectiveCurrency)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Method Selection Placeholder - Can be expanded */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CreditCard className="text-[#0B1F3B]" size={24} />
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Secure Payment Gateway</p>
                        <p className="text-xs text-gray-500">Encrypted & Safe. UPI, Cards, NetBanking.</p>
                    </div>
                </div>
                <Lock size={16} className="text-green-500" />
            </div>
        </motion.div >
    )
}
