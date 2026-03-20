interface CareSection {
  emoji: string;
  heading: string;
  items: string[];
}

interface CareGuideContentProps {
  sections: CareSection[];
  contactPhone?: string;
}

export function CareGuideContent({ sections, contactPhone = "(401) 555-0123" }: CareGuideContentProps) {
  return (
    <div>
      {sections.map((section, i) => (
        <div key={i} data-part="care-section">
          <div data-part="care-section-heading">
            <span>{section.emoji}</span>
            {section.heading}
          </div>
          <div data-part="care-section-items">
            {section.items.map((item, j) => (
              <div key={j}>{item}</div>
            ))}
          </div>
        </div>
      ))}

      <div data-part="care-contact">
        Questions? Text {contactPhone}
      </div>
    </div>
  );
}
