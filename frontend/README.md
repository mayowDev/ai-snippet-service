# AI Snippet Service - Remix Frontend

- 📖 [Remix docs](https://remix.run/docs)

## Folder Structure

```
frontend/
  app/
    components/
      CreateSnippetForm.tsx
      LoadingSpinner.tsx
      SnippetDetail.tsx
      SnippetList.tsx
    routes/
      _index.tsx
      snippets.$id.tsx
    types/
      types.ts
    entry.client.tsx
    entry.server.tsx
    root.tsx
    tailwind.css
  package.json
  tailwind.config.ts
  vite.config.ts
  tsconfig.json
  README.md
```

## Recent Code Quality Improvements
- **Error Handling:** Added a global ErrorBoundary in `root.tsx` for 404 and other errors, with a user-friendly 404 page.
- **Componentization:** Refactored UI into reusable components (`CreateSnippetForm`, `SnippetList`, `SnippetDetail`, `LoadingSpinner`).
- **Accessibility:** Improved ARIA labels, keyboard navigation, and screen reader support.
- **Styling:** Ensured Tailwind CSS is loaded globally and fixed issues with styling loss on navigation.
- **Performance:** Implemented lazy loading for large components and optimized data fetching with cache headers.
- **Type Safety:** Centralized all shared types in `types/types.ts`.
- **Removed Obsolete Files:** Removed the unused `[...404].tsx` catch-all route in favor of the official ErrorBoundary approach.

## Development

Run the dev server:

```sh
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
