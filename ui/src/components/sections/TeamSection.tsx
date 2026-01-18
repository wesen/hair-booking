export interface TeamMember {
  name: string
  role: string
  imageUrl: string
  socialLinks?: {
    facebook?: string
    twitter?: string
    googlePlus?: string
  }
}

export interface TeamSectionProps {
  heading?: string
  description?: string
  members: TeamMember[]
}

export function TeamSection({ heading, description, members }: TeamSectionProps) {
  return (
    <section id="team1" className="team team-1">
      <div className="container">
        {(heading || description) && (
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
              <div className="text--center heading heading-2 mb-70">
                {heading && <h2 className="heading--title">{heading}</h2>}
                {description && <p className="heading--desc mb-0">{description}</p>}
                <div className="divider--line divider--center" />
              </div>
            </div>
          </div>
        )}
        <div className="row">
          {members.map((member, index) => (
            <div key={`${member.name}-${index}`} className="col-xs-12 col-sm-4 col-md-4">
              <div className="member">
                <div className="member-img">
                  <img src={member.imageUrl} alt={member.name} />
                  <div className="member-overlay">
                    <div className="member-social">
                      <div className="pos-vertical-center">
                        {member.socialLinks?.facebook && (
                          <a href={member.socialLinks.facebook} aria-label={`${member.name} on Facebook`}>
                            <i className="fa fa-facebook" />
                          </a>
                        )}
                        {member.socialLinks?.twitter && (
                          <a href={member.socialLinks.twitter} aria-label={`${member.name} on Twitter`}>
                            <i className="fa fa-twitter" />
                          </a>
                        )}
                        {member.socialLinks?.googlePlus && (
                          <a href={member.socialLinks.googlePlus} aria-label={`${member.name} on Google Plus`}>
                            <i className="fa fa-google-plus" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="member-info">
                  <h5>{member.name}</h5>
                  <h6>{member.role}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
