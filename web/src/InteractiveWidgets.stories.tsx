import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Segmented } from "./atoms/Segmented/Segmented";
import { RatingBar } from "./atoms/RatingBar/RatingBar";
import { ServiceOption } from "./molecules/ServiceOption/ServiceOption";
import { BudgetOption } from "./molecules/BudgetOption/BudgetOption";
import { TimeSlot } from "./molecules/TimeSlot/TimeSlot";
import { DayCell } from "./molecules/DayCell/DayCell";
import { LengthSilhouette } from "./molecules/LengthSilhouette/LengthSilhouette";
import { PhotoTile } from "./molecules/PhotoTile/PhotoTile";
import { color, font, type as typeToken } from "./fringe-ui/tokens";

const meta: Meta = {
  title: "App Ready Widgets/Interactive Form Controls",
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj;

function StateDump({ value }: { value: unknown }) {
  return (
    <pre style={{ marginTop: 18, padding: 12, background: color.cream, fontFamily: font.mono, fontSize: 12, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export const IntakeSelections: Story = {
  render: () => {
    const [service, setService] = useState("highlights");
    const [budget, setBudget] = useState("250-400");
    const [length, setLength] = useState("Shoulder");
    const [damage, setDamage] = useState(2);

    const state = { service, budget, length, damage };

    return (
      <div style={{ maxWidth: 420 }}>
        <h2 style={{ ...typeToken.h2, margin: "0 0 14px" }}>Controlled intake selectors</h2>
        <Segmented
          options={["cut", "color", "extensions"]}
          value="color"
          onChange={(next) => console.log("segmented", next)}
          style={{ marginBottom: 16 }}
        />
        <ServiceOption value="cut" name="Cut" description="Trim · restyle · bangs" rate="$80+" selected={service === "cut"} onSelect={setService} />
        <ServiceOption value="highlights" name="Highlights" description="Partial · full · balayage" rate="$180+" selected={service === "highlights"} onSelect={setService} />
        <ServiceOption value="gloss" name="Gloss refresh" description="Tone · shine · maintenance" rate="$120+" selected={service === "gloss"} onSelect={setService} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
          <BudgetOption value="150-250" label="$150 – $250" description="Partial color" selected={budget === "150-250"} onSelect={setBudget} />
          <BudgetOption value="250-400" label="$250 – $400" description="Full color" selected={budget === "250-400"} onSelect={setBudget} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
          {["Bob", "Shoulder", "Mid-back"].map((item) => (
            <LengthSilhouette key={item} value={item} label={item} selected={length === item} onSelect={setLength} />
          ))}
        </div>

        <RatingBar label="Damage" value={damage} interactive onChange={setDamage} style={{ marginTop: 12 }} />
        <StateDump value={state} />
      </div>
    );
  },
};

export const BookingSelections: Story = {
  render: () => {
    const [day, setDay] = useState("18");
    const [time, setTime] = useState("2:00p");
    const [photos, setPhotos] = useState<string[]>(["front"]);

    function togglePhoto(value: string, filled: boolean) {
      setPhotos((current) => filled ? current.filter((item) => item !== value) : [...current, value]);
    }

    return (
      <div style={{ maxWidth: 420 }}>
        <h2 style={{ ...typeToken.h2, margin: "0 0 14px" }}>Booking and upload selectors</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 16 }}>
          {Array.from({ length: 21 }).map((_, i) => {
            const value = String(i + 1);
            return <DayCell key={value} day={value} selected={day === value} disabled={i < 10} dot={[14, 17, 18].includes(i + 1)} onSelect={setDay} />;
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
          {["10:30a", "12:00p", "2:00p", "4:30p"].map((slot) => (
            <TimeSlot key={slot} value={slot} label={slot} selected={time === slot} onSelect={setTime} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {["front", "side", "back"].map((item) => {
            const filled = photos.includes(item);
            return (
              <PhotoTile
                key={item}
                value={item}
                label={item}
                filled={filled}
                onUpload={(value) => togglePhoto(value, false)}
                onRemove={(value) => togglePhoto(value, true)}
              />
            );
          })}
        </div>
        <StateDump value={{ day, time, photos }} />
      </div>
    );
  },
};
