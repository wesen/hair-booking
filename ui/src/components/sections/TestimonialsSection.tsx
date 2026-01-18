import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'

export interface Testimonial {
  quote: string
  name: string
  avatarUrl?: string
  role?: string
}

export interface TestimonialsSectionProps {
  heading?: string
  subheading?: string
  backgroundImageUrl?: string
  items: Testimonial[]
}

export function TestimonialsSection({
  heading,
  subheading,
  backgroundImageUrl,
  items,
}: TestimonialsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section
      id="testimonial2"
      className="testimonial testimonial-2 bg-overlay bg-overlay-dark bg-parallax text-center"
    >
      {backgroundImageUrl ? (
        <div className="bg-section">
          <img src={backgroundImageUrl} alt="Background" />
        </div>
      ) : null}
      <div className="container">
        {(heading || subheading) && (
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
              <div className="text--center heading mb-100">
                {heading ? <h2 className="heading--title color-white">{heading}</h2> : null}
                {subheading ? <p className="heading--desc mb-0 color-gray">{subheading}</p> : null}
                <div className="divider--line divider--center" />
              </div>
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-xs-12 col-sm-12 col-md-8 col-md-offset-2">
            <div
              id="testimonial-carousel"
              className="carousel carousel-dots carousel-white"
              ref={emblaRef}
            >
              <div className="embla__container">
                {items.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="embla__slide">
                    <div className="testimonial-panel">
                      <div className="testimonial--body">
                        <p>"{item.quote}"</p>
                      </div>
                      <div className="testimonial--meta-content">
                        <h4>– {item.name}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Carousel dots navigation */}
            <div className="carousel-dots-nav">
              {items.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`dot ${index === selectedIndex ? 'active' : ''}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
