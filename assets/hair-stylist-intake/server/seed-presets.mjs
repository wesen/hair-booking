/**
 * Seed preset decision tree templates
 * Run with: node server/seed-presets.mjs
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { decisionTrees, users } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { PRESET_TEMPLATES } from "./presets.ts";

/* OLD PRESET_TEMPLATES = [
  {
    name: "Hair Cuts Decision Tree",
    description: "Comprehensive haircut and styling services with color options",
    dslContent: `name: Hair Cuts Decision Tree
root: haircuts

nodes:
  haircuts:
    question: "What type of haircut?"
    options:
      - label: "Men's Cut"
        price: 55
        duration: 45min
        next: base_color
      - label: "Women's Cut"
        price: 85
        duration: 1hr
        next: base_color
      - label: "Child's Cut"
        price: 40
        duration: 30min
        next: base_color

  base_color:
    question: "Base color service?"
    options:
      - label: "No"
        next: highlights
      - label: "Yes"
        price: 95
        duration: 90min
        next: cut_with_color

  cut_with_color:
    question: "Cut with color?"
    options:
      - label: "No"
        next: highlights
      - label: "Yes"
        price: 135
        next: highlights

  highlights:
    question: "Highlights?"
    options:
      - label: "No"
        next: additional_services
      - label: "Mini"
        price: 85
        price_with_cut: 120
        next: additional_services
      - label: "Partial Foils"
        price: 120
        price_with_cut: 155
        next: additional_services
      - label: "3/4"
        price: 140
        price_with_cut: 175
        next: additional_services
      - label: "Full"
        price: 175
        price_with_cut: 205
        next: additional_services
      - label: "Balayage"
        price: 200
        price_with_cut: 289
        next: additional_services

  additional_services:
    question: "Additional services?"
    optional: true
    options:
      - label: "All-over color or double color"
        price: 165
        books_for: 90min
        next: end
      - label: "Wrap & blow dry"
        note: "Include with all services"
        next: end
      - label: "Custom fantasy colors"
        note: "By consult only"
        next: end
      - label: "No additional services"
        next: end

  end:
    type: terminal
    action: book_appointment

rules:
  - if_service_includes: [cut, color]
    then: apply_combo_pricing
  - if_service: balayage
    duration: 1hr 45min
    then: apply_cut_discount`,
  },
  {
    name: "Quick Cuts Only",
    description: "Simple haircut menu without color services",
    dslContent: `name: Quick Cuts Only
root: cut_type

nodes:
  cut_type:
    question: "Select your haircut service"
    options:
      - label: "Men's Haircut"
        price: 45
        duration: 30min
        next: styling
      - label: "Women's Haircut"
        price: 65
        duration: 45min
        next: styling
      - label: "Child's Haircut (under 12)"
        price: 30
        duration: 20min
        next: styling
      - label: "Buzz Cut"
        price: 25
        duration: 15min
        next: styling

  styling:
    question: "Add styling service?"
    options:
      - label: "No styling"
        next: end
      - label: "Basic blow dry"
        price: 15
        duration: 15min
        next: end
      - label: "Styling with product"
        price: 25
        duration: 20min
        next: end

  end:
    type: terminal
    action: book_appointment

rules: []`,
  },
  {
    name: "Color Services Menu",
    description: "Full color services including highlights, balayage, and treatments",
    dslContent: `name: Color Services Menu
root: color_type

nodes:
  color_type:
    question: "What color service are you interested in?"
    options:
      - label: "All-over single process color"
        price: 95
        duration: 90min
        next: add_cut
      - label: "Root touch-up"
        price: 75
        duration: 60min
        next: add_cut
      - label: "Partial highlights"
        price: 120
        duration: 2hr
        next: add_cut
      - label: "Full highlights"
        price: 175
        duration: 2hr 30min
        next: add_cut
      - label: "Balayage"
        price: 205
        duration: 2hr 30min
        next: add_cut
      - label: "Fashion/fantasy colors"
        price: 250
        duration: 3hr
        next: add_cut

  add_cut:
    question: "Would you like to add a haircut?"
    options:
      - label: "No cut"
        next: treatment
      - label: "Add women's cut"
        price: 50
        duration: 45min
        next: treatment
      - label: "Add men's cut"
        price: 35
        duration: 30min
        next: treatment

  treatment:
    question: "Add a treatment?"
    options:
      - label: "No treatment"
        next: end
      - label: "Deep conditioning"
        price: 25
        duration: 20min
        next: end
      - label: "Keratin treatment"
        price: 150
        duration: 90min
        next: end
      - label: "Olaplex treatment"
        price: 45
        duration: 30min
        next: end

  end:
    type: terminal
    action: book_appointment

rules:
  - if_service_includes: [color, cut]
    then: apply_combo_pricing`,
  },
]; */

async function seed() {
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log("Seeding preset decision trees...");
  
  // Get owner user
  const ownerOpenId = process.env.OWNER_OPEN_ID;
  if (!ownerOpenId) {
    throw new Error("OWNER_OPEN_ID not found in environment");
  }
  
  let ownerResult = await db.select().from(users).where(eq(users.openId, ownerOpenId)).limit(1);
  let ownerId;
  
  if (ownerResult.length === 0) {
    console.log("Owner user not found, creating...");
    const insertResult = await db.insert(users).values({
      openId: ownerOpenId,
      name: process.env.OWNER_NAME || "Admin",
      role: "admin",
    });
    ownerId = Number(insertResult[0].insertId);
    console.log(`✓ Created owner user with ID: ${ownerId}`);
  } else {
    ownerId = ownerResult[0].id;
    console.log(`Using existing owner user with ID: ${ownerId}`);
  }
  
  // Insert presets
  for (const preset of PRESET_TEMPLATES) {
    // Check if preset already exists
    const existing = await db
      .select()
      .from(decisionTrees)
      .where(eq(decisionTrees.name, preset.name))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing preset
      await db.update(decisionTrees)
        .set({
          description: preset.description,
          dslContent: preset.dslContent,
          isPublished: 1,
        })
        .where(eq(decisionTrees.name, preset.name));
      console.log(`✓ Updated preset: ${preset.name}`);
    } else {
      // Create new preset
      await db.insert(decisionTrees).values({
        name: preset.name,
        description: preset.description,
        dslContent: preset.dslContent,
        isPublished: 1,
        isPreset: 1,
        createdBy: ownerId,
        version: 1,
      });
      console.log(`✓ Created preset: ${preset.name}`);
    }
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
