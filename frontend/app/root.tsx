import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  Link
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">404 - Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">The page or resource you requested does not exist.</p>
        <a
          href="/"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ minWidth: 120, textAlign: 'center' }}
        >
          Go Home
        </a>
      </main>
    );
  }
  // Optionally handle other status codes
  let message = "Unknown error";
  if (isRouteErrorResponse(error)) {
    message = error.statusText || String(error.status) || message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = (error as any).message;
  }
  return (
    <div>
      <h1>Error</h1>
      <pre>{message}</pre>
    </div>
  );
}
