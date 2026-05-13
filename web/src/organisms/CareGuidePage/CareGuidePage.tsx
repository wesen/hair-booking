import { AppHeader } from "../../molecules/AppHeader/AppHeader";
import { Button } from "../../atoms/Button/Button";
import { Card } from "../../atoms/Card/Card";
import { Eyebrow } from "../../atoms/Eyebrow/Eyebrow";
import { Rule } from "../../atoms/Rule/Rule";
import { color, font } from "../../fringe-ui/tokens";

interface CareSection {
  emoji: string;
  heading: string;
  items: string[];
}

interface CareGuidePageProps {
  sections: CareSection[];
  contactPhone?: string;
  onBack?: () => void;
  onDone?: () => void;
}

export function CareGuidePage({
  sections,
  contactPhone = "(401) 555-0123",
  onBack,
  onDone,
}: CareGuidePageProps) {
  return (
    <div style={{ minHeight: "100vh", background: color.paper }}>
      <div style={{ paddingTop: 8 }}>
        <AppHeader onBack={onBack} />
      </div>

      <div style={{ padding: "12px 22px 24px" }}>
        <Eyebrow style={{ marginBottom: 8 }}>EXTENSION CARE · AFTERCARE GUIDE</Eyebrow>
        <div
          style={{
            fontFamily: font.block,
            fontSize: 36,
            lineHeight: 0.95,
            textTransform: "uppercase",
            color: color.ink,
            marginBottom: 12,
          }}
        >
          Keep your
          <br />
          new hair happy.
        </div>
        <div
          style={{
            fontFamily: font.serif,
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.45,
            color: color.softInk,
            marginBottom: 20,
          }}
        >
          A simple care guide for washing, styling, sleeping, and maintenance after install.
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {sections.map((section) => (
            <Card key={section.heading}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 22 }}>{section.emoji}</div>
                <div
                  style={{
                    fontFamily: font.block,
                    fontSize: 18,
                    textTransform: "uppercase",
                    color: color.plum,
                  }}
                >
                  {section.heading}
                </div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {section.items.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "14px 1fr",
                      gap: 10,
                      alignItems: "start",
                      fontFamily: font.sans,
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: color.ink,
                    }}
                  >
                    <span style={{ color: color.plum }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div style={{ margin: "22px 0 18px" }}>
          <Rule />
        </div>

        <div style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: 1.2, color: color.soft, marginBottom: 14 }}>
          QUESTIONS? TEXT {contactPhone}
        </div>

        {onDone ? (
          <Button variant="primary" size="md" onClick={onDone} style={{ width: "100%" }}>
            Got it
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default CareGuidePage;
