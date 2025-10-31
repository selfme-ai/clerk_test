import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth, useSignIn, useSignUp, useClerk } from '@clerk/clerk-react';

const SYNC_POLL_INTERVAL_MS = 1500;

export default function HeadlessMagic() {
  const { isSignedIn, getToken } = useAuth();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { handleEmailLinkVerification, redirectWithAuth } = useClerk();

  const [email, setEmail] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const visibilitySyncTriggered = useRef(false);
  const processedRef = useRef(false);

  const add = useCallback((message: string) => {
    setLog(prev => [...prev, message]);
  }, []);

  useEffect(() => {
    const hasClerkParam = location.search.includes('__clerk_status') || location.hash.includes('__clerk_status');
    if (!hasClerkParam || processedRef.current) return;
    processedRef.current = true;
    (async () => {
      try {
        const result = await handleEmailLinkVerification?.({
          redirectUrl: window.location.href,
          redirectUrlComplete: `${window.location.origin}${window.location.pathname}`,
        });
        add('[Headless] handleEmailLinkVerification completed');
        if ((result as { createdSessionId?: string } | null)?.createdSessionId) {
          setHasSynced(true);
        }
        const clean = `${window.location.origin}${window.location.pathname}`;
        history.replaceState({}, '', clean);
      } catch (e: any) {
        add(`[Headless] handleEmailLinkVerification error: ${String(e?.message || e)}`);
      }
    })();
  }, [add, handleEmailLinkVerification]);

  const requestLink = async () => {
    if (!email) return;
    setSending(true);
    setHasSynced(false);
    visibilitySyncTriggered.current = false;
    add(`[Headless] Sending magic link to ${email}`);
    try {
      await signIn?.create({
        identifier: email,
        strategy: 'email_link',
        redirectUrl: `${window.location.origin}/verify-success`,
      });
      add('[Headless] signIn.create OK');
    } catch (err: any) {
      if (err?.errors?.[0]?.code === 'form_identifier_not_found') {
        add('[Headless] signIn email not found, attempting signUp');
        try {
          await signUp?.create({ emailAddress: email });
          await signUp?.prepareEmailAddressVerification({
            strategy: 'email_link',
            redirectUrl: `${window.location.origin}/verify-success`,
          });
          add('[Headless] signUp.prepareEmailAddressVerification OK');
        } catch (e: any) {
          add(`[Headless] signUp error: ${String(e?.message || e)}`);
        }
      } else {
        add(`[Headless] signIn error: ${String(err?.message || err)}`);
      }
    } finally {
      setSending(false);
    }
  };

  const tryToken = async () => {
    try {
      const token = await getToken();
      add(`[Headless] getToken: ${token ? 'OK' : 'null'}`);
    } catch (e: any) {
      add(`[Headless] getToken error: ${String(e?.message || e)}`);
    }
  };

  const triggerSync = useCallback(async (reason: string) => {
    if (hasSynced) {
      add(`[Headless] sync skipped (${reason})`);
      return;
    }

    try {
      add(`[Headless] sync via redirectWithAuth (${reason})`);
      await redirectWithAuth?.(window.location.href);
      setHasSynced(true);
    } catch (err: any) {
      add(`[Headless] sync error: ${String(err?.message || err)}`);
    }
  }, [add, hasSynced, redirectWithAuth]);

  useEffect(() => {
    if (isSignedIn) {
      setHasSynced(true);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (hasSynced) {
      return;
    }

    let cancelled = false;
    const interval = window.setInterval(async () => {
      if (cancelled) {
        return;
      }
      try {
        const token = await getToken();
        if (token) {
          add('[Headless] token detected via poll');
          setHasSynced(true);
          window.clearInterval(interval);
        }
      } catch {
        // ignore
      }
    }, SYNC_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [add, getToken, hasSynced]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !visibilitySyncTriggered.current) {
        visibilitySyncTriggered.current = true;
        void triggerSync('visibility');
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [triggerSync]);

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Headless Magic Link</h1>
      <p>Minimal headless email-link demo. Redirect target is <code>/verify-success</code>.</p>

      <div style={{ marginTop: 12 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ padding: 8, width: '100%', maxWidth: 360 }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={requestLink} disabled={sending} style={{ padding: '8px 12px' }}>
          {sending ? 'Sending…' : 'Send magic link'}
        </button>
        <button onClick={tryToken} style={{ padding: '8px 12px', marginLeft: 8 }}>getToken()</button>
        <button
          onClick={() => triggerSync('manual')}
          style={{ padding: '8px 12px', marginLeft: 8 }}
        >
          Sync now
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Log</h3>
        <ul>
          {log.map((l, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
