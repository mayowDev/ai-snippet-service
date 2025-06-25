import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Suspense, lazy } from "react";
import type { Snippet } from "../types/types";

// Lazy load components for better performance
const SnippetDetail = lazy(() => import("../components/SnippetDetail"));
const LoadingSpinner = lazy(() => import("../components/LoadingSpinner"));

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    throw new Response("Snippet ID is required", { status: 400 });
  }

  try {
    const response = await fetch(
      `${process.env.API_URL || "http://localhost:3000"}/snippets/${id}`,
      {
        // Add cache control for better performance
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=600',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Response("Snippet not found", { status: 404 });
      }
      throw new Response(`Failed to fetch snippet: ${response.status}`, { 
        status: response.status 
      });
    }

    const snippet: Snippet = await response.json();
    return { snippet };
  } catch (error) {
    console.error("Error fetching snippet:", error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response("Failed to fetch snippet", { status: 500 });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.snippet) {
    return [
      { title: "Snippet Not Found - AI Snippet Service" },
      { name: "description", content: "The requested snippet could not be found." },
    ];
  }

  return [
    { title: `Snippet Details - AI Snippet Service` },
    { name: "description", content: data.snippet.summary },
    { property: "og:title", content: "Snippet Details" },
    { property: "og:description", content: data.snippet.summary },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Snippet Details" },
    { name: "twitter:description", content: data.snippet.summary },
  ];
};

export default function SnippetDetailPage() {
  const { snippet } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingSpinner />}>
          <SnippetDetail snippet={snippet} />
        </Suspense>
      </div>
    </div>
  );
}
