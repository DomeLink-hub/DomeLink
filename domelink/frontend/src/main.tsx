import { createRoot } from "react-dom/client";
import { Suspense, lazy } from "react";
const App = lazy(() => import("./App.tsx"));
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-lg">Loading…</div>}>
		<App />
	</Suspense>
);
