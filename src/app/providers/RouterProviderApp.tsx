import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { router } from "../../lib/router/router";

// Shown only while the first page's code loads; later navigations keep the current page
// on screen until the next one is ready (React Router runs them as transitions).
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

export const RouterProviderApp = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
