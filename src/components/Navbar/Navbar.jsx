// src/components/Navbar/Navbar.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BookletModal from '../BookletModal/BookletModal';
import './Navbar.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [bookletOpen, setBookletOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 900) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    const toggleMenu = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setIsOpen(false);
    }, []);

    const openBookletSelector = useCallback((e) => {
        e.preventDefault();
        closeMenu();
        setBookletOpen(true);
    }, [closeMenu]);

    const handleAnchorClick = useCallback((e, targetId) => {
        closeMenu();

        if (location.pathname !== '/') {
            e.preventDefault();
            navigate('/' + targetId);
            return;
        }

        e.preventDefault();
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            if (window.lenis) {
                window.lenis.scrollTo(targetElement, {
                    offset: -80,
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                });
            } else {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [closeMenu, location.pathname, navigate]);

    return (
        <>
            <header className={`site-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    {/* Left: Brand Logo */}
                    <a
                        href="/#hero"
                        onClick={(e) => handleAnchorClick(e, '#hero')}
                        className="navbar-logo"
                        aria-label="Rodeo Kickoff Home"
                    >
                        <img
                            src="/assets/Footer/RODEO LOGO.png"
                            alt="RODEO KICKOFF"
                            className="navbar-logo-img"
                        />
                    </a>

                    {/* Center: Desktop Navigation Links */}
                    <nav className="navbar-desktop-nav" aria-label="Main Navigation">
                        <ul className="navbar-desktop-links">
                            <li>
                                <a
                                    href="/#canyon-map"
                                    onClick={(e) => handleAnchorClick(e, '#canyon-map')}
                                    className="desktop-nav-link"
                                >
                                    THE CANYON
                                </a>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={openBookletSelector}
                                    className="desktop-nav-link"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Explore RODEO
                                </button>
                            </li>
                            <li>
                                <Link
                                    to="/preorder"
                                    onClick={closeMenu}
                                    className="desktop-nav-link"
                                >
                                    THE GEAR
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Right: Apply Image + Hamburger Button */}
                    <div className="navbar-actions">
                        <Link
                            to="/apply"
                            className="navbar-apply"
                            aria-label="Apply now for Rodeo Kickoff"
                            onClick={closeMenu}
                        >
                            <img
                                src="/assets/Apply now.png"
                                alt="Apply now"
                                className="navbar-apply-img"
                            />
                        </Link>

                        <button
                            type="button"
                            className={`navbar-hamburger ${isOpen ? 'active' : ''}`}
                            onClick={toggleMenu}
                            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={isOpen}
                            aria-controls="mobile-overlay-menu"
                        >
                            <span className="hamburger-box">
                                <span className="hamburger-line line-1" />
                                <span className="hamburger-line line-2" />
                                <span className="hamburger-line line-3" />
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Full-Screen Overlay Menu */}
            <div
                id="mobile-overlay-menu"
                className={`navbar-overlay ${isOpen ? 'open' : ''}`}
                aria-hidden={!isOpen}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation Menu"
            >
                <div className="overlay-backdrop" onClick={closeMenu} />
                <div className="overlay-scroll-container">
                    <div className="overlay-content">
                        <div className="overlay-header">
                            <a
                                href="/#hero"
                                onClick={(e) => handleAnchorClick(e, '#hero')}
                                className="overlay-logo"
                                aria-label="Rodeo Kickoff Home"
                            >
                                <img
                                    src="/assets/Footer/RODEO LOGO.png"
                                    alt="RODEO KICKOFF"
                                    className="overlay-logo-img"
                                />
                            </a>
                            <button
                                type="button"
                                className="overlay-close-btn"
                                onClick={closeMenu}
                                aria-label="Close menu"
                            >
                                <svg
                                    width="26"
                                    height="26"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="overlay-body">
                            <nav className="overlay-nav" aria-label="Mobile Navigation">
                                <ul className="overlay-links">
                                    <li>
                                        <a
                                            href="/#canyon-map"
                                            onClick={(e) => handleAnchorClick(e, '#canyon-map')}
                                            className="overlay-link"
                                        >
                                            <span className="overlay-link-num">01</span>
                                            <span className="overlay-link-text">THE CANYON</span>
                                        </a>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={openBookletSelector}
                                            className="overlay-link"
                                            style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                        >
                                            <span className="overlay-link-num">02</span>
                                            <span className="overlay-link-text">EXPLORE RODEO</span>
                                        </button>
                                    </li>
                                    <li>
                                        <Link
                                            to="/preorder"
                                            onClick={closeMenu}
                                            className="overlay-link"
                                        >
                                            <span className="overlay-link-num">03</span>
                                            <span className="overlay-link-text">THE GEAR</span>
                                        </Link>
                                    </li>
                                </ul>
                            </nav>

                            <div className="overlay-apply-section">
                                <Link
                                    to="/apply"
                                    onClick={closeMenu}
                                    className="overlay-apply-link"
                                    aria-label="Apply Now for Rodeo Kickoff"
                                >
                                    <img
                                        src="/assets/Apply now.png"
                                        alt="Apply now"
                                        className="overlay-apply-img"
                                    />
                                </Link>
                            </div>
                        </div>

                        <div className="overlay-footer">
                            <div className="overlay-badge">DZ-25 · 27–28 NOV · EAST</div>
                            <p className="overlay-credit">AIESEC IN CONSTANTINE</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Local Sheriff / Stranger in Town Booklet Selector Modal */}
            <BookletModal isOpen={bookletOpen} onClose={() => setBookletOpen(false)} />
        </>
    );
}