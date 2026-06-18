import { Link, useRouteError } from "react-router-dom";

const ErrorBoundary = () => {
  const error = useRouteError();

  const message =
    error?.statusText || error?.message || error?.toString?.() || "Unexpected error occurred";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4"
      role="alert"
    >
      <div className="max-w-xl">
        <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="text-gray-700 mb-6">{message}</p>

        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-[#B85C3C] text-white px-5 py-2.5 font-semibold hover:bg-[#A04A2E] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorBoundary;

