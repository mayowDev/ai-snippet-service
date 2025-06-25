import { Link } from "@remix-run/react";
import type { Snippet } from "../types/types";
import { useState } from "react";

interface SnippetDetailProps {
  snippet: Snippet;
}

export default function SnippetDetail({ snippet }: SnippetDetailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <>
      <nav className="mb-6" aria-label="Breadcrumb">
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Snippets
        </Link>
      </nav>

      <article className="bg-white shadow overflow-hidden sm:rounded-lg">
        <header className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Snippet Details
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Created on{" "}
                <time dateTime={snippet.createdAt}>
                  {new Date(snippet.createdAt).toLocaleDateString()}
                </time>
                {snippet.createdBy && (
                  <span className="ml-2">by {snippet.createdBy}</span>
                )}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New
              </Link>
            </div>
          </div>
        </header>

        <section className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Original Text
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div 
                  className="max-h-[400px] overflow-y-auto bg-white p-4 rounded-md border border-gray-200"
                  role="region"
                  aria-label="Original text content"
                >
                  <p className="whitespace-pre-wrap">{snippet.text}</p>
                </div>
              </dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                AI Summary
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div 
                  className="bg-indigo-50 p-4 rounded-md border border-indigo-200 flex items-start gap-2"
                  role="region"
                  aria-label="AI generated summary"
                >
                  <p className="text-indigo-900 font-medium flex-1 select-all" id="ai-summary">
                    {snippet.summary}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy summary to clipboard"
                    className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </dd>
            </div>
          </dl>
        </section>
      </article>
    </>
  );
} 