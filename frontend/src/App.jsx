import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider/AuthProvider';
import PageLoader from './components/loader/PageLoader';
import TimeoutWarning from './context/TimeoutWarning/TimeoutWarning';
import Toast from './components/ui/Toast';


function App() {
  const [showLoader, setShowLoader] = useState(false)
  const location = useLocation();

  return (
    <>
      <AuthProvider>
        <Toast />
        {showLoader && <PageLoader />}
        <Outlet />
        <TimeoutWarning />
      </AuthProvider>


    </>
  )
}

export default App
