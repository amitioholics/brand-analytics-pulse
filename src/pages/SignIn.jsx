import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PulseLogo from '../components/common/PulseLogo';
import './SignIn.css';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('brand.partner@myntra.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      login(email, password);
      setIsLoading(false);
      navigate('/');
    }, 500);
  };

  const handleQuickDemo = () => {
    setEmail('brand.partner@myntra.com');
    setPassword('myntra-brand-2026');
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      login('brand.partner@myntra.com', 'myntra-brand-2026');
      setIsLoading(false);
      navigate('/');
    }, 450);
  };

  return (
    <div className="signin-page">
      <div className="signin-page__glow signin-page__glow--top" />
      <div className="signin-page__glow signin-page__glow--bottom" />

      <div className="signin-card">
        {/* Logo & Header */}
        <div className="signin-card__brand">
          <Link to="/" className="signin-card__logo-link" title="Pulse">
            <PulseLogo size="lg" />
          </Link>
          <h1 className="signin-card__title">Sign In</h1>
          <p className="signin-card__subtitle">
            Enter your credentials to access Pulse
          </p>
        </div>

        {/* 1-Click Quick Demo Login */}
        <button
          type="button"
          className="signin-card__demo-btn"
          onClick={handleQuickDemo}
          disabled={isLoading}
        >
          <Sparkles size={16} color="#6538ea" />
          <span>Quick Demo Access (Myntra Partner)</span>
          <ArrowRight size={15} />
        </button>

        <div className="signin-card__divider">
          <span>or sign in with email</span>
        </div>

        {error && (
          <div className="signin-card__error">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="signin-form__group">
            <label className="signin-form__label" htmlFor="signin-email">
              Work Email
            </label>
            <div className="signin-form__input-wrap">
              <Mail size={17} className="signin-form__input-icon" />
              <input
                id="signin-email"
                type="email"
                className="signin-form__input"
                placeholder="name@brand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="signin-form__group">
            <div className="signin-form__label-row">
              <label className="signin-form__label" htmlFor="signin-password">
                Password
              </label>
              <a
                href="#forgot"
                onClick={(e) => { e.preventDefault(); alert('For testing, please use the Quick Demo Access button above.'); }}
                className="signin-form__forgot"
              >
                Forgot password?
              </a>
            </div>
            <div className="signin-form__input-wrap">
              <Lock size={17} className="signin-form__input-icon" />
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                className="signin-form__input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="signin-form__toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="signin-form__options">
            <label className="signin-form__checkbox-label">
              <input
                type="checkbox"
                className="signin-form__checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            className="signin-form__submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="signin-form__spinner" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="signin-card__footer">
          <ShieldCheck size={14} color="#6538ea" />
          <span>Protected by Pulse Enterprise Security</span>
        </div>
      </div>
    </div>
  );
}
