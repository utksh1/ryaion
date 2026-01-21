import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallbackUI?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component with Matrix-themed UI
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallbackUI) {
                return this.props.fallbackUI;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-10">
                    <div className="glass-card p-12 rounded-[56px] border-2 border-[#FF4D4D]/30 max-w-2xl text-center space-y-8 animate-in fade-in duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                <i className="fas fa-exclamation-triangle text-9xl text-[#FF4D4D]"></i>
                            </div>
                            <div className="relative z-10">
                                <i className="fas fa-skull-crossbones text-6xl text-[#FF4D4D] mb-6 animate-pulse"></i>
                                <h2 className="text-4xl font-black uppercase tracking-tightest text-white mb-4">
                                    System Breach Detected
                                </h2>
                                <p className="text-sm text-gray-400 font-medium mb-2">
                                    CRITICAL_ERROR_NODE_FAILURE
                                </p>
                                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8">
                                    <p className="text-xs font-mono text-[#FF4D4D] break-all">
                                        {this.state.error?.message || 'Unknown error occurred'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-8 py-4 bg-[#A42420] hover:bg-[#8B1F1C] text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all hover:scale-105"
                            >
                                <i className="fas fa-redo mr-2"></i>
                                Retry Connection
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all"
                            >
                                <i className="fas fa-home mr-2"></i>
                                Return to Matrix
                            </button>
                        </div>

                        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-600">
                            Error ID: {Date.now().toString(36).toUpperCase()}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
