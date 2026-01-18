export interface VideoSectionProps {
  heading: string
  description: string
  signatureUrl?: string
  videoThumbnailUrl: string
  videoUrl: string
}

export function VideoSection({
  heading,
  description,
  signatureUrl,
  videoThumbnailUrl,
  videoUrl,
}: VideoSectionProps) {
  return (
    <section id="video2" className="video-button video-button-1">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-sm-6 col-md-6">
            <div className="heading heading-2 mb-30 pt-50">
              <h2 className="heading--title">{heading}</h2>
            </div>
            <p>{description}</p>
            {signatureUrl ? <img src={signatureUrl} alt="signature" /> : null}
          </div>
          <div className="col-xs-12 col-sm-6 col-md-6">
            <div className="video--content">
              <div className="bg-section">
                <img src={videoThumbnailUrl} alt="Background" />
              </div>
              <div className="video-overlay">
                <div className="video--button">
                  <div className="pos-vertical-center">
                    <a className="popup-video" href={videoUrl} aria-label="Play video">
                      <i className="fa fa-play" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
