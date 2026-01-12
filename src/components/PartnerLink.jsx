"use client";
import { useState, useEffect } from "react";
import { Users, Mail, Link as LinkIcon, Unlink, Check, X } from "lucide-react";
import "@/styles/partner.css";

export default function PartnerLink({ onPartnerLinked }) {
  const [partner, setPartner] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPartner();
  }, []);

  async function fetchPartner() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/partner/link", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.partner) {
        setPartner(data.partner);
        if (onPartnerLinked) onPartnerLinked(data.partner);
      }
    } catch (error) {
      console.error("Failed to fetch partner:", error);
    }
  }

  async function handleLinkPartner(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/partner/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ partnerEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to link partner");
      }

      setSuccess("Partner linked successfully!");
      setPartner(data.partner);
      setPartnerEmail("");
      setShowLinkModal(false);
      if (onPartnerLinked) onPartnerLinked(data.partner);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlinkPartner() {
    if (!confirm("Are you sure you want to unlink your partner?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/partner/link", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to unlink partner");

      setPartner(null);
      if (onPartnerLinked) onPartnerLinked(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="partner-section">
        {partner ? (
          <div className="partner-info">
            <div className="partner-avatar">
              {partner.avatarUrl ? (
                <img src={partner.avatarUrl} alt="Partner" />
              ) : (
                <Users size={16} />
              )}
            </div>
            <div className="partner-details">
              <div className="partner-label">Partner</div>
              <div className="partner-name">
                {partner.fullName || partner.email}
              </div>
            </div>
            <button
              className="partner-unlink-btn"
              onClick={handleUnlinkPartner}
              disabled={loading}
              title="Unlink partner"
            >
              <Unlink size={14} />
            </button>
          </div>
        ) : (
          <button
            className="partner-link-btn"
            onClick={() => setShowLinkModal(true)}
          >
            <Users size={16} />
            <span>Link Partner</span>
          </button>
        )}
      </div>

      {showLinkModal && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div
            className="modal-content partner-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Link with Partner</h3>
              <button
                className="modal-close"
                onClick={() => setShowLinkModal(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLinkPartner} className="modal-form">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} /> Partner's Email
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="partner@example.com"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
                <small className="form-hint">
                  Enter your partner's email to share tasks automatically
                </small>
              </div>

              <div className="partner-info-box">
                <LinkIcon size={18} />
                <div>
                  <strong>How it works:</strong>
                  <ul>
                    <li>All your tasks will be visible to your partner</li>
                    <li>You'll see all your partner's tasks</li>
                    <li>Both can edit and complete shared tasks</li>
                  </ul>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowLinkModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={loading || !partnerEmail.trim()}
                >
                  {loading ? "Linking..." : "Link Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
