import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function resolveSrc(src) {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
}

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? "28%" : "-28%",
    opacity: 0,
    scale: 0.92,
    filter: "blur(4px)",
  }),
  center: {
    x: "0%",
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (dir) => ({
    x: dir > 0 ? "-28%" : "28%",
    opacity: 0,
    scale: 0.92,
    filter: "blur(4px)",
  }),
};

export default function ProductGallery({ images = [], alt, large = false, showControls = true }) {
  const [[index, direction], setPage] = useState([0, 0]);
  const draggedRef = useRef(false);
  const hasMultiple = images.length > 1 && showControls;

  const paginate = (newDir) => {
    setPage(([prev]) => [
      (prev + newDir + images.length) % images.length,
      newDir,
    ]);
  };

  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    paginate(-1);
  };

  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    paginate(1);
  };

  const goTo = (e, targetIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (targetIdx === index) return;
    setPage([targetIdx, targetIdx > index ? 1 : -1]);
  };

  // Prevents parent <Link> navigation when the user just finished swiping
  const handleContainerClick = (e) => {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      draggedRef.current = false;
    }
  };

  return (
    <div
      className={`po-gallery ${large ? "po-gallery-large" : ""}`}
      onClickCapture={handleContainerClick}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        {images[index] && (
          <motion.img
            key={`${index}-${images[index]}`}
            src={resolveSrc(images[index])}
            alt={alt}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 360, damping: 32, mass: 0.85 },
              opacity: { duration: 0.24, ease: "easeOut" },
              scale: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
              filter: { duration: 0.24 },
            }}
            drag={hasMultiple ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.22}
            onDragStart={() => {
              draggedRef.current = true;
            }}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (offset.x < -35 || swipe < -400) {
                paginate(1);
              } else if (offset.x > 35 || swipe > 400) {
                paginate(-1);
              }
              setTimeout(() => {
                draggedRef.current = false;
              }, 80);
            }}
            draggable={false}
          />
        )}
      </AnimatePresence>

      {hasMultiple && (
        <>
          <button
            type="button"
            className="po-gallery-arrow left"
            aria-label="Previous photo"
            onClick={prev}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="po-gallery-arrow right"
            aria-label="Next photo"
            onClick={next}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="po-gallery-dots" role="tablist" aria-label={`${alt} photos`}>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Photo ${i + 1} of ${images.length}`}
                className={i === index ? "on" : ""}
                onClick={(e) => goTo(e, i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}