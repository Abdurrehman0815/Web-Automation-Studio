import React from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    console.error('🚨 Error caught by boundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 Component crashed:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log the specific error details
    console.group('🐛 Crash Details');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-effect rounded-xl p-8 m-4 text-center border border-red-400/30 bg-red-500/10">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Component Crashed</h3>
          <p className="text-gray-300 text-sm mb-4">
            There was an error during the drag-and-drop operation.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left max-w-2xl mx-auto">
              <summary className="text-xs text-gray-400 cursor-pointer">
                🔍 Error Details
              </summary>
              <pre className="text-xs text-red-300 mt-2 p-2 bg-red-900/20 rounded overflow-auto">
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
