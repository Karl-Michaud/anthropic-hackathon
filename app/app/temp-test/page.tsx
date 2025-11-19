"use client";

import { useState } from "react";
import Link from "next/link";

interface ExtractionResult {
  inputText: string;
  extractedData: {
    title: string;
    criteria: string;
    amount: string;
    deadline: string;
    eligibility: string | string[];
  };
  error?: string;
  timestamp: string;
}

export default function TempTestPage() {
  const [inputText, setInputText] = useState("");
  const [displayedData, setDisplayedData] = useState<ExtractionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/extract-scholarship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: inputText,
          fileType: "txt",
        }),
      });

      const result = await response.json();

      const newEntry: ExtractionResult = {
        inputText: inputText,
        extractedData: result.success ? result.data : null,
        error: result.error,
        timestamp: new Date().toLocaleTimeString(),
      };

      setDisplayedData([...displayedData, newEntry]);
      setInputText("");
    } catch (error) {
      const newEntry: ExtractionResult = {
        inputText: inputText,
        extractedData: null,
        error: `Failed to call API: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setDisplayedData([...displayedData, newEntry]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setDisplayedData([]);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Scholarship Extraction Pipeline Test
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Test the scholarship extraction API - paste scholarship descriptions to see extracted data
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <label htmlFor="textInput" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Enter scholarship description:
          </label>
          <textarea
            id="textInput"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            placeholder="Paste scholarship description here..."
            rows={6}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Extracting..." : "Extract Data"}
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Extraction Results:
          </h2>
          {displayedData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No data yet. Enter scholarship description above and click "Extract Data".
            </p>
          ) : (
            <div className="space-y-6">
              {displayedData.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">
                    <span className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Test #{index + 1}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.timestamp}
                    </span>
                  </div>

                  {/* Input Text */}
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Input:
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 max-h-24 overflow-y-auto">
                      {item.inputText}
                    </p>
                  </div>

                  {/* Extracted JSON */}
                  {item.error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                      <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                        Error:
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        {item.error}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Extracted Data:
                      </h3>
                      <pre className="bg-gray-900 dark:bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(item.extractedData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
