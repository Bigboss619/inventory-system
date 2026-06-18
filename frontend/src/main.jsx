import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorBoundary from './context/ErrorHandle/ErrorBoundary';
import './index.css'
import App from './App.jsx'

// Pages
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Layout
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/', element: <Home /> },
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> }
        ]
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)