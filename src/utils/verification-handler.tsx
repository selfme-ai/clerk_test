import { useClerk } from '@clerk/clerk-react';
import { useEffect, useRef, useState } from 'react';

export function useVerificationHandler() {
  const { loaded } = useClerk();
  const verificationHandled = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loaded || verificationHandled.current) return;

    const handleVerification = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hasVerificationParam = [
        '__clerk_created_session',
        '__clerk_status',
        '__clerk_modal_state'
      ].some(param => searchParams.has(param));

      if (hasVerificationParam) {
        // Mark as handled immediately
        verificationHandled.current = true;
        
        // Clean up the URL without causing a re-render
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
        
        // Use a short timeout to ensure Clerk has time to process the verification
        const timer = setTimeout(() => {
          setIsReady(true);
        }, 100);
        
        return () => clearTimeout(timer);
      } else {
        setIsReady(true);
      }
    };

    handleVerification();
  }, [loaded]);

  return isReady;
}
