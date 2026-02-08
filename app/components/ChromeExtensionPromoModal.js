
import { X } from "lucide-react";
import ChromeExtensionPromo from "./ChromeExtensionPromo";

export default function ChromeExtensionPromoModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-7xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white shadow-sm transition-all border border-gray-100"
                >
                    <X className="w-5 h-5" />
                </button>

                <ChromeExtensionPromo padding="py-12" />
            </div>
        </div>
    );
}
