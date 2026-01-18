import type { ReactNode } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageTitleSectionProps {
  title: string
  backgroundImageUrl: string
  breadcrumbs?: BreadcrumbItem[]
  subtitle?: ReactNode
}

export function PageTitleSection({
  title,
  backgroundImageUrl,
  breadcrumbs = [],
  subtitle,
}: PageTitleSectionProps) {
  return (
    <section id="page-title" className="page-title bg-overlay bg-overlay-dark bg-parallax">
      <div className="bg-section">
        <img src={backgroundImageUrl} alt="Page background" />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-sm-12 col-md-12">
            <div className="title title-1 text-center">
              <div className="title--heading">
                <h1>{title}</h1>
              </div>
              {subtitle ? <div className="title--desc">{subtitle}</div> : null}
              <div className="clearfix" />
              {breadcrumbs.length ? (
                <ol className="breadcrumb">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={`${crumb.label}-${index}`} className={index === breadcrumbs.length - 1 ? 'active' : ''}>
                      {crumb.href && index !== breadcrumbs.length - 1 ? (
                        <a href={crumb.href}>{crumb.label}</a>
                      ) : (
                        crumb.label
                      )}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
