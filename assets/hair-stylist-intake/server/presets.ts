/**
 * Preset decision tree templates
 * These are seeded into the database on first run
 */

export const PRESET_TEMPLATES = [
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
        price: 5500
        duration: 45min
        next: base_color
      - label: "Women's Cut"
        price: 8500
        duration: 1hr
        next: base_color
      - label: "Child's Cut"
        price: 4000
        duration: 30min
        next: base_color

  base_color:
    question: "Base color service?"
    options:
      - label: "No"
        next: highlights
      - label: "Yes"
        price: 9500
        duration: 90min
        next: cut_with_color

  cut_with_color:
    question: "Cut with color?"
    options:
      - label: "No"
        next: highlights
      - label: "Yes"
        price: 13500
        next: highlights

  highlights:
    question: "Highlights?"
    options:
      - label: "No"
        next: additional_services
      - label: "Mini"
        price: 8500
        price_with_cut: 12000
        next: additional_services
      - label: "Partial Foils"
        price: 12000
        price_with_cut: 15500
        next: additional_services
      - label: "3/4"
        price: 14000
        price_with_cut: 17500
        next: additional_services
      - label: "Full"
        price: 17500
        price_with_cut: 20500
        next: additional_services
      - label: "Balayage"
        price: 20000
        price_with_cut: 28900
        next: additional_services

  additional_services:
    question: "Additional services?"
    optional: true
    options:
      - label: "All-over color or double color"
        price: 16500
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
        price: 4500
        duration: 30min
        next: styling
      - label: "Women's Haircut"
        price: 6500
        duration: 45min
        next: styling
      - label: "Child's Haircut (under 12)"
        price: 3000
        duration: 20min
        next: styling
      - label: "Buzz Cut"
        price: 2500
        duration: 15min
        next: styling

  styling:
    question: "Add styling service?"
    options:
      - label: "No styling"
        next: end
      - label: "Basic blow dry"
        price: 1500
        duration: 15min
        next: end
      - label: "Styling with product"
        price: 2500
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
        price: 9500
        duration: 90min
        next: add_cut
      - label: "Root touch-up"
        price: 7500
        duration: 60min
        next: add_cut
      - label: "Partial highlights"
        price: 12000
        duration: 2hr
        next: add_cut
      - label: "Full highlights"
        price: 17500
        duration: 2hr 30min
        next: add_cut
      - label: "Balayage"
        price: 20500
        duration: 2hr 30min
        next: add_cut
      - label: "Fashion/fantasy colors"
        price: 25000
        duration: 3hr
        next: add_cut

  add_cut:
    question: "Would you like to add a haircut?"
    options:
      - label: "No cut"
        next: treatment
      - label: "Add women's cut"
        price: 5000
        duration: 45min
        next: treatment
      - label: "Add men's cut"
        price: 3500
        duration: 30min
        next: treatment

  treatment:
    question: "Add a treatment?"
    options:
      - label: "No treatment"
        next: end
      - label: "Deep conditioning"
        price: 2500
        duration: 20min
        next: end
      - label: "Keratin treatment"
        price: 15000
        duration: 90min
        next: end
      - label: "Olaplex treatment"
        price: 4500
        duration: 30min
        next: end

  end:
    type: terminal
    action: book_appointment

rules:
  - if_service_includes: [color, cut]
    then: apply_combo_pricing`,
  },
  {
    name: "Bridal & Special Events",
    description: "Styling services for weddings and special occasions",
    dslContent: `name: Bridal & Special Events
root: event_type

nodes:
  event_type:
    question: "What type of event?"
    options:
      - label: "Bridal (bride)"
        price: 150
        duration: 2hr
        next: trial
      - label: "Bridal party member"
        price: 85
        duration: 1hr
        next: makeup
      - label: "Special event styling"
        price: 75
        duration: 1hr
        next: makeup
      - label: "Prom/formal"
        price: 65
        duration: 45min
        next: makeup

  trial:
    question: "Schedule a trial run?"
    options:
      - label: "No trial needed"
        next: makeup
      - label: "Add trial session"
        price: 100
        duration: 1hr 30min
        note: "Recommended for brides"
        next: makeup

  makeup:
    question: "Add makeup services?"
    options:
      - label: "No makeup"
        next: extensions
      - label: "Natural makeup"
        price: 60
        duration: 45min
        next: extensions
      - label: "Full glam makeup"
        price: 95
        duration: 1hr
        next: extensions
      - label: "Airbrush makeup"
        price: 125
        duration: 1hr 15min
        next: extensions

  extensions:
    question: "Add hair extensions?"
    options:
      - label: "No extensions"
        next: end
      - label: "Clip-in extensions"
        price: 50
        duration: 30min
        next: end
      - label: "Tape-in extensions"
        price: 200
        duration: 2hr
        next: end

  end:
    type: terminal
    action: book_appointment

rules: []`,
  },
  {
    name: "Spa & Treatment Services",
    description: "Hair treatments, scalp care, and wellness services",
    dslContent: `name: Spa & Treatment Services
root: treatment_type

nodes:
  treatment_type:
    question: "Select your treatment"
    options:
      - label: "Deep conditioning treatment"
        price: 45
        duration: 45min
        next: scalp
      - label: "Keratin smoothing treatment"
        price: 250
        duration: 2hr 30min
        next: scalp
      - label: "Brazilian blowout"
        price: 300
        duration: 3hr
        next: scalp
      - label: "Olaplex bond treatment"
        price: 65
        duration: 45min
        next: scalp
      - label: "Hair botox treatment"
        price: 180
        duration: 2hr
        next: scalp

  scalp:
    question: "Add scalp treatment?"
    options:
      - label: "No scalp treatment"
        next: style
      - label: "Scalp massage"
        price: 25
        duration: 20min
        next: style
      - label: "Scalp detox treatment"
        price: 55
        duration: 30min
        next: style
      - label: "Hot oil scalp treatment"
        price: 40
        duration: 30min
        next: style

  style:
    question: "Finish with styling?"
    options:
      - label: "Air dry"
        next: end
      - label: "Blow dry straight"
        price: 30
        duration: 30min
        next: end
      - label: "Blow dry with curls"
        price: 45
        duration: 45min
        next: end

  end:
    type: terminal
    action: book_appointment

rules: []`,
  },
];
