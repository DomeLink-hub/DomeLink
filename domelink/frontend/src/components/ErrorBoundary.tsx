import { Component, type ErrorInfo, type ReactNode } from "react";
import { motion } from "framer-motion";

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    // Structured error log — in production this would go to Sentry
    const entry = {
      level: "error",
      ts: new Date().toISOString(),
      domain: "ui",
      message: "React ErrorBoundary caught",
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    };
    console.error(JSON.stringify(entry));
    
    // Log directly to Sentry
    import("@sentry/react").then((Sentry) => {
      Sentry.captureException(error, { contexts: { react: { componentStack: info.componentStack } } });
    });
  }

  public render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background text-foreground">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="dome-panel p-10 max-w-lg w-full text-center"
        >
          {/* Animated ring */}
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <motion.div
              className="absolute inset-0 rounded-full border border-border/40"
              animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="dome-node" />
            </div>
          </div>

          <span className="dome-kicker mb-4">System Notice</span>
          <h1 className="text-display-sm mb-3">Something went wrong</h1>
          <p className="text-body text-muted-foreground mb-8">
            An unexpected error occurred. Your data is safe — this is a display issue only.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              className="dome-button"
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reload page
            </motion.button>
            <motion.button
              className="dome-button-outline"
              onClick={() => { this.setState({ hasError: false, error: undefined }); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Try again
            </motion.button>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <details className="mt-8 text-left">
              <summary className="text-caption text-muted-foreground cursor-pointer">Error details (dev only)</summary>
              <pre className="mt-3 text-xs text-muted-foreground overflow-auto max-h-40 bg-secondary/30 p-3 rounded-xl">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </motion.div>
      </div>
    );
  }
}

export default ErrorBoundary;
