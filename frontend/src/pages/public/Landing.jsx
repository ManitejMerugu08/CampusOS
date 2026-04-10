import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Bot, Ticket, Users, Smartphone, MessageCircle, 
    Bell, ArrowRight, CheckCircle2, Shield, Zap, BookOpen 
} from 'lucide-react';
import heroImage from '../../assets/images/hero_illustration.png';
import dashboardImage from '../../assets/images/dashboard_mockup.png';
import './Landing.css';

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
                <div className="logo-text">Campus<span className="text-primary">OS</span></div>
                <div className="nav-links">
                    <Link to="/login" className="btn btn-ghost font-semibold">Login</Link>
                    <Link to="/register" className="btn btn-primary shadow-glow">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="hero-section">
                <div className="hero-content animate-fade-in-up">
                    <div className="hero-badge mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-semibold">
                        <Zap size={14} /> <span>Now with AI Assistant v2.0</span>
                    </div>
                    <h1 className="hero-title">
                        CampusOS – <br />
                        <span className="text-gradient">AI Powered</span> <br />
                        University Operating System
                    </h1>
                    <p className="hero-subtitle delay-200 animate-fade-in-up">
                        Unify your campus experience. From smart canteen ordering to intelligent ticket resolution, CampusOS empowers students, faculty, and administrators with a seamless digital platform.
                    </p>
                    <div className="hero-actions delay-300 animate-fade-in-up flex gap-4 mt-8">
                        <Link to="/register" className="btn btn-primary btn-lg shadow-glow hover-lift">
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg hover-lift">
                            View Demo
                        </Link>
                    </div>
                    
                    <div className="hero-stats flex gap-8 mt-12 delay-400 animate-fade-in-up text-sm">
                        <div className="stat">
                            <span className="text-2xl font-bold text-main block">10k+</span>
                            <span className="text-muted">Active Students</span>
                        </div>
                        <div className="stat">
                            <span className="text-2xl font-bold text-main block">99.9%</span>
                            <span className="text-muted">System Uptime</span>
                        </div>
                        <div className="stat">
                            <span className="text-2xl font-bold text-main block">4.9/5</span>
                            <span className="text-muted">User Rating</span>
                        </div>
                    </div>
                </div>
                <div className="hero-image-wrapper animate-fade-in-up delay-200">
                    <img src={heroImage} alt="Smart Campus Illustration" className="hero-img hover-lift" />
                </div>
            </main>

            {/* Product Preview Section */}
            <section className="product-preview-section">
                <div className="section-header text-center mb-12">
                    <h2 className="section-title">Experience the Future of Campus Management</h2>
                    <p className="section-subtitle">Everything you need in one beautiful, intuitive dashboard.</p>
                </div>
                <div className="device-mockup">
                    <div className="laptop-frame">
                        <img src={dashboardImage} alt="CampusOS Dashboard Mockup" className="dashboard-img" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section bg-gradient-mesh">
                <div className="section-header text-center mb-16">
                    <h2 className="section-title">Powerful Features</h2>
                    <p className="section-subtitle">Designed specifically for modern educational institutions.</p>
                </div>
                
                <div className="features-grid">
                    {/* Feature 1 */}
                    <div className="feature-card glass-card hover-lift">
                        <div className="feature-icon bg-primary-light text-primary">
                            <Bot size={28} />
                        </div>
                        <h3 className="feature-title">AI Campus Assistant</h3>
                        <p className="feature-desc">Get instant answers to campus queries, schedule appointments, and find resources with our intelligent chatbot.</p>
                    </div>
                    {/* Feature 2 */}
                    <div className="feature-card glass-card hover-lift">
                        <div className="feature-icon bg-warning-bg text-warning">
                            <Ticket size={28} />
                        </div>
                        <h3 className="feature-title">Smart Ticket System</h3>
                        <p className="feature-desc">Efficiently route and resolve maintenance, IT, and administrative requests with automated workflows.</p>
                    </div>
                    {/* Feature 3 */}
                    <div className="feature-card glass-card hover-lift">
                        <div className="feature-icon bg-info-bg text-info">
                            <Users size={28} />
                        </div>
                        <h3 className="feature-title">Student Directory</h3>
                        <p className="feature-desc">Connect with peers and faculty through a comprehensive, searchable digital directory.</p>
                    </div>
                    {/* Feature 4 */}
                    <div className="feature-card glass-card hover-lift">
                        <div className="feature-icon bg-success-bg text-success">
                            <Smartphone size={28} />
                        </div>
                        <h3 className="feature-title">Smart Canteen Ordering</h3>
                        <p className="feature-desc">Skip the lines. Order meals ahead of time and pay securely with your digital campus wallet.</p>
                    </div>
                    {/* Feature 5 */}
                    <div className="feature-card glass-card hover-lift">
                        <div className="feature-icon bg-success-bg text-success">
                            <MessageCircle size={28} />
                        </div>
                        <h3 className="feature-title">WhatsApp Integration</h3>
                        <p className="feature-desc">Receive important updates, alerts, and notifications directly to your WhatsApp.</p>
                    </div>
                    {/* Feature 6 */}
                    <div className="feature-card glass-card hover-lift">
                        <div className="feature-icon bg-danger-bg text-danger">
                            <Bell size={28} />
                        </div>
                        <h3 className="feature-title">Real-Time Notifications</h3>
                        <p className="feature-desc">Stay informed with instant push notifications for classes, events, and campus emergencies.</p>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="use-cases-section">
                <div className="use-case-row">
                    <div className="use-case-content">
                        <div className="icon-badge text-primary bg-primary-light mb-4 inline-block p-3 rounded-2xl">
                            <BookOpen size={32} />
                        </div>
                        <h2 className="section-title text-left">For Students</h2>
                        <p className="use-case-desc">Manage your academic life effortlessly. Pay fees, order food, raise maintenance tickets, and get AI assistance for your coursework—all from your smartphone.</p>
                        <ul className="use-case-list space-y-3 mt-6">
                            <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20}/> <span>Unified digital ID and wallet</span></li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20}/> <span>Instant AI academic support</span></li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20}/> <span>Real-time class updates</span></li>
                        </ul>
                    </div>
                    <div className="use-case-visual glass-panel flex items-center justify-center p-8 min-h-[300px]">
                         {/* Fallback visual for student */}
                         <div className="text-center">
                            <Users size={64} className="text-primary opacity-50 mb-4 mx-auto" />
                            <h3 className="text-xl font-bold text-main">Student Portal</h3>
                            <p className="text-muted mt-2">Empowering the next generation</p>
                         </div>
                    </div>
                </div>
                
                <div className="use-case-row reverse mt-24">
                    <div className="use-case-visual glass-panel flex items-center justify-center p-8 min-h-[300px]">
                         {/* Fallback visual for Admin */}
                         <div className="text-center">
                            <Shield size={64} className="text-success opacity-50 mb-4 mx-auto" />
                            <h3 className="text-xl font-bold text-main">Admin Console</h3>
                            <p className="text-muted mt-2">Complete operational control</p>
                         </div>
                    </div>
                    <div className="use-case-content">
                        <div className="icon-badge text-success bg-success-bg mb-4 inline-block p-3 rounded-2xl">
                            <Shield size={32} />
                        </div>
                        <h2 className="section-title text-left">For Administrators</h2>
                        <p className="use-case-desc">Gain total visibility into campus operations. Resolve tickets faster, manage canteen inventory, and analyze system-wide data with powerful reporting tools.</p>
                        <ul className="use-case-list space-y-3 mt-6">
                            <li className="flex items-center gap-3"><CheckCircle2 className="text-success" size={20}/> <span>Centralized dashboard</span></li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="text-success" size={20}/> <span>Automated ticket routing</span></li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="text-success" size={20}/> <span>Advanced analytics & reporting</span></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section bg-gradient-primary text-white text-center">
                <div className="cta-content max-w-3xl mx-auto py-16 px-6">
                    <h2 className="text-4xl font-bold mb-6 text-white" style={{background: 'none', WebkitTextFillColor: 'white'}}>Ready to upgrade your campus?</h2>
                    <p className="text-xl mb-10 opacity-90">Join leading universities that are transforming their student experience with CampusOS.</p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register" className="btn bg-white text-primary hover:bg-gray-50 btn-lg shadow-lg font-bold">
                            Get Started Now
                        </Link>
                        <Link to="/contact" className="btn btn-outline border-white text-white hover:bg-white/10 btn-lg">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo-text mb-4">Campus<span className="text-primary">OS</span></div>
                        <p className="text-muted mb-6 max-w-xs">The premier operating system for modern universities and educational institutions.</p>
                        <div className="social-links flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-surface-color flex items-center justify-center text-muted hover:text-primary transition-colors hover-lift"><Bot size={20} /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-surface-color flex items-center justify-center text-muted hover:text-primary transition-colors hover-lift"><MessageCircle size={20} /></a>
                        </div>
                    </div>
                    <div className="footer-links-grid">
                        <div className="footer-col">
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-3 text-muted">
                                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4 className="font-bold mb-4">Solutions</h4>
                            <ul className="space-y-3 text-muted">
                                <li><a href="#" className="hover:text-primary transition-colors">For Students</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">For Faculty</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">For Administration</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-3 text-muted">
                                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom mt-16 pt-8 border-t border-border-color text-center text-muted text-sm">
                    <p>&copy; {new Date().getFullYear()} CampusOS. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
