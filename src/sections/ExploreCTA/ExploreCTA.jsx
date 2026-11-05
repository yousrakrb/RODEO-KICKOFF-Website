// src/sections/ExploreCTA/ExploreCTA.jsx
import FloatingElement from '../../components/FloatingElement/FloatingElement';
import './ExploreCTA.css';

const BOOKLET_DRIVE_URL = 'https://drive.google.com/file/d/1kI992Mr5_cXzFj17rt3ShfQ-YLyKqCQo/view?fbclid=IwY2xjawVZ4sJleHRuA2FlbQIxMABwZG9mAXNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR9bzCCweTM_fUJJOnRBXCKoKWggMeNM00_v3weLfta1hO3_H25OZefpU-dDYw_aem_Qd0xKUWwU-BlrEP5ZnrWcQ&pli=1';

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