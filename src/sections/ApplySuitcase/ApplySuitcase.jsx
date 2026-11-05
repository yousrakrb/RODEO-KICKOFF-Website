// src/sections/ApplySuitcase/ApplySuitcase.jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FloatingElement from '../../components/FloatingElement/FloatingElement';
import './ApplySuitcase.css';

gsap.registerPlugin(ScrollTrigger);

export default function ApplySuitcase() {
    const sectionRef = useRef(null);
    const modelRef = useRef(null);
    const buttonWrapRef = useRef(null);
    const readyRef = useRef(false);

    useEffect(() => {
        const modelEl = modelRef.current;

        // Runs once the .glb has fully loaded. Grabs the first animation
        // clip, "arms" it with play()/pause() so it's ready to seek, then
        // resets to frame 0 (closed) before scroll takes over.
        const onLoad = () => {
            if (modelEl.availableAnimations?.length) {
                modelEl.animationName = modelEl.availableAnimations[0];
            }
            modelEl.play();
            modelEl.pause();
            modelEl.currentTime = 0;
            readyRef.current = true;

            // re-measure scroll positions now that the model has settled
            // into its final size, so ScrollTrigger's pin math is accurate
            ScrollTrigger.refresh();

            console.log('Suitcase model loaded:', {
                animations: modelEl.availableAnimations,
                duration: modelEl.duration,
            });
        };

        modelEl.addEventListener('load', onLoad);

        const isMobile = window.innerWidth < 768;

        const ctx = gsap.context(() => {
            gsap.set(buttonWrapRef.current, { opacity: 0 });

            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: 'top top',
                end: '+=700',
                scrub: true,
                pin: !isMobile,
                onUpdate: (self) => {
                    if (!readyRef.current) return;
                    const progress = self.progress;
                    const duration = modelEl.duration || 0;
                    modelEl.currentTime = progress * duration;

                    gsap.set(buttonWrapRef.current, {
                        opacity: progress > 0.8 ? (progress - 0.8) / 0.2 : 0,
                    });
                },
            });
        }, sectionRef);

        return () => {
            modelEl.removeEventListener('load', onLoad);
            ctx.revert();
        };
    }, []);

    return (
        <section ref={sectionRef} className="apply-suitcase">
            <div className="suitcase-stage">
                <model-viewer
                    ref={modelRef}
                    src="/assets/suitcase/case.glb"
                    alt="Rodeo Kickoff suitcase"
                    disable-zoom
                    disable-pan
                    disable-tap
                    interaction-prompt="none"
                    shadow-intensity="1"
                ></model-viewer>

                <div ref={buttonWrapRef} className="apply-button-wrap">
                    <FloatingElement>
                        <button className="apply-button">Apply</button>
                    </FloatingElement>
                </div>
            </div>
        </section>
    );
}