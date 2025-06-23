import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { z } from "zod";

interface Snippet {
  id: string;
  text: string;
  summary: string;
  createdAt: string;
  createdBy?: string;
}

interface ActionData {
  error?: string;
  fieldErrors?: {
    text?: string;
    email?: string;
  };
}

const createSnippetSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .max(10000, "Text must be less than 10,000 characters"),
  email: z.string().email("Please provide a valid email address"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const response = await fetch(
      `${process.env.API_URL || "http://localhost:3000"}/snippets`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch snippets");
    }
    const snippets: Snippet[] = await response.json();
    return { snippets };
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return { snippets: [] };
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const text = formData.get("text") as string;
  const email = formData.get("email") as string;

  try {
    // Validate input with Zod
    const validatedData = createSnippetSchema.parse({ text, email });

    // First, get a JWT token by logging in
    const loginResponse = await fetch(
      `${process.env.API_URL || "http://localhost:3000"}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: validatedData.email }),
      }
    );

    if (!loginResponse.ok) {
      throw new Error("Failed to authenticate user");
    }

    const { token } = await loginResponse.json();

    // Create the snippet with the JWT token
    const snippetResponse = await fetch(
      `${process.env.API_URL || "http://localhost:3000"}/snippets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: validatedData.text }),
      }
    );

    if (!snippetResponse.ok) {
      const errorData = await snippetResponse.json();
      return json({
          error: errorData.message || "Failed to create snippet",
          fieldErrors: {},
        },
        { status: 400 }
      );
    }

    const snippet = await snippetResponse.json();
    return redirect(`/snippets/${snippet.id}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      return json({ error: "Validation failed", fieldErrors }, { status: 400 });
    }

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        fieldErrors: {},
      },
      { status: 500 }
    );
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { snippets } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-4xl space-y-12 px-4 sm:px-6 lg:px-8">
        {/* --- Create Snippet Form --- */}
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            AI Snippet Service
          </h1>
          <p className="text-lg text-gray-600 mb-6 text-center">
            Paste your raw text below and get an AI-powered summary instantly.
          </p>

          {actionData?.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  actionData?.fieldErrors?.email
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="you@example.com"
              />
              {actionData?.fieldErrors?.email && (
                <p className="mt-1 text-sm text-red-600">
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  actionData?.fieldErrors?.text
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="Paste your raw text here (blog post, transcript, article, etc.)..."
              />
              {actionData?.fieldErrors?.text && (
                <p className="mt-1 text-sm text-red-600">
                  {actionData.fieldErrors.text}
                </p>
              )}
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Snippet"}
              </button>
            </div>
          </Form>
        </div>

        {/* --- Recent Snippets List --- */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Recent Snippets
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Latest AI-generated summaries
            </p>
          </div>

          {snippets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No snippets found</p>
              <p className="text-gray-400 mt-2">
                Create your first snippet to get started
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <ul className="divide-y divide-gray-200">
                {snippets.map((snippet) => (
                  <li key={snippet.id}>
                    <a
                      href={`/snippets/${snippet.id}`}
                      className="block hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {snippet.text.length > 100
                                ? `${snippet.text.substring(0, 100)}...`
                                : snippet.text}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {snippet.summary}
                            </p>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <span>
                                Created:{" "}
                                {
                                  new Date(snippet.createdAt)
                                    .toISOString()
                                    .split("T")[0]
                                }
                              </span>
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
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const resources = [
  {
    href: "https://remix.run/start/quickstart",
    text: "Quick Start (5 min)",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M8.51851 12.0741L7.92592 18L15.6296 9.7037L11.4815 7.33333L12.0741 2L4.37036 10.2963L8.51851 12.0741Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "https://remix.run/start/tutorial",
    text: "Tutorial (30 min)",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M4.561 12.749L3.15503 14.1549M3.00811 8.99944H1.01978M3.15503 3.84489L4.561 5.2508M8.3107 1.70923L8.3107 3.69749M13.4655 3.84489L12.0595 5.2508M18.1868 17.0974L16.635 18.6491C16.4636 18.8205 16.1858 18.8205 16.0144 18.6491L13.568 16.2028C13.383 16.0178 13.0784 16.0347 12.915 16.239L11.2697 18.2956C11.047 18.5739 10.6029 18.4847 10.505 18.142L7.85215 8.85711C7.75756 8.52603 8.06365 8.21994 8.39472 8.31453L17.6796 10.9673C18.0223 11.0653 18.1115 11.5094 17.8332 11.7321L15.7766 13.3773C15.5723 13.5408 15.5554 13.8454 15.7404 14.0304L18.1868 16.4767C18.3582 16.6481 18.3582 16.926 18.1868 17.0974Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "https://remix.run/docs",
    text: "Remix Docs",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M9.99981 10.0751V9.99992M17.4688 17.4688C15.889 19.0485 11.2645 16.9853 7.13958 12.8604C3.01467 8.73546 0.951405 4.11091 2.53116 2.53116C4.11091 0.951405 8.73546 3.01467 12.8604 7.13958C16.9853 11.2645 19.0485 15.889 17.4688 17.4688ZM2.53132 17.4688C0.951566 15.8891 3.01483 11.2645 7.13974 7.13963C11.2647 3.01471 15.8892 0.951453 17.469 2.53121C19.0487 4.11096 16.9854 8.73551 12.8605 12.8604C8.73562 16.9853 4.11107 19.0486 2.53132 17.4688Z"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "https://rmx.as/discord",
    text: "Join Discord",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 24 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M15.0686 1.25995L14.5477 1.17423L14.2913 1.63578C14.1754 1.84439 14.0545 2.08275 13.9422 2.31963C12.6461 2.16488 11.3406 2.16505 10.0445 2.32014C9.92822 2.08178 9.80478 1.84975 9.67412 1.62413L9.41449 1.17584L8.90333 1.25995C7.33547 1.51794 5.80717 1.99419 4.37748 2.66939L4.19 2.75793L4.07461 2.93019C1.23864 7.16437 0.46302 11.3053 0.838165 15.3924L0.868838 15.7266L1.13844 15.9264C2.81818 17.1714 4.68053 18.1233 6.68582 18.719L7.18892 18.8684L7.50166 18.4469C7.96179 17.8268 8.36504 17.1824 8.709 16.4944L8.71099 16.4904C10.8645 17.0471 13.128 17.0485 15.2821 16.4947C15.6261 17.1826 16.0293 17.8269 16.4892 18.4469L16.805 18.8725L17.3116 18.717C19.3056 18.105 21.1876 17.1751 22.8559 15.9238L23.1224 15.724L23.1528 15.3923C23.5873 10.6524 22.3579 6.53306 19.8947 2.90714L19.7759 2.73227L19.5833 2.64518C18.1437 1.99439 16.6386 1.51826 15.0686 1.25995ZM16.6074 10.7755L16.6074 10.7756C16.5934 11.6409 16.0212 12.1444 15.4783 12.1444C14.9297 12.1444 14.3493 11.6173 14.3493 10.7877C14.3493 9.94885 14.9378 9.41192 15.4783 9.41192C16.0471 9.41192 16.6209 9.93851 16.6074 10.7755ZM8.49373 12.1444C7.94513 12.1444 7.36471 11.6173 7.36471 10.7877C7.36471 9.94885 7.95323 9.41192 8.49373 9.41192C9.06038 9.41192 9.63892 9.93712 9.6417 10.7815C9.62517 11.6239 9.05462 12.1444 8.49373 12.1444Z"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];
