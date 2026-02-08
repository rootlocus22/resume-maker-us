"use client";
import { useState } from "react";
import { allTemplates } from "../lib/allTemplates";

export default function PreviewGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const templateIds = Object.keys(allTemplates);

  const generatePreview = async () => {
    if (!selectedTemplate) {
      setError("Please select a template");
      return;
    }

    setLoading(true);
    setError("");
    setPreviewUrl("");

    try {
      const response = await fetch("/api/generate-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: selectedTemplate,
          customColors: {},
          width: 400,
          height: 566
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Create a blob URL for the image
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

    } catch (err) {
      setError(`Failed to generate preview: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPreview = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `${selectedTemplate}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Template Preview Generator
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a template...</option>
                  {templateIds.map((templateId) => (
                    <option key={templateId} value={templateId}>
                      {allTemplates[templateId].name} ({templateId})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={generatePreview}
                disabled={loading || !selectedTemplate}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate Preview"}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {previewUrl && (
                <button
                  onClick={downloadPreview}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Download Preview
                </button>
              )}

              {selectedTemplate && allTemplates[selectedTemplate] && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-800 mb-2">Template Info</h3>
                  <p><strong>Name:</strong> {allTemplates[selectedTemplate].name}</p>
                  <p><strong>Category:</strong> {allTemplates[selectedTemplate].category}</p>
                  <p><strong>Premium:</strong> {allTemplates[selectedTemplate].premium ? "Yes" : "No"}</p>
                  <p><strong>Columns:</strong> {allTemplates[selectedTemplate].layout?.columns || 1}</p>
                  <p><strong>Header Style:</strong> {allTemplates[selectedTemplate].layout?.headerStyle || "default"}</p>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Preview</h3>
              
              {loading && (
                <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {previewUrl && !loading && (
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={previewUrl}
                    alt={`Preview of ${selectedTemplate}`}
                    className="max-w-full h-auto"
                    style={{ maxHeight: "600px" }}
                  />
                </div>
              )}

              {!previewUrl && !loading && (
                <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg text-gray-500">
                  Select a template and click "Generate Preview"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 