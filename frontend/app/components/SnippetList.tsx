import { Link } from "@remix-run/react";
import type { Snippet } from "../types/types";

interface SnippetListProps {
  snippets: Snippet[];
}

export default function SnippetList({ snippets }: SnippetListProps) {
  if (snippets.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Recent Snippets
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Latest AI-generated summaries
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No snippets found</p>
          <p className="text-gray-400 mt-2">
            Create your first snippet to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">
          Recent Snippets
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Latest AI-generated summaries
        </p>
      </div>

      <div 
        className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        role="region"
        aria-label="Snippets list"
      >
        <ul className="divide-y divide-gray-200" role="list">
          {snippets.map((snippet) => (
            <li key={snippet.id} role="listitem">
              <Link
                to={`/snippets/${snippet.id}`}
                className="block hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                aria-describedby={`snippet-${snippet.id}-summary`}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {snippet.text.length > 100
                          ? `${snippet.text.substring(0, 100)}...`
                          : snippet.text}
                      </p>
                      <p 
                        id={`snippet-${snippet.id}-summary`}
                        className="mt-1 text-sm text-gray-600"
                      >
                        {snippet.summary}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <time dateTime={snippet.createdAt}>
                          Created:{" "}
                          {new Date(snippet.createdAt).toLocaleDateString()}
                        </time>
                        {snippet.createdBy && (
                          <span className="ml-4">
                            By: {snippet.createdBy}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 