import React from "react";

export class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(p:any){ super(p); this.state = { hasError:false }; }
  static getDerivedStateFromError(){ return { hasError:true }; }
  componentDidCatch(e:any){ console.error("ErrorBoundary:", e); }
  render(){ return this.state.hasError ? this.props.fallback : this.props.children; }
}