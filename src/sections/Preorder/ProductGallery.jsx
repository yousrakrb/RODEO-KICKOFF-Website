import { useState } from "react";

function resolveSrc(src) {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
}

export default function ProductGallery({ images = [], alt, large = false, showControls = true }) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1 && showControls;

  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  };

  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
  };

  return (
    <div className={`po-gallery ${large ? "po-gallery-large" : ""}`}>
      {images[index] && (
        <img
          key={images[index]}
          src={resolveSrc(images[index])}
          alt={alt}
        />
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            className="po-gallery-arrow left"
            aria-label="Previous photo"
            onClick={prev}
          >
            ‹
          </button>
          <button
            type="button"
            className="po-gallery-arrow right"
            aria-label="Next photo"
            onClick={next}
          >
            ›
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}