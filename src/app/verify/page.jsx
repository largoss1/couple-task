"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import "@/styles/auth.css";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push("/register");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setSuccess("Email verified successfully! Redirecting...");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setSuccess("Verification code sent! Check your email.");
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card verify-card">
        <div className="verify-icon">
          <Mail size={32} />
        </div>

        <div className="auth-header">
          <h2 className="auth-title">Verify Your Email</h2>
          <p className="auth-subtitle">We sent a verification code to</p>
          <p className="verify-email">{email}</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleVerify} className="auth-form">
          <div className="form-group">
            <label className="form-label">Verification Code</label>
            <input
              type="text"
              className="form-input code-input"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              placeholder="000000"
              required
              autoFocus
            />
            <small className="form-hint">
              Enter the 6-digit code from your email
            </small>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="verify-actions">
          <p className="resend-text">Didn't receive the code?</p>
          <button
            type="button"
            className="btn-link"
            onClick={handleResendCode}
            disabled={resending || countdown > 0}
          >
            {resending
              ? "Sending..."
              : countdown > 0
              ? `Resend in ${countdown}s`
              : "Resend Code"}
          </button>
        </div>

        <div className="verify-footer">
          <a href="/register" className="back-link">
            <ArrowLeft size={16} />
            Back to registration
          </a>
        </div>
      </div>
    </div>
  );
}
