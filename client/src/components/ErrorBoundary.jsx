import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary]', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center px-6">
                    <div className="text-center space-y-6 max-w-md">
                        <div className="w-16 h-16 bg-rose-100 border border-rose-300 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-8 h-8 text-rose-600" />
                        </div>
                        <h1 className="text-2xl font-extrabold font-heading text-[#3A2E1F]">
                            Something Went Wrong
                        </h1>
                        <p className="text-sm text-[#3A2E1F]/70 leading-relaxed">
                            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-sm rounded-full shadow-md transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5EFE0] hover:bg-[#E8DEC8] text-[#3A2E1F] font-bold text-sm rounded-full border border-[#E8DEC8] transition-all"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
