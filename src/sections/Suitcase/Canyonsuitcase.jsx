import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@google/model-viewer"; // registers the <model-viewer> element (npm i @google/model-viewer)

gsap.registerPlugin(ScrollTrigger);

/* ------------------------- settings you can tweak ------------------------- */
const FOV = 30;            // must match field-of-view on <model-viewer> below
const SCROLL_LENGTH = "+=500%"; // how much scrolling the whole sequence takes (500% = five screen heights)

// Camera path (angles in degrees)
const START_FAR = 2.4;     // start distance = 2.4 x the "normal" distance (small and far away)
const START_THETA = -110;  // start angle around the case; it ends at 0 (front). The spin = the circular motion
const START_PHI = 72;      // start height angle (90 = level, 0 = straight down)
const CLOSED_PHI = 35;     // angle when the closed case is at normal size
const OPEN_PHI = 8;        // angle when open (almost top-down so you see both halves)

// Once the case is open, clicking anything on the BOTTOM half (the near half) goes to the application page.
// The two halves meet at z = 0.56 (metres in the 3D file), so this is "just below the hinge".
const APPLY_FROM_Z = 0.6;
/* -------------------------------------------------------------------------- */

const lerp = (a, b, t) => a + (b - a) * t;

export default function CanyonSuitcase({
    src = "/assets/suitcase/suitcase.glb",
    yeehawSrc = "/assets/suitcase/yeehaw.png",   // the rope "Yeehaw!!" image
    packNowSrc = "/assets/suitcase/packnow.png", // the "Pack your cowboy boots..." image
    topSpace = -900,            // px above "Yeehaw!!" on desktop / tablet
    topSpaceMobile = "-350vw",  // above "Yeehaw!!" on phones
    pinOffsetMobile = 0,        // phones: px. 0 = the pin starts exactly when the title hits the top of the screen.
                                // Positive = pin starts a bit LATER, negative = a bit EARLIER
    applyUrl = "/apply", // optional: if you don't provide onApply, clicking the bottom half of the open case goes here
    onApply, // optional: e.g. () => navigate("/apply") with React Router
}) {
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const viewerRef = useRef(null);
    const openRef = useRef(false);
    const goRef = useRef();
    const [hint, setHint] = useState("Scroll");
    const [headerH, setHeaderH] = useState(0);

    // true on phones, so the spacing can differ there
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
    );

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const onChange = (e) => setIsMobile(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    // measure the title block (its images load late, so keep watching its height)
    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;
        const measure = () => setHeaderH(el.offsetHeight);
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // always call the latest onApply / applyUrl without re-running the effect
    goRef.current = () => (onApply ? onApply() : (window.location.href = applyUrl));

    useEffect(() => {
        const m = viewerRef.current;
        const section = sectionRef.current;
        const s = { fly: 0, open: 0 }; // both are animated 0 -> 1 by the scroll timeline below

        // camera distance (metres) at which a box of boxW x boxD metres fills the screen nicely
        const fit = (boxW, boxD) => {
            const r = m.getBoundingClientRect();
            const aspect = r.width / Math.max(1, r.height);
            const t = Math.tan((FOV * Math.PI) / 360);
            // on tall (phone) screens the viewer keeps the HORIZONTAL view angle fixed, on wide screens the vertical one
            const tv = aspect >= 1 ? t : t / aspect;
            const th = aspect >= 1 ? t * aspect : t;
            return Math.max(boxW / 2 / th, boxD / 2 / tv) * 1.12;
        };

        const render = () => {
            const closedDist = fit(1.9, 1.3); // closed case fills the screen
            const openDist = fit(1.9, 2.5);   // open case (both halves) fits too
            const dist = lerp(lerp(closedDist * START_FAR, closedDist, s.fly), openDist, s.open);
            const theta = lerp(START_THETA, 0, s.fly);
            const phi = lerp(lerp(START_PHI, CLOSED_PHI, s.fly), OPEN_PHI, s.open);
            m.cameraOrbit = `${theta}deg ${phi}deg ${dist}m`;
            m.cameraTarget = `0m ${lerp(0.2, 0.05, s.open)}m ${lerp(0, 0.56, s.open)}m`;
            // scrub the opening. Stop a hair before the end: at exactly the end the animation loops back to "closed"
            if (m.loaded && m.duration) m.currentTime = Math.min(s.open * m.duration, m.duration - 0.03);

            openRef.current = s.open > 0.98;
            setHint(s.fly < 0.999 ? "Scroll" : openRef.current ? "" : "Keep scrolling to open");
        };

        // The scroll sequence. On phones the case is visible from the start (small and far away).
        const mm = gsap.matchMedia();
        mm.add(
            {
                isMobile: "(max-width: 767px)",
                isDesktop: "(min-width: 768px)",
            },
            ({ conditions }) => {
                const isMobile = conditions.isMobile;
                const timeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: "top top",
                        end: isMobile ? "+=575%" : SCROLL_LENGTH,
                        pin: true,
                        scrub: true,
                        invalidateOnRefresh: true,
                        onRefresh: render, // re-fit when the window is resized
                    },
                });

                timeline
                    .to(s, { fly: 1, duration: 0.35, ease: "power2.inOut", onUpdate: render })
                    .to({}, { duration: 0.1 })
                    .to(s, { open: 1, duration: 0.4, ease: "power2.inOut", onUpdate: render })
                    .to({}, { duration: 0.15 });
            }
        );

        const onLoad = () => {
            m.play(); m.pause(); m.currentTime = 0; // prepare the animation for scrubbing
            render();
            m.jumpCameraToGoal && m.jumpCameraToGoal();
        };
        if (m.loaded) onLoad(); else m.addEventListener("load", onLoad);

        // ---- clicking the bottom half of the open case ----
        const overBottomHalf = (x, y) => {
            if (!openRef.current) return false;
            const hit = m.positionAndNormalFromPoint(x, y);
            return !!hit && hit.position.z > APPLY_FROM_Z;
        };
        const onMove = (e) => { m.style.cursor = overBottomHalf(e.clientX, e.clientY) ? "pointer" : "default"; };
        const onClick = (e) => { if (overBottomHalf(e.clientX, e.clientY)) goRef.current(); };
        m.addEventListener("pointermove", onMove);
        m.addEventListener("click", onClick);

        return () => {
            mm.revert();
            m.removeEventListener("load", onLoad);
            m.removeEventListener("pointermove", onMove);
            m.removeEventListener("click", onClick);
        };
    }, []);

    // the pinned section is positioned relative to the title, so re-measure the pin when spacing changes
    useEffect(() => {
        const id = setTimeout(() => ScrollTrigger.refresh(), 50);
        return () => clearTimeout(id);
    }, [isMobile, headerH, topSpace, topSpaceMobile, pinOffsetMobile]);

    const rise = { initial: { opacity: 0, y: 36 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 } };

    return (
        <div id="gear">
            {/* ---------- title: normal page flow, scrolls up as the suitcase pins ---------- */}
            <header
                ref={headerRef}
                style={{
                    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                    gap: "clamp(12px, 2.5vw, 28px)", padding: "0 5vw clamp(24px, 4vw, 56px)",
                    marginTop: isMobile ? topSpaceMobile : topSpace, // can be negative to pull the title up
                    position: "relative", zIndex: 2, // keeps the title above the suitcase when they overlap
                }}
            >
                <motion.img
                    src={yeehawSrc}
                    alt="Yeehaw!!"
                    {...rise}
                    transition={{ duration: 0.8 }}
                    style={{ width: "clamp(220px, 42vw, 560px)", height: "auto" }}
                />
                <motion.img
                    src={packNowSrc}
                    alt="Pack your cowboy boots and hats, and book your rodeo ticket!!"
                    {...rise}
                    transition={{ duration: 0.8, delay: 0.15 }}
                    style={{ width: "clamp(280px, 72vw, 900px)", height: "auto" }}
                />
            </header>

            {/* ---------- the suitcase: pinned while the scroll drives the animation ---------- */}
            <section
                ref={sectionRef}
                style={{
                    position: "relative", height: "100vh", overflow: "hidden",
                    // phones: pull the section up by the title's height, so the pin starts
                    // exactly when the title reaches the top of the screen
                    marginTop: isMobile ? -headerH + pinOffsetMobile : 0,
                }}
            >
                <model-viewer
                    ref={viewerRef}
                    src={src}
                    alt="Rodeo Kick Off suitcase"
                    field-of-view="30deg"
                    environment-image="neutral"
                    shadow-intensity="0"
                    interaction-prompt="none"
                    interpolation-decay="45"
                    min-camera-orbit="-720deg 0deg 0.5m"
                    max-camera-orbit="720deg 90deg 60m"
                    camera-orbit="-110deg 72deg 12m"
                    camera-target="0m 0.2m 0m"
                    style={{ width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" }}
                />

                {hint && (
                    <p
                        style={{
                            position: "absolute", left: 0, right: 0, bottom: "5vh", margin: 0, textAlign: "center",
                            pointerEvents: "none", color: "#e9d6b4", opacity: 0.85, textTransform: "uppercase",
                            letterSpacing: ".12em", fontSize: "clamp(13px, 1.6vw, 17px)", fontFamily: "system-ui, sans-serif",
                        }}
                    >
                        {hint}
                    </p>
                )}
            </section>
        </div>
    );
}