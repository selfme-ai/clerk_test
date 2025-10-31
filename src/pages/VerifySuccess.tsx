import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/clerk-react';

type Status = 'verifying' | 'success' | 'error';

export default function VerifySuccess() {
  const { handleEmailLinkVerification, setActive } = useClerk();
  const [status, setStatus] = useState<Status>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finalizeVerification = async () => {
      try {
        const result = await handleEmailLinkVerification?.({
          redirectUrl: window.location.href,
          redirectUrlComplete: `${window.location.origin}${window.location.pathname}`,
        });

        if (cancelled) {
          return;
        }

        const createdSessionId = (result as { createdSessionId?: string } | null)?.createdSessionId;

        if (createdSessionId) {
          await setActive?.({ session: createdSessionId });
          setDetail('Session activated. You may close this tab.');
        } else {
          setDetail('Verification completed. Return to the original tab to continue.');
        }

        setStatus('success');
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setStatus('error');
          setError(message || 'Verification failed');
        }
      } finally {
        if (!cancelled) {
          const cleanUrl = `${window.location.origin}${window.location.pathname}`;
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    };

    void finalizeVerification();

    return () => {
      cancelled = true;
    };
  }, [handleEmailLinkVerification, setActive]);

  const subtitle = status === 'success'
    ? detail ?? 'Verification complete. Return to the original tab.'
    : status === 'error'
      ? error ?? 'Verification failed'
      : 'Completing sign-in…';

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', color: '#111', padding: '2rem 3rem', borderRadius: 20, textAlign: 'center' }}>
        <h1>
          {status === 'verifying'
            ? 'Verifying…'
            : status === 'success'
              ? 'Successfully signed in'
              : 'Verification error'}
        </h1>
        <p style={{ color: '#666' }}>{subtitle}</p>
      </div>
    </div>
  );
}
