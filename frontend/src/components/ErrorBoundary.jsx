import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-8 bg-rose-900/50 border border-rose-500 rounded-xl text-white overflow-auto">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">🚨</span> App Crashed!
          </h2>
          <p className="mb-4">Please screenshot this exact error message and send it to me so I can fix it immediately:</p>
          <div className="bg-black/50 p-4 rounded text-rose-300 font-mono text-sm whitespace-pre-wrap">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
