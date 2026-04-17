"use client";

import { Component, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg font-bold text-white">Something went wrong</p>
          <p className="max-w-md text-sm text-slate-400">
            The dashboard encountered an error. The trading bot is unaffected.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
