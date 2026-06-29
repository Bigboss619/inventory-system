import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorBoundary from './context/ErrorHandle/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
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
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const InventoryReport = lazy(() => import('./pages/InventoryReport'));
const DocumentReport = lazy(() => import('./pages/DocumentReport'));
const Users = lazy(() => import('./pages/Users'));
const Boardroom = lazy(() => import('./pages/Boardroom'));
const BoardroomAdmin = lazy(() => import('./pages/BoardroomAdmin'));
const ApprovedBookings = lazy(() => import('./pages/ApprovedBookings'));

// Layout
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const ProtectedRoute = lazy(() => import('./components/routes/ProtectedRoute'));


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/boardroom', element: <Boardroom /> },
      {
        path: '/dashboard',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/dashboard', element: <Dashboard /> }
        ]
      },
      {
        path: '/inventory/categories',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/inventory/categories', element: <Categories /> }
        ]
      },
      {
        path: '/inventory/items',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/inventory/items', element: <Items /> }
        ]
      },
      {
        path: '/inventory/stock-in',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/inventory/stock-in', element: <StockIn /> }
        ]
      },
      {
        path: '/inventory/stock-out',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/inventory/stock-out', element: <StockOut /> }
        ]
      },
      {
        path: '/inventory/staff',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/inventory/staff', element: <Staff /> }
        ]
      },
      {
        path: '/inventory/history',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/inventory/history', element: <History /> }
        ]
      },
      {
        path: '/documents/vehicles',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/documents/vehicles', element: <VehicleRecords /> }
        ]
      },
      {
        path: '/documents/vehicles/:vehicleId/documents',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/documents/vehicles/:vehicleId/documents', element: <VehicleDocuments /> }
        ]
      },
      {
        path: '/documents/upload',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/documents/upload', element: <BulkUpload /> }
        ]
      },
      {
        path: '/documents/reminders',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/documents/reminders', element: <DocumentReminder /> }
        ]
      },
      {
        path: '/documents/maintenance',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/documents/maintenance', element: <MaintenanceTracker /> }
        ]
      },
      {
        path: '/documents/all',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/documents/all', element: <AllDocuments /> }
        ]
      },
      {
        path: '/profile',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/profile', element: <Profile /> }
        ]
      },
      {
        path: '/settings',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/settings', element: <Settings /> }
        ]
      },
      {
        path: '/reports/inventory',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/reports/inventory', element: <InventoryReport /> }
        ]
      },
      {
        path: '/reports/documents',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/reports/documents', element: <DocumentReport /> }
        ]
      },
      {
        path: '/users',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/users', element: <Users /> }
        ]
      },
      {
        path: '/admin/boardroom',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/admin/boardroom', element: <BoardroomAdmin /> }
        ]
      },
      {
        path: '/approved-bookings',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { path: '/approved-bookings', element: <ApprovedBookings /> }
        ]
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)