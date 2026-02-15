// PdfPreviewModal.js (assumed structure)
import { X, Bot } from "lucide-react";
import Link from 'next/link';
export default function PdfPreviewModal({ pdfPreviewUrl, onClose, isLoading }) {
  return (
    <div className="bg-white rounded-md p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
        <X size={24} />
      </button>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">PDF Preview</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-accent" />
        </div>
      ) : (
        <div className="flex justify-center">
          <iframe
            src={pdfPreviewUrl}
            className="border-0 rounded-lg"
            style={{
              width: '794px',
              maxWidth: '100%',
              height: '60vh',
              backgroundColor: 'white'
            }}
            title="PDF Preview"
          />
        </div>
      )}
      <div className="mt-4 flex justify-between items-center border-t pt-4">
        <div>
          <Link href="/ai-interview/mock-interview-ai" target="_blank" className="flex items-center gap-2 text-sm text-purple-600 font-semibold hover:text-purple-800 bg-purple-50 px-3 py-2 rounded-lg transition-colors">
            <Bot size={16} />
            Practice for this Interview (Free)
          </Link>
        </div>
        <a
          href={pdfPreviewUrl}
          download="resume.pdf"
          className="bg-accent hover:bg-accent-600 text-white px-4 py-2 rounded-md font-medium"
        >
          Download PDF
        </a>
      </div>
    </div >
  );
}