"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  Users,
  Sparkles,
  ArrowRight,
  Heart,
  Clock,
  Bell,
  Zap,
} from "lucide-react";
import "@/styles/landing.css";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <nav className="navbar">
          <div className="navbar-content">
            <div className="logo">
              <Heart className="logo-icon" size={28} />
              <span className="logo-text">TogetherTask</span>
            </div>
            <div className="nav-buttons">
              <button
                className="btn-secondary"
                onClick={() => router.push("/login")}
              >
                Sign In
              </button>
              <button
                className="btn-primary"
                onClick={() => router.push("/register")}
              >
                Get Started
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>AI-Powered Task Management</span>
          </div>

          <h1 className="hero-title">
            Manage Your Schedule
            <span className="gradient-text"> Together</span>
          </h1>

          <p className="hero-description">
            The perfect task management app designed for couples. Share tasks,
            sync schedules, and stay organized together with AI assistance.
          </p>

          <div className="hero-buttons">
            <button
              className="btn-hero-primary"
              onClick={() => router.push("/register")}
            >
              Start For Free
              <ArrowRight size={20} />
            </button>
            <button
              className="btn-hero-secondary"
              onClick={() => router.push("/login")}
            >
              Sign In
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <Users size={20} />
              <span>Built for Couples</span>
            </div>
            <div className="stat-item">
              <Sparkles size={20} />
              <span>AI Assistant</span>
            </div>
            <div className="stat-item">
              <Calendar size={20} />
              <span>Smart Calendar</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card card-1">
            <CheckCircle size={16} className="card-icon" />
            <div>
              <div className="card-title">Buy groceries</div>
              <div className="card-subtitle">Tomorrow, 2:00 PM</div>
            </div>
          </div>
          <div className="floating-card card-2">
            <Heart size={16} className="card-icon" />
            <div>
              <div className="card-title">Date night</div>
              <div className="card-subtitle">Friday, 7:30 PM</div>
            </div>
          </div>
          <div className="floating-card card-3">
            <Bell size={16} className="card-icon" />
            <div>
              <div className="card-title">Call parents</div>
              <div className="card-subtitle">Today, 4:00 PM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-description">
            Powerful features to help you stay organized and connected
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Users size={24} />
            </div>
            <h3 className="feature-title">Partner Sharing</h3>
            <p className="feature-description">
              Link with your partner and automatically share all tasks. See what
              needs to be done together.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Sparkles size={24} />
            </div>
            <h3 className="feature-title">AI Assistant</h3>
            <p className="feature-description">
              Powered by Google Gemini 2.0. Create tasks with natural language
              and get smart suggestions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Calendar size={24} />
            </div>
            <h3 className="feature-title">Smart Calendar</h3>
            <p className="feature-description">
              Multiple views (Month, Week, Day, Agenda) to see your schedule the
              way you want.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Clock size={24} />
            </div>
            <h3 className="feature-title">Due Dates & Times</h3>
            <p className="feature-description">
              Set specific due dates and times. Get organized with priorities
              and custom lists.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={24} />
            </div>
            <h3 className="feature-title">Real-time Sync</h3>
            <p className="feature-description">
              Changes sync instantly. Edit and complete tasks together in
              real-time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <CheckCircle size={24} />
            </div>
            <h3 className="feature-title">Easy to Use</h3>
            <p className="feature-description">
              Clean, intuitive interface. Start managing your tasks in seconds,
              no learning curve.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Get Organized?</h2>
          <p className="cta-description">
            Join couples who are managing their lives better together
          </p>
          <button className="btn-cta" onClick={() => router.push("/register")}>
            Start Free Today
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="logo">
              <Heart className="logo-icon" size={24} />
              <span className="logo-text">TogetherTask</span>
            </div>
            <p className="footer-tagline">
              Task management designed for couples
            </p>
          </div>
          <div className="footer-links">
            <a href="/login" className="footer-link">
              Sign In
            </a>
            <a href="/register" className="footer-link">
              Get Started
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 TogetherTask. Made by Tulas.</p>
        </div>
      </footer>
    </div>
  );
}
