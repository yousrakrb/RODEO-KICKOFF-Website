// src/sections/ExploreCTA/ExploreCTA.jsx
import FloatingElement from '../../components/FloatingElement/FloatingElement';
import './ExploreCTA.css';

const BOOKLET_DRIVE_URL = '[INSERT YOUR GOOGLE DRIVE BOOKLET LINK HERE]';

export default function ExploreCTA() {
    return (
        <div className="explore-cta-container">
            <FloatingElement hoverLift={12}>
                <a
                    href={BOOKLET_DRIVE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="explore-cta-link"
                    aria-label="Click to explore the Rodeo Kickoff booklet on Google Drive"
                >
                    <img
                        src="/assets/countdown/Click2explore.png"
                        alt="Click to Explore — Rodeo Kickoff"
                        className="explore-cta-image"
                    />
                </a>
            </FloatingElement>
        </div>
    );
}