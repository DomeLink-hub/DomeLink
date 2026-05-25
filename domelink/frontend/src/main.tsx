import { createRoot } from "react-dom/client";
import { Suspense, lazy } from "react";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const App = lazy(() => import("./App.tsx"));
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-lg">Loading…</div>}>
		<App />
	</Suspense>
);
