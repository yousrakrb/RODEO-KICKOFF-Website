// src/sections/ApplySuitcase/ApplySuitcase.jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FloatingElement from '../../components/FloatingElement/FloatingElement';
import './ApplySuitcase.css';

gsap.registerPlugin(ScrollTrigger);

// one entry per frame you have — add/remove to match how many you get made
const FRAMES = [
    '/assets/suitcase/frame-0-closed.png',
    '/assets/suitcase/frame-1-quarter.png',
    '/assets/suitcase/frame-2-half.png',
    '/assets/suitcase/frame-3-threequarter.png',
    '/assets/suitcase/frame-4-open.png',
];

export default function ApplySuitcase() {
    const sectionRef = useRef(null);
    const imgRef = useRef(null);
    const buttonWrapRef = useRef(null);
    const frameState = useRef({ index: 0 });

    useEffect(() => {
        // preload all frames so there's no flicker/pop-in when switching
        FRAMES.forEach((src) => {
            const img = new Image();
            img.src = src;
        });

        const ctx = gsap.context(() => {
            gsap.set(buttonWrapRef.current, { opacity: 0 });

            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: 'top top',
                end: '+=700',
                scrub: true,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true, // recalculates on phone rotate/resize
                onUpdate: (self) => {
                    const progress = self.progress; // 0 to 1
                    const frameIndex = Math.min(
                        FRAMES.length - 1,
                        Math.floor(progress * FRAMES.length)
                    );

                    if (frameIndex !== frameState.current.index) {
                        frameState.current.index = frameIndex;
                        imgRef.current.src = FRAMES[frameIndex];
                    }

                    // fade in the button only once we're mostly open
                    gsap.set(buttonWrapRef.current, {
                        opacity: progress > 0.8 ? (progress - 0.8) / 0.2 : 0,
                    });
                },
            });
        }, sectionRef);

        // the first frame's height changes the layout once it loads,
        // so refresh the pin positions after that
        const first = imgRef.current;
        const refresh = () => ScrollTrigger.refresh();
        if (first && !first.complete) first.addEventListener('load', refresh);

        return () => {
            if (first) first.removeEventListener('load', refresh);
            ctx.revert();
        };
    }, []);

    return (
        <section ref={sectionRef} className="apply-suitcase">
            <div className="suitcase-stage">
                <img ref={imgRef} src={FRAMES[0]} alt="" className="suitcase-frame" />

                <div ref={buttonWrapRef} className="apply-button-wrap">
                    <FloatingElement>
                        <button className="apply-button">Apply</button>
                    </FloatingElement>
                </div>
            </div>
        </section>
    );
}