import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Activity, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
  const navigate = useNavigate();
  const { register: registerUser, verifyOtp: verifyOtpContext, resendOtp: resendOtpContext } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // ── NEW OTP STATE ──────────────────────────────────────────
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  // ──────────────────────────────────────────────────────────

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // reset OTP if email changes
    if (e.target.name === 'email') {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpValues(['', '', '', '', '', '']);
    }
  };

  // ── NEW: Send OTP ──────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first");
      return;
    }
    
    if (!formData.name || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields first");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setOtpLoading(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "patient"
      });
      setOtpSent(true);
      toast.success("OTP sent to your email!");
      startResendTimer();
    } catch (error) {
      toast.error(error?.message || "Failed to register. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── NEW: Resend countdown timer ────────────────────────────
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── NEW: OTP box input handler (auto-focus next box) ───────
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return; // numbers only
    const updated = [...otpValues];
    updated[index] = value;
    setOtpValues(updated);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // ── NEW: Verify OTP ────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const otp = otpValues.join('');
    if (otp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    try {
      await verifyOtpContext(formData.email, otp);
      setOtpVerified(true);
      toast.success("Email verified successfully!");
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(error?.message || "Invalid OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── NEW: Resend OTP handler ────────────────────────────────
  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      await resendOtpContext(formData.email);
      toast.success("OTP resent to your email!");
      startResendTimer();
      setOtpValues(['', '', '', '', '', '']); // Reset OTP inputs
    } catch (error) {
      toast.error(error?.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };
  // ──────────────────────────────────────────────────────────

  // ── ORIGINAL: Submit (unchanged, just added otpVerified check) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error("Please verify your email first");
      return;
    }
    // User already registered during sendOtp, just redirect
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* ── ORIGINAL: Logo header (unchanged) ── */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">CarePoint</h1>
              <p className="text-sm text-slate-600">Healthcare ERP</p>
            </div>
          </div>

          {/* ── ORIGINAL: Page title (unchanged) ── */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Account</h2>
            <p className="text-slate-600">Get started with CarePoint</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── ORIGINAL: Full Name (unchanged) ── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={otpSent}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* ── MODIFIED: Email field + Send OTP button ── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
                {otpVerified && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
                {otpSent && !otpVerified && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    OTP Sent
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="yourname@gmail.com"
                    disabled={otpVerified || otpSent}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    required
                  />
                </div>
                {!otpVerified && (
                  <button
                    type="button"
                    onClick={otpSent ? handleResendOtp : handleSendOtp}
                    disabled={otpLoading || resendTimer > 0}
                    className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {otpLoading ? "Sending..." : resendTimer > 0 ? `Resend (${resendTimer}s)` : otpSent ? "Resend" : "Send OTP"}
                  </button>
                )}
              </div>
            </div>

            {/* ── NEW: OTP input boxes (shown after OTP sent) ── */}
            {otpSent && !otpVerified && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-600 text-center mb-3">
                  Enter the 6-digit code sent to <span className="font-semibold text-slate-800">{formData.email}</span>
                </p>
                <div className="flex gap-2 justify-center mb-3">
                  {otpValues.map((val, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-11 h-12 text-center text-xl font-bold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}

            {/* ── ORIGINAL: Password (unchanged) ── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={otpSent}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* ── ORIGINAL: Confirm Password (unchanged) ── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={otpSent}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* ── ORIGINAL: Submit button (disabled until verified) ── */}
            <button
              type="submit"
              disabled={!otpVerified}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* ── ORIGINAL: Login link (unchanged) ── */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Login Here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;
