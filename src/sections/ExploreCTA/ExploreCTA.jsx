// src/sections/ExploreCTA/ExploreCTA.jsx
import { useState } from 'react';
import FloatingElement from '../../components/FloatingElement/FloatingElement';
import BookletModal from '../../components/BookletModal/BookletModal';
import './ExploreCTA.css';

export default function ExploreCTA() {
    const [bookletOpen, setBookletOpen] = useState(false);

    return (
        <>
            <div className="explore-cta-container">
                <FloatingElement hoverLift={12}>
                    <button
                        type="button"
                        onClick={() => setBookletOpen(true)}
                        className="explore-cta-link"
                        aria-label="Click to explore the Rodeo Kickoff booklet"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                        <img
                            src="/assets/countdown/Click2explore.png"
                            alt="Click to Explore — Rodeo Kickoff"
                            className="explore-cta-image"
                        />
                    </button>
                </FloatingElement>
            </div>

            <BookletModal
                isOpen={bookletOpen}
                onClose={() => setBookletOpen(false)}
            />
        </>
    );
}