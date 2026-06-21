import { useAuth } from '../AuthContext';

export default function TimeoutWarning() {
  const { showTimeoutWarning, countdown, stayLoggedIn, logout } = useAuth();

  if (!showTimeoutWarning) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            style={{ margin: '0 auto 16px' }}
          >
            <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2" />
            <path
              d="M12 6v6l4 2"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            Session Expiring Soon
          </h2>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '15px',
            lineHeight: '1.5'
          }}>
            Your session will expire in <strong style={{ color: '#f59e0b', fontSize: '18px' }}>{timeDisplay}</strong> due to inactivity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={logout}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#6b7280',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Logout Now
          </button>
          <button
            onClick={stayLoggedIn}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}