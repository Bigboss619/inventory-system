import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorBoundary from './context/ErrorHandle/ErrorBoundary';
import './index.css'
import App from './App.jsx'

// Pages
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Categories = lazy(() => import('./pages/Categories'));
const Items = lazy(() => import('./pages/Items'));
const StockIn = lazy(() => import('./pages/StockIn'));
const StockOut = lazy(() => import('./pages/StockOut'));
const Staff = lazy(() => import('./pages/Staff'));

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
      },
      {
        path: '/inventory/categories',
        element: <DashboardLayout />,
        children: [
          { path: '/inventory/categories', element: <Categories /> }
        ]
      },
      {
        path: '/inventory/items',
        element: <DashboardLayout />,
        children: [
          { path: '/inventory/items', element: <Items /> }
        ]
      },
      {
        path: '/inventory/stock-in',
        element: <DashboardLayout />,
        children: [
          { path: '/inventory/stock-in', element: <StockIn /> }
        ]
      },
      {
        path: '/inventory/stock-out',
        element: <DashboardLayout />,
        children: [
          { path: '/inventory/stock-out', element: <StockOut /> }
        ]
      },
      {
        path: '/inventory/staff',
        element: <DashboardLayout />,
        children: [
          { path: '/inventory/staff', element: <Staff /> }
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