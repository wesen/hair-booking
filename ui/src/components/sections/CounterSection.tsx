export interface CounterItem {
  iconUrl: string
  value: string
  label: string
}

export interface CounterSectionProps {
  heading?: string
  items: CounterItem[]
}

export function CounterSection({ heading, items }: CounterSectionProps) {
  return (
    <section id="counter1" className="counter counter-1 bg-gray">
      <div className="container">
        {heading ? (
          <div className="heading text--center mb-70">
            <h2 className="heading--title">{heading}</h2>
            <div className="divider--line" />
          </div>
        ) : null}
        <div className="row">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="col-xs-12 col-sm-6 col-md-3">
              <div className="count-box text-center">
                <div className="count-img">
                  <img src={item.iconUrl} alt={item.label} />
                </div>
                <div className="counting">{item.value}</div>
                <div className="count-title">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
