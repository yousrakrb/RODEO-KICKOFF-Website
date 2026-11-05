// src/sections/Campfire/Campfire.jsx
import FloatingElement from '../../components/FloatingElement/FloatingElement';
import './Campfire.css';

export default function Campfire() {
    return (
        <section className="campfire-section" id="campfire">
            <div className="campfire-container">
                {/* Header: Centered "The Campfire" + subtitle, with upper-right cards */}
                <div className="campfire-header">
                    <div className="campfire-heading-wrap">
                        <img
                            src="/assets/campfire/THEcamp.png"
                            alt="The Campfire - Every kickoff has memories, that become the campfire's subject!"
                            className="campfire-heading-img"
                        />
                    </div>
                    <div className="campfire-cards-wrap" aria-hidden="true">
                        <img
                            src="/assets/campfire/cards.png"
                            alt=""
                            className="campfire-cards-img"
                        />
                    </div>
                </div>

                {/* Main Content: Left Camera visual, Right Arrow + Memories CTA (wrapped in FloatingElement) */}
                <div className="campfire-content">
                    <div className="campfire-camera-col">
                        <FloatingElement hoverLift={8}>
                            <div className="campfire-camera">
                                <img
                                    src="/assets/campfire/Camera.png"
                                    alt="Vintage Fujica Camera"
                                    className="campfire-camera-img"
                                />
                            </div>
                        </FloatingElement>
                    </div>

                    <div className="campfire-cta-col">
                        <FloatingElement hoverLift={8}>
                            <div
                                className="campfire-cta"
                                role="button"
                                tabIndex={0}
                                aria-label="Click to see memories of previous KickOffs"
                            >
                                <div className="campfire-arrow-wrap" aria-hidden="true">
                                    <img
                                        src="/assets/campfire/arrow.png"
                                        alt=""
                                        className="campfire-arrow-img"
                                    />
                                </div>
                                <div className="campfire-memories-wrap">
                                    <img
                                        src="/assets/campfire/memories.png"
                                        alt="Click to see memories of previous KickOffs"
                                        className="campfire-memories-img"
                                    />
                                </div>
                            </div>
                        </FloatingElement>
                    </div>
                </div>
            </div>
        </section>
    );
}