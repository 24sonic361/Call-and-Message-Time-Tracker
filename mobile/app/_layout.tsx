// app/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

export default function RootLayoutWrapper() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}

function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { authorized } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (segments.length > 0) {
      setReady(true);
    }
  }, [segments]);

  useEffect(() => {
    const currentRoute = segments[0];
    const isPincodePage = currentRoute === 'pincode';

    if (ready && !authorized && !isPincodePage) {
      router.replace('/pincode');
    }
  }, [ready, authorized, segments]);

  return <Slot />;
}
