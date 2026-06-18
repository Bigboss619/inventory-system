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
const History = lazy(() => import('./pages/History'));
const VehicleRecords = lazy(() => import('./pages/VehicleRecords'));
const BulkUpload = lazy(() => import('./pages/BulkUpload'));
const DocumentReminder = lazy(() => import('./pages/DocumentReminder'));
const MaintenanceTracker = lazy(() => import('./pages/MaintenanceTracker'));
const VehicleDocuments = lazy(() => import('./pages/VehicleDocuments'));
const AllDocuments = lazy(() => import('./pages/AllDocuments'));

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
      },
      {
        path: '/inventory/history',
        element: <DashboardLayout />,
        children: [
          { path: '/inventory/history', element: <History /> }
        ]
      },
      {
        path: '/documents/vehicles',
        element: <DashboardLayout />,
        children: [
          { path: '/documents/vehicles', element: <VehicleRecords /> }
        ]
      },
      {
        path: '/documents/vehicles/:vehicleId/documents',
        element: <DashboardLayout />,
        children: [
          { path: '/documents/vehicles/:vehicleId/documents', element: <VehicleDocuments /> }
        ]
      },
      {
        path: '/documents/upload',
        element: <DashboardLayout />,
        children: [
          { path: '/documents/upload', element: <BulkUpload /> }
        ]
      },
      {
        path: '/documents/reminders',
        element: <DashboardLayout />,
        children: [
          { path: '/documents/reminders', element: <DocumentReminder /> }
        ]
      },
      {
        path: '/documents/maintenance',
        element: <DashboardLayout />,
        children: [
          { path: '/documents/maintenance', element: <MaintenanceTracker /> }
        ]
      },
      {
        path: '/documents/all',
        element: <DashboardLayout />,
        children: [
          { path: '/documents/all', element: <AllDocuments /> }
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