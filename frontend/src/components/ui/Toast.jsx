import { Toaster } from 'react-hot-toast';

/**
 * App-wide toast configuration.
 * Project colors: green, blue, white.
 * Use via: import toast from 'react-hot-toast' and call toast.success()/toast.error().
 */
export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: '14px',
          maxWidth: '420px',
        },
        success: {
          iconTheme: { primary: '#16a34a' /* green */, secondary: '#ffffff' /* white */ },
        },
        error: {
          // Using blue (project theme) instead of red
          iconTheme: { primary: '#2563eb' /* blue */, secondary: '#ffffff' /* white */ },
        },
        // react-hot-toast will also use these themes for other toast types
        iconTheme: { primary: '#2563eb' /* blue */, secondary: '#ffffff' /* white */ },
      }}
    />
  );
}


