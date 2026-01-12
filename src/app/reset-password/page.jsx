"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Check, X, Lock } from "lucide-react";
import "@/styles/auth.css";

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false,
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password" || name === "confirmPassword") {
      validatePassword(
        name === "password" ? value : formData.password,
        name === "confirmPassword" ? value : formData.confirmPassword
      );
    }
  };

  const validatePassword = (password, confirmPassword) => {
    setValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      match: password === confirmPassword && password.length > 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!Object.values(validations).every((v) => v)) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code: formData.code,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    Object.values(validations).every((v) => v) &&
    formData.code.length === 6 &&
    formData.email;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="verify-icon">
          <Lock size={32} />
        </div>

        <div className="auth-header">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter the code and your new password</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            <Check size={16} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reset Code</label>
            <input
              type="text"
              name="code"
              className="form-input code-input"
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value.replace(/\D/g, "").slice(0, 6),
                })
              }
              maxLength={6}
              placeholder="000000"
              required
              disabled={loading}
            />
            <small className="form-hint">
              Enter the 6-digit code from your email
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {formData.password && (
            <div className="password-requirements">
              <p className="requirements-title">Password requirements:</p>
              <ValidationItem
                valid={validations.length}
                text="At least 8 characters"
              />
              <ValidationItem
                valid={validations.uppercase}
                text="One uppercase letter"
              />
              <ValidationItem
                valid={validations.lowercase}
                text="One lowercase letter"
              />
              <ValidationItem valid={validations.number} text="One number" />
              <ValidationItem
                valid={validations.match}
                text="Passwords match"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !isFormValid}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{" "}
            <a href="/login" className="auth-link">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function ValidationItem({ valid, text }) {
  return (
    <div className={`validation-item ${valid ? "valid" : ""}`}>
      {valid ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );
}
