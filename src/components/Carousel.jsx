import React, { useState, useEffect } from 'react'

export default function Carousel({ slides }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!slides || !slides.length) return
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), 4500)
    return () => clearInterval(timer)
  }, [slides])

  if (!slides || !slides.length) {
    return null
  }

  return (
    <div className="banner-carousel" role="region" aria-label="Carrusel de imágenes de NutriGo">
      <div className="carousel">
        <div className="carousel-track" style={{ transform: `translateX(${-index * 100}%)` }}>
          {slides.map((slide) => (
            <article
              key={slide.heading}
              className="carousel-slide"
              role="group"
              aria-roledescription="slide"
              aria-label={slide.heading}
            >
              <img src={slide.image} alt={slide.heading} />
              <div className="carousel-caption">
                <h2>{slide.heading}</h2>
                <p>{slide.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <button className="carousel-btn prev" aria-label="Anterior" onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}>
        ‹
      </button>
      <button className="carousel-btn next" aria-label="Siguiente" onClick={() => setIndex((i) => (i + 1) % slides.length)}>
        ›
      </button>
    </div>
  )
}
