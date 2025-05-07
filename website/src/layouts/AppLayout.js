import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <LoadingOverlay />}
      {children}
    </>
  );
};

export default AppLayout;
