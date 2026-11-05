// src/sections/Countdown/Countdown.jsx
import { useCountdown } from '../../hooks/useCountdown';
import ExploreCTA from '../ExploreCTA/ExploreCTA';
import './Countdown.css';

function CardUnit({ value, labelSrc, labelAlt }) {
    return (
        <div className="countdown-card-unit">
            <div className="countdown-card">
                {/* Vertical String hanging from clip to top of card */}
                <div className="card-string" />

                {/* Top Punched Hole */}
                <div className="card-hole" />

                {/* Horizontal Flip/Split Line */}
                <div className="card-split-line" />

                {/* Number Display */}
                <div className="card-number-wrapper">
                    <span className="card-number">{value}</span>
                </div>
            </div>

            {/* PNG Label Underneath */}
            <div className="label-wrap">
                <img
                    src={labelSrc}
                    alt={labelAlt}
                    className="label-png"
                />
            </div>
        </div>
    );
}

function CountdownPair({ card1, card2 }) {
    return (
        <div className="countdown-pair-container">
            {/* Wooden Pin Clip at Top */}
            <div className="wooden-pin-wrap">
                <img
                    src="/assets/countdown/Wooden-pin.png"
                    alt="Wooden Pin Clip"
                    className="wooden-pin-img"
                />
            </div>

            {/* Two Hanging Cards */}
            <div className="cards-pair">
                <CardUnit {...card1} />
                <CardUnit {...card2} />
            </div>
        </div>
    );
}

export default function Countdown() {
    const time = useCountdown();

    const daysStr = String(time.days).padStart(2, '0');
    const hoursStr = String(time.hours).padStart(2, '0');
    const minutesStr = String(time.minutes).padStart(2, '0');
    const secondsStr = String(time.seconds).padStart(2, '0');

    const pair1 = [
        { value: daysStr, labelSrc: '/assets/countdown/days.png', labelAlt: 'DAYS' },
        { value: hoursStr, labelSrc: '/assets/countdown/hours.png', labelAlt: 'HOURS' },
    ];

    const pair2 = [
        { value: minutesStr, labelSrc: '/assets/countdown/minutes.png', labelAlt: 'MINUTES' },
        { value: secondsStr, labelSrc: '/assets/countdown/seconds.png', labelAlt: 'SECONDS' },
    ];

    return (
        <section className="countdown-section" id="countdown">
            <div className="countdown-container">
                <CountdownPair card1={pair1[0]} card2={pair1[1]} />
                <CountdownPair card1={pair2[0]} card2={pair2[1]} />
            </div>

            <div className="bottom-asset-container">
                <img
                    src="/assets/countdown/WhyOurKickoff.png"
                    alt="Why Our KickOff"
                    className="bottom-asset-image"
                />
            </div>

            <ExploreCTA />
        </section>
    );
}