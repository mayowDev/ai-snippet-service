import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

interface Snippet {
  id: string;
  text: string;
  summary: string;
  createdAt: string;
  createdBy?: string;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const response = await fetch(
      `${process.env.API_URL || "http://localhost:3000"}/snippets/${id}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Response("Not Found", { status: 404 });
      }
      throw new Error("Failed to fetch snippet");
    }

    const snippet: Snippet = await response.json();
    return json({ snippet });
  } catch (error) {
    console.error("Error fetching snippet:", error);
    throw new Response("Not Found", { status: 404 });
  }
}

export default function SnippetDetail() {
  const { snippet } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Snippets
          </a>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Snippet Details
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Created on {new Date(snippet.createdAt).toLocaleDateString()}
                  {snippet.createdBy && (
                    <span className="ml-2">by {snippet.createdBy}</span>
                  )}
                </p>
              </div>
              <div className="flex space-x-3">
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create New
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Original Text
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="max-h-[400px] overflow-y-auto  bg-white p-4 rounded-md border border-gray-200">
                    <p className="whitespace-pre-wrap">{snippet.text}</p>
                  </div>
                </dd>
              </div>

              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  AI Summary
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="bg-indigo-50 p-4 rounded-md border border-indigo-200">
                    <p className="text-indigo-900 font-medium">
                      {snippet.summary}
                    </p>
                  </div>
                </dd>
              </div>

              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Snippet ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {snippet.id}
                  </code>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
