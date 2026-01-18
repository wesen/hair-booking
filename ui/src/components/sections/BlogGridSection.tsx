export interface BlogEntry {
  title: string
  excerpt: string
  imageUrl: string
  date: string
  category: string
  href?: string
}

export interface BlogGridSectionProps {
  heading?: string
  description?: string
  entries: BlogEntry[]
  showViewMore?: boolean
}

export function BlogGridSection({
  heading,
  description,
  entries,
  showViewMore,
}: BlogGridSectionProps) {
  return (
    <section id="blog" className="blog blog-grid pb-100">
      <div className="container">
        {(heading || description) && (
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
              <div className="heading text--center mb-70">
                {heading && <h2 className="heading--title">{heading}</h2>}
                {description && <p className="heading--desc">{description}</p>}
                <div className="divider--line" />
              </div>
            </div>
          </div>
        )}
        <div className="row">
          {entries.map((entry, index) => (
            <div key={`${entry.title}-${index}`} className="col-xs-12 col-sm-12 col-md-4">
              <div className="blog-entry">
                <div className="entry--img">
                  <a href={entry.href || '#'}>
                    <img src={entry.imageUrl} alt={entry.title} />
                  </a>
                  <div className="entry--overlay">
                    <a href={entry.href || '#'} aria-label={`Read ${entry.title}`}>
                      <i className="fa fa-chain" />
                    </a>
                  </div>
                </div>
                <div className="entry--content">
                  <div className="entry--meta">
                    <span>{entry.date}</span>
                    <span>
                      <a href="#">{entry.category}</a>
                    </span>
                  </div>
                  <div className="entry--title">
                    <h4>
                      <a href={entry.href || '#'}>{entry.title}</a>
                    </h4>
                  </div>
                  <div className="entry--bio">{entry.excerpt}</div>
                  <div className="entry--more">
                    <a href={entry.href || '#'}>
                      read more <i className="fa fa-angle-double-right" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {showViewMore && (
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-12 clearfix mt-20 text--center">
              <a href="#" className="btn btn--secondary btn--bordered btn--rounded">
                View More
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
