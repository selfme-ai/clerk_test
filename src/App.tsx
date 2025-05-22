import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth, useUser, useSignIn, useSignUp, SignIn as ClerkSignIn, SignUp as ClerkSignUp } from '@clerk/clerk-react';
import './App.css';

function Home() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  const handleSignOut = () => {
    window.location.href = '/sign-in';
  };

  return (
    <div className="app">
      <h1>Welcome to Clerk Auth Demo</h1>
      <div className="card">
        {isSignedIn ? (
          <div className="authenticated-view">
            <h2>Welcome, {user?.fullName || user?.primaryEmailAddress?.emailAddress}!</h2>
            <p>This is a protected page that only authenticated users can see.</p>
            <button onClick={handleSignOut} className="button">Sign Out</button>
          </div>
        ) : (
          <div className="unauthenticated-view">
            <h2>Please sign in to continue</h2>
            <div className="auth-buttons">
              <Link to="/sign-in" className="button">Sign In</Link>
              <Link to="/sign-up" className="button">Create Account</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom component to handle verification state
function useVerificationHandler() {
  const { isLoaded: isSignInLoaded } = useSignIn();
  const { isLoaded: isSignUpLoaded } = useSignUp();
  const isLoaded = isSignInLoaded && isSignUpLoaded;
  
  React.useEffect(() => {
    if (!isLoaded) return;
    
    // Clean up any verification-related URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const hasVerificationParam = [
      '__clerk_created_session',
      '__clerk_status',
      '__clerk_modal_state'
    ].some(param => searchParams.has(param));
    
    if (hasVerificationParam) {
      // Remove all Clerk-related params
      ['__clerk_created_session', '__clerk_status', '__clerk_modal_state'].forEach(
        param => searchParams.delete(param)
      );
      
      const newUrl = searchParams.toString() 
        ? `${window.location.pathname}?${searchParams.toString()}`
        : window.location.pathname;
      
      // Use replaceState to prevent adding to browser history
      window.history.replaceState({}, '', newUrl);
      
      // Force a hard reload to reset Clerk's internal state
      window.location.reload();
    }
  }, [isLoaded]);
  
  return isLoaded;
}

function SignInPage() {
  const isVerificationReady = useVerificationHandler();
  
  if (!isVerificationReady) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <ClerkSignIn 
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          forceRedirectUrl="/"
          afterSignInUrl="/"
          appearance={{
            elements: {
              formButtonPrimary: {
                backgroundColor: '#4f46e5',
                '&:hover': {
                  backgroundColor: '#4338ca'
                },
                width: '100%',
                padding: '0.625rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                textTransform: 'none'
              },
              footerActionLink: {
                color: '#4f46e5',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  const isVerificationReady = useVerificationHandler();
  
  if (!isVerificationReady) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <ClerkSignUp 
          path="/sign-up" 
          routing="path"
          signInUrl="/sign-in"
          redirectUrl="/"
          afterSignUpUrl="/"
          unsafeMetadata={{}}
          appearance={{
            elements: {
              formButtonPrimary: {
                backgroundColor: '#4f46e5',
                '&:hover': {
                  backgroundColor: '#4338ca'
                },
                width: '100%',
                padding: '0.625rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                textTransform: 'none'
              },
              footerActionLink: {
                color: '#4f46e5',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    window.location.href = '/sign-in';
    return null;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedPage>
          <Home />
        </ProtectedPage>
      } />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
