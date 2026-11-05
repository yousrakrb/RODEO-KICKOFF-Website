import { useNavigate } from "react-router-dom";
import "./GearComingSoon.css";

export default function GearComingSoon() {
    const navigate = useNavigate();

    const goBack = () => {
        const historyIndex = window.history.state?.idx;
        navigate(typeof historyIndex === "number" && historyIndex > 0 ? -1 : "/");
    };

    return (
        <main className="gear-coming-soon">
            <div className="gear-coming-soon__content">
                <img
                    className="gear-coming-soon__logo"
                    src="/assets/Footer/RODEO LOGO.png"
                    alt="Rodeo Kickoff"
                />
                <section className="gear-coming-soon__copy" aria-labelledby="gear-coming-soon-title">
                    <p className="gear-coming-soon__eyebrow">The Rodeo Outfitter</p>
                    <h1 id="gear-coming-soon-title">Coming Soon</h1>
                    <p className="gear-coming-soon__message">
                        The gear is being packed for the next ride.
                    </p>
                    <button className="gear-coming-soon__back" type="button" onClick={goBack}>
                        <span aria-hidden="true">&#8592;</span>
                        Back to previous page
                    </button>
                </section>
            </div>
        </main>
    );
}