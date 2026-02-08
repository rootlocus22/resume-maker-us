'use client';

import { useState, useCallback } from 'react';
import OnePagerPreview from '../../components/OnePagerPreview';
import toast, { Toaster } from 'react-hot-toast';
import { OnePagerTemplates } from '../../components/OnePagerTemplates';

export default function HostedOnePagerClient({ hostedData }) {
    const [downloadEnabled, setDownloadEnabled] = useState(hostedData.downloadEnabled || false);
    const [paymentStatus, setPaymentStatus] = useState(hostedData.paymentStatus || 'pending');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(hostedData.template || 'classic');
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    const resumeData = hostedData.snapshotData || {};
    const customColors = hostedData.customColors || {};
    const paymentAmount = hostedData.paymentAmount || 0;
    const paymentCurrency = hostedData.paymentCurrency || 'INR';
    const hostedId = hostedData.id;

    const zeroDecimalCurrencies = new Set(['JPY', 'KRW', 'VND']);

    const formatCurrency = (amount, currency = 'INR') => {
        const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
        if (Number.isNaN(numericAmount)) {
            return '';
        }

        const upperCurrency = (currency || 'INR').toUpperCase();
        const fractionDigits = zeroDecimalCurrencies.has(upperCurrency) ? 0 : 2;

        try {
            return new Intl.NumberFormat(
                upperCurrency === 'INR' ? 'en-IN' : 'en-US',
                {
                    style: 'currency',
                    currency: upperCurrency,
                    minimumFractionDigits: fractionDigits,
                    maximumFractionDigits: fractionDigits,
                }
            ).format(numericAmount);
        } catch (error) {
            return `${upperCurrency} ${numericAmount}`;
        }
    };

    const handleDownload = useCallback(async () => {
        if (!downloadEnabled) return;

        try {
            setIsGeneratingPDF(true);
            toast.loading('Generating PDF...', { id: 'download-pdf' });

            const response = await fetch(`/api/download-one-pager-hosted/${hostedId}`);

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${resumeData.personal?.name || 'OnePager'}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF downloaded successfully!', { id: 'download-pdf' });
        } catch (err) {
            console.error('Download failed:', err);
            toast.error(`Failed to download PDF: ${err.message}`, { id: 'download-pdf' });
        } finally {
            setIsGeneratingPDF(false);
        }
    }, [downloadEnabled, hostedId, resumeData]);

    const handlePayAndDownload = useCallback(async () => {
        if (isProcessingPayment || paymentAmount <= 0) {
            return;
        }

        try {
            setIsProcessingPayment(true);
            setPaymentStatus('processing');

            const customerName = resumeData.personal?.name || '';
            const customerEmail = resumeData.personal?.email || '';
            const customerContact = resumeData.personal?.phone || '';

            // Create Stripe Checkout Session
            const orderResponse = await fetch('/api/hosted-resume/create-payment-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hostedId,
                    customerName,
                    customerEmail,
                    customerContact,
                    origin: typeof window !== 'undefined' ? window.location.origin : '',
                }),
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok || !orderData.success) {
                throw new Error(orderData.error || 'Failed to initiate payment.');
            }

            // Redirect to Stripe Checkout
            window.location.href = orderData.url;
        } catch (error) {
            console.error('Payment initiation failed:', error);
            toast.error(error.message || 'Unable to initiate payment. Please try again.');
            setIsProcessingPayment(false);
            setPaymentStatus('pending');
        }
    }, [isProcessingPayment, paymentAmount, hostedId, resumeData]);

    // Get template data from OnePagerTemplates
    const getTemplateData = (templateId) => {
        const templateInfo = {
            classic: {
                name: 'Classic Professional',
                previewImage: '/templates/onepager-previews/classic.png'
            },
            modern: {
                name: 'Modern Clean',
                previewImage: '/templates/onepager-previews/modern.png'
            },
            tech: {
                name: 'Tech Minimalist',
                previewImage: '/templates/onepager-previews/tech.png'
            },
            executive: {
                name: 'Executive Bold',
                previewImage: '/templates/onepager-previews/executive.png'
            },
            compact: {
                name: 'Compact Efficient',
                previewImage: '/templates/onepager-previews/compact.png'
            },
            creative: {
                name: 'Creative Vibrant',
                previewImage: '/templates/onepager-previews/creative.png'
            },
            timeline: {
                name: 'Timeline Journey',
                previewImage: '/templates/onepager-previews/timeline.png'
            },
            grid: {
                name: 'Modern Grid',
                previewImage: '/templates/onepager-previews/grid.png'
            },
            elegant: {
                name: 'Elegant Serif',
                previewImage: '/templates/onepager-previews/elegant.png'
            },
            bold: {
                name: 'Bold Impact',
                previewImage: '/templates/onepager-previews/bold.png'
            },
            magazine: {
                name: 'Magazine Editorial',
                previewImage: '/templates/onepager-previews/magazine.png'
            },
            modern_tech: {
                name: 'Modern Tech',
                previewImage: '/templates/onepager-previews/modern_tech.png'
            },
            creative_bold: {
                name: 'Creative Bold',
                previewImage: '/templates/onepager-previews/creative_bold.png'
            },
            professional_serif: {
                name: 'Professional Serif',
                previewImage: '/templates/onepager-previews/professional_serif.png'
            },
            graceful_elegance: {
                name: 'Graceful Elegance',
                previewImage: '/templates/onepager-previews/graceful_elegance.png'
            },
        };

        return templateInfo[templateId] || {
            name: templateId,
            previewImage: '/templates/onepager-previews/classic.png'
        };
    };

    const currentTemplate = getTemplateData(selectedTemplate);

    return (
        <>
            <Toaster position="top-center" />
            <div className="min-h-screen bg-gray-50">
                {/* Header - Mobile Responsive */}
                <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
                        {/* Mobile Layout: Stacked */}
                        <div className="flex flex-col space-y-3 sm:hidden">
                            <div>
                                <h1 className="text-base font-semibold text-gray-900 truncate">
                                    {resumeData.personal?.name || 'Resume'} <span className="text-gray-500 text-sm">- Hosted</span>
                                </h1>
                                <div className="mt-1 flex items-center flex-wrap gap-1.5">
                                    {currentTemplate && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            {currentTemplate.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Template Selector Button - Mobile */}
                                <button
                                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
                                    </svg>
                                    <span className="whitespace-nowrap">Template</span>
                                </button>

                                {downloadEnabled ? (
                                    <button
                                        onClick={handleDownload}
                                        disabled={isGeneratingPDF}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1.5"
                                    >
                                        {isGeneratingPDF ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span className="whitespace-nowrap">Generating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="whitespace-nowrap">Download</span>
                                            </>
                                        )}
                                    </button>
                                ) : paymentAmount > 0 ? (
                                    <button
                                        onClick={handlePayAndDownload}
                                        disabled={isProcessingPayment}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1.5"
                                    >
                                        {isProcessingPayment ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span className="whitespace-nowrap">Processing...</span>
                                            </>
                                        ) : (
                                            <span className="whitespace-nowrap">
                                                Pay {formatCurrency(paymentAmount, paymentCurrency)} & Download
                                            </span>
                                        )}
                                    </button>
                                ) : (
                                    <div className="flex-1 bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span className="whitespace-nowrap">Locked</span>
                                    </div>
                                )}
                            </div>
                            {!downloadEnabled && paymentAmount > 0 && (
                                <p className="text-xs text-gray-500 text-center">
                                    Pay {formatCurrency(paymentAmount, paymentCurrency)} to unlock download access.
                                </p>
                            )}
                        </div>

                        {/* Desktop Layout: Horizontal */}
                        <div className="hidden sm:flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                                <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                                    {resumeData.personal?.name || 'Resume'} - Hosted Preview
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-500 truncate flex items-center flex-wrap gap-1.5">
                                    <span>Professional resume hosted by ExpertResume</span>
                                    {currentTemplate && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            {currentTemplate.name}
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
                                {/* Template Selector Button - Desktop */}
                                <button
                                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 lg:space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
                                    </svg>
                                    <span className="hidden md:inline">Change Template</span>
                                    <span className="md:hidden">Template</span>
                                </button>

                                {downloadEnabled ? (
                                    <button
                                        onClick={handleDownload}
                                        disabled={isGeneratingPDF}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 lg:space-x-2"
                                    >
                                        {isGeneratingPDF ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span className="whitespace-nowrap">Generating PDF...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="hidden md:inline">Download PDF</span>
                                                <span className="md:hidden">Download</span>
                                            </>
                                        )}
                                    </button>
                                ) : paymentAmount > 0 ? (
                                    <button
                                        onClick={handlePayAndDownload}
                                        disabled={isProcessingPayment}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 lg:space-x-2"
                                    >
                                        {isProcessingPayment ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span className="whitespace-nowrap">Processing...</span>
                                            </>
                                        ) : (
                                            <span className="whitespace-nowrap">
                                                Pay {formatCurrency(paymentAmount, paymentCurrency)} & Download
                                            </span>
                                        )}
                                    </button>
                                ) : (
                                    <div className="bg-gray-100 text-gray-500 px-3 lg:px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 lg:space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span>Locked</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Template Selector Panel - Mobile Responsive */}
                {showTemplateSelector && (
                    <div className="bg-white border-b shadow-md">
                        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Choose Template</h2>
                                <button
                                    onClick={() => setShowTemplateSelector(false)}
                                    className="text-gray-500 hover:text-gray-700 p-1"
                                    aria-label="Close template selector"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {/* Mobile: 2 columns, Tablet: 3 columns, Desktop: 4-5 columns */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 max-h-[60vh] sm:max-h-96 overflow-y-auto overscroll-contain">
                                {Object.keys(OnePagerTemplates).map((templateId) => {
                                    const templateData = getTemplateData(templateId);
                                    return (
                                        <button
                                            key={templateId}
                                            onClick={() => {
                                                setSelectedTemplate(templateId);
                                                setShowTemplateSelector(false);
                                            }}
                                            className={`relative group rounded-lg border-2 p-2 sm:p-3 transition-all duration-200 hover:shadow-lg active:scale-95 ${selectedTemplate === templateId
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="aspect-[8.5/11] bg-white rounded overflow-hidden mb-1.5 sm:mb-2 shadow-sm">
                                                {templateData.previewImage ? (
                                                    <img
                                                        src={templateData.previewImage}
                                                        alt={templateData.name}
                                                        className="w-full h-full object-cover object-top"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 text-gray-400 text-xs">
                                                        {templateData.name}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{templateData.name}</p>
                                            </div>
                                            {selectedTemplate === templateId && (
                                                <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview */}
                <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <OnePagerPreview
                            data={resumeData}
                            template={selectedTemplate}
                            customColors={customColors}
                        />
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <p className="text-center text-sm text-gray-600">
                            © {new Date().getFullYear()} ExpertResume. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
