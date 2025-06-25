import { Form } from "@remix-run/react";
import type { ActionData } from "../types/types";

interface CreateSnippetFormProps {
  actionData?: ActionData;
  isSubmitting: boolean;
}

export default function CreateSnippetForm({ actionData, isSubmitting }: CreateSnippetFormProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        AI Snippet Service
      </h1>
      <p className="text-lg text-gray-600 mb-6 text-center">
        Paste your raw text below and get an AI-powered summary instantly.
      </p>

      {actionData?.error && (
        <div 
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm text-red-800">{actionData.error}</p>
        </div>
      )}

      <Form method="post" noValidate className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            aria-describedby={actionData?.fieldErrors?.email ? "email-error" : undefined}
            aria-invalid={!!actionData?.fieldErrors?.email}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              actionData?.fieldErrors?.email
                ? "border-red-300"
                : "border-gray-300"
            }`}
            placeholder="you@example.com"
          />
          {actionData?.fieldErrors?.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {actionData.fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="text"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Text to Summarize
          </label>
          <textarea
            id="text"
            name="text"
            rows={8}
            required
            aria-describedby={actionData?.fieldErrors?.text ? "text-error" : undefined}
            aria-invalid={!!actionData?.fieldErrors?.text}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              actionData?.fieldErrors?.text
                ? "border-red-300"
                : "border-gray-300"
            }`}
            placeholder="Paste your raw text here (blog post, transcript, article, etc.)..."
          />
          {actionData?.fieldErrors?.text && (
            <p id="text-error" className="mt-1 text-sm text-red-600" role="alert">
              {actionData.fieldErrors.text}
            </p>
          )}
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-describedby="submit-status"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Snippet"}
          </button>
          {isSubmitting && (
            <p id="submit-status" className="sr-only" aria-live="polite">
              Creating snippet, please wait...
            </p>
          )}
        </div>
      </Form>
    </div>
  );
} 