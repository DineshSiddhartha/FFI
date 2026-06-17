import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

export default function LoginScreen() {
  const { setAuthenticated, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Already logged in — send to home
  if (isAuthenticated) return <Navigate to="/" replace />;

  function handleLogin(e) {
    e.preventDefault();
    if (password.trim() === APP_PASSWORD) {
      setAuthenticated(true);
      navigate('/', { replace: true });
    } else {
      setError('Incorrect password. Please try again.');
      setShaking(true);
      setPassword('');
      setTimeout(() => setShaking(false), 600);
    }
  }

  return (
    <div className="app-shell" style={{
      background: 'linear-gradient(160deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '0',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(255,107,0,0.12) 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '400px',
        padding: '0 24px',
      }}>
        {/* Logo / Branding */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(255,107,0,0.4)',
          }}>
            ☀️
          </div>
          <h1 style={{
            fontSize: '28px', fontWeight: 800,
            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '6px',
          }}>
            SuryaQuote
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            Avion Green Astra Solar Energies<br />
            <span style={{ fontSize: '12px', opacity: 0.6 }}>Authorised Personnel Only</span>
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '32px 28px',
            backdropFilter: 'blur(12px)',
            animation: shaking ? 'shake 0.5s ease' : 'none',
          }}
        >
          <h2 style={{
            fontSize: '18px', fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: '6px',
          }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '28px' }}>
            Enter your company password to continue
          </p>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="login-password">
              Company Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                style={{
                  paddingRight: '48px',
                  borderColor: error ? 'var(--red)' : undefined,
                  fontSize: '16px',
                  letterSpacing: showPw ? 'normal' : '2px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '16px', opacity: 0.5,
                  color: 'var(--text-primary)', padding: '4px',
                }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {error && (
              <p className="form-error" style={{ marginTop: '8px', fontSize: '13px' }}>
                {error}
              </p>
            )}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn--primary btn--full btn--lg"
            disabled={!password}
            style={{ marginTop: '4px', fontSize: '16px', fontWeight: 700 }}
          >
            Sign In →
          </button>
        </form>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: '24px',
          color: 'var(--text-secondary)', fontSize: '11px', opacity: 0.5,
        }}>
          🔒 Restricted access · Avion Green Astra Solar Energies
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
