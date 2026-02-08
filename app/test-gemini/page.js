'use client';

import { useState } from 'react';

export default function TestGeminiPage() {
  const [testPrompt, setTestPrompt] = useState("Generate a simple test response in one sentence.");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testModels = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-gemini-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testPrompt }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data);
      }
    } catch (err) {
      setError({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gemini Models Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Prompt:
            </label>
            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter a test prompt..."
            />
          </div>
          
          <button
            onClick={testModels}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing Models...' : 'Test All Models'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700 mb-2">{error.error}</p>
            {error.attemptedModels && (
              <div>
                <p className="text-sm text-red-600 font-medium">Attempted Models:</p>
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {error.attemptedModels.map((model, index) => (
                    <li key={index}>{model}</li>
                  ))}
                </ul>
              </div>
            )}
            {error.lastError && (
              <p className="text-sm text-red-600 mt-2">
                <strong>Last Error:</strong> {error.lastError}
              </p>
            )}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Success</h3>
            <div className="space-y-2">
              <p><strong>Model Used:</strong> {result.model}</p>
              <p><strong>Response:</strong></p>
              <div className="bg-white p-3 rounded border">
                <p className="text-gray-800">{result.text}</p>
              </div>
              {result.attemptedModels && result.attemptedModels.length > 1 && (
                <div>
                  <p className="text-sm text-green-600 font-medium">Attempted Models:</p>
                  <ul className="text-sm text-green-600 list-disc list-inside">
                    {result.attemptedModels.map((model, index) => (
                      <li key={index} className={model === result.model ? 'font-bold' : ''}>
                        {model} {model === result.model ? '(SUCCESS)' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 