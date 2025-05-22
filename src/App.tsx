import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth, useUser, useSignIn, SignIn as ClerkSignIn, SignUp as ClerkSignUp } from '@clerk/clerk-react';
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

function SignInPage() {
  const { isLoaded } = useSignIn();
  
  // This effect prevents the duplicate code issue in Chrome
  React.useEffect(() => {
    if (!isLoaded) return;
    
    // This is a workaround for the duplicate code issue
    // It ensures the verification flow is only started once
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('__clerk_created_session')) {
      searchParams.delete('__clerk_created_session');
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [isLoaded]);

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
