import { Product, ShoppingScenario, ShoppingSession } from "../types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-studioview-27",
    slug: "studioview-27-qhd",
    name: "StudioView 27 QHD Monitor",
    brand: "StudioView",
    category: "workspace",
    price: 179.99,
    priceMinor: 17999,
    currency: "USD",
    description: "27-inch 2560x1440 QHD IPS display with 165Hz refresh rate and factory color calibration, engineered for prolonged desk productivity.",
    rating: 4.8,
    reviewCount: 312,
    inStock: true,
    stockCount: 24,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=1200&auto=format&fit=crop&q=85",
    ],
    specifications: {
      Display: "27-inch IPS",
      Resolution: "2560 x 1440 (QHD)",
      "Refresh Rate": "165Hz",
      Brightness: "350 nits",
      Ports: "1x DP 1.4, 2x HDMI 2.0, Audio Out",
      Ergonomics: "Height, Tilt, Swivel, Pivot",
    },
    pros: [
      "Crisp text rendering ideal for code and documentation",
      "Smooth 165Hz motion reduces eye fatigue",
      "Fully adjustable ergonomic stand included",
    ],
    cons: [
      "Lacks integrated USB-C power delivery charging",
      "Built-in speakers are basic",
    ],
    highlights: ["165Hz IPS Panel", "Full Ergonomic Stand", "Anti-Glare Finish"],
  },
  {
    id: "prod-keychron-k2",
    slug: "keychron-k2-mechanical-keyboard",
    name: "Keychron K2 Mechanical Keyboard",
    brand: "Keychron",
    category: "workspace",
    price: 89.99,
    priceMinor: 8999,
    currency: "USD",
    description: "Compact 75% wireless mechanical keyboard engineered for Mac and Windows with hot-swappable tactile switches and double-shot PBT keycaps.",
    rating: 4.9,
    reviewCount: 540,
    inStock: true,
    stockCount: 38,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=85",
    ],
    specifications: {
      Layout: "75% Compact (84 keys)",
      Connectivity: "Bluetooth 5.1 & USB-C wired",
      Switches: "Gateron G Pro Mechanical (Tactile)",
      Battery: "4,000 mAh (up to 70 hours typing)",
      Compatibility: "macOS, Windows, iOS, Android",
    },
    pros: [
      "Satisfying tactile feedback with minimal hand travel",
      "Connects seamlessly with up to 3 devices",
      "Long battery endurance with USB-C passthrough",
    ],
    cons: [
      "Slightly tall chassis benefits from an optional palm rest",
      "No dedicated 2.4GHz USB dongle included",
    ],
    highlights: ["Wireless & Wired", "Mac & Windows Keycaps", "Hot-Swappable"],
  },
  {
    id: "prod-logitech-mx3s",
    slug: "logitech-mx-master-3s",
    name: "Logitech MX Master 3S",
    brand: "Logitech",
    category: "workspace",
    price: 99.99,
    priceMinor: 9999,
    currency: "USD",
    description: "Performance wireless ergonomic mouse featuring 8,000 DPI Darkfield tracking on any surface and whisper-quiet electromagnetic MagSpeed scrolling.",
    rating: 4.9,
    reviewCount: 928,
    inStock: true,
    stockCount: 52,
    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&auto=format&fit=crop&q=85",
    ],
    specifications: {
      Sensor: "Darkfield high precision (200 - 8000 DPI)",
      Scroll: "MagSpeed SmartShift electromagnetic",
      Buttons: "7 customizable buttons + thumb gesture",
      Battery: "Rechargeable Li-Po (500 mAh, up to 70 days)",
      Weight: "141g",
    },
    pros: [
      "Effortless silent clicks with precision feedback",
      "Tracks on glass and non-traditional surfaces",
      "Fast MagSpeed scroll navigates 1,000 lines per second",
    ],
    cons: [
      "Right-handed design only",
      "Premium price point for a desk mouse",
    ],
    highlights: ["MagSpeed Scrolling", "8K DPI Any-Surface", "Quiet Click Tech"],
  },
  {
    id: "prod-anker-hub",
    slug: "anker-usb-c-hub",
    name: "Anker USB-C 8-in-1 Power Hub",
    brand: "Anker",
    category: "accessories",
    price: 49.99,
    priceMinor: 4999,
    currency: "USD",
    description: "Sleek aluminum USB-C hub offering 100W Power Delivery pass-through, dual 4K HDMI outputs, Gigabit Ethernet, and high-speed SD card slots.",
    rating: 4.7,
    reviewCount: 284,
    inStock: true,
    stockCount: 65,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&auto=format&fit=crop&q=85",
    ],
    specifications: {
      "Power Delivery": "100W pass-through (85W to host)",
      Video: "Dual 4K@60Hz HDMI",
      Data: "2x USB-A 3.2 5Gbps, 1x USB-C 5Gbps",
      Networking: "1000Mbps Gigabit RJ45",
      Card: "SD & microSD 104MB/s",
    },
    pros: [
      "Single-cable laptop connectivity for desk cleanups",
      "Stays cool under continuous video streaming",
      "Compact aluminum travel shell",
    ],
    cons: [
      "Requires high-wattage external charger for full 85W output",
      "Short integrated cable",
    ],
    highlights: ["100W Power Delivery", "Dual 4K Support", "Gigabit Ethernet"],
  },
  {
    id: "prod-ergopro-chair",
    slug: "ergopro-executive-ergonomic-chair",
    name: "ErgoPro Executive Ergonomic Chair",
    brand: "ErgoPro",
    category: "furniture",
    price: 349.99,
    priceMinor: 34999,
    currency: "USD",
    description: "Commercial-grade ergonomic desk chair with self-adjusting dynamic lumbar support, breathable hybrid mesh weave, and 4D omni-directional armrests.",
    rating: 4.8,
    reviewCount: 196,
    inStock: true,
    stockCount: 15,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=85",
    ],
    specifications: {
      Material: "Elastomeric Breathable Mesh & Cast Aluminum",
      Lumbar: "Self-adaptive dynamic contour",
      Armrests: "4D (Height, depth, width, and pivot angle)",
      Recline: "90° to 135° with 4 locking positions",
      "Max Capacity": "300 lbs (BIFMA Certified)",
    },
    pros: [
      "Relieves lower back pressure during 8+ hour work sessions",
      "Fully ventilated mesh prevents heat buildup",
      "Heavy-duty aluminum wheelbase with smooth nylon casters",
    ],
    cons: [
      "Assembly required (tools and guide included)",
      "Firm seating feel may not suit plush cushion fans",
    ],
    highlights: ["Dynamic Lumbar", "Breathable Mesh", "4D Armrests"],
  },
  {
    id: "prod-visionpro-27-4k",
    slug: "visionpro-27-4k",
    name: "VisionPro 27 4K Pro Display",
    brand: "VisionPro",
    category: "workspace",
    price: 329.99,
    priceMinor: 32999,
    currency: "USD",
    description: "Ultra-sharp 3840x2160 4K UHD creative monitor featuring 99% DCI-P3 color reproduction and 65W USB-C single-cable connectivity.",
    rating: 4.8,
    reviewCount: 172,
    inStock: true,
    stockCount: 12,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=85",
    ],
    specifications: {
      Display: "27-inch 4K UHD IPS",
      Resolution: "3840 x 2160",
      "Color Accuracy": "99% DCI-P3 / 100% sRGB",
      Ports: "1x USB-C (65W PD), 2x HDMI 2.0, 1x DP 1.4",
      Brightness: "400 nits (HDR400)",
    },
    pros: [
      "Razor-sharp pixel density perfect for design and photo workflows",
      "USB-C provides display signal and laptop charging over one wire",
      "Factory calibrated with Delta E < 2",
    ],
    cons: [
      "60Hz refresh rate (not geared towards competitive gaming)",
      "Higher price than standard QHD panels",
    ],
    highlights: ["4K UHD Resolution", "99% DCI-P3 Color", "65W USB-C Charging"],
  },
  {
    id: "prod-audiocraft-anc",
    slug: "audiocraft-anc-headphones",
    name: "AudioCraft Studio ANC Headphones",
    brand: "AudioCraft",
    category: "audio",
    price: 129.99,
    priceMinor: 12999,
    currency: "USD",
    description: "Over-ear acoustic headphones engineered with hybrid active noise cancellation, custom 40mm biocellulose drivers, and up to 45 hours of playback.",
    rating: 4.7,
    reviewCount: 388,
    inStock: true,
    stockCount: 29,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=85",
    ],
    specifications: {
      Driver: "40mm Bio-cellulose dome",
      ANC: "Hybrid 4-mic cancellation (-38dB)",
      Battery: "45 hours (ANC on), USB-C quick charge",
      Bluetooth: "Bluetooth 5.3 with Multipoint",
      Weight: "235g ultra-lightweight",
    },
    pros: [
      "Blocks out office chatter and background street rumble",
      "Padded memory foam ear cushions for zero crown pressure",
      "Multipoint connects laptop and smartphone simultaneously",
    ],
    cons: [
      "No companion phone EQ app",
      "Folding case is slightly bulky in small bags",
    ],
    highlights: ["Hybrid ANC", "45h Battery Life", "Multipoint Audio"],
  },
  {
    id: "prod-lumaliving-lamp",
    slug: "lumaliving-desk-lamp",
    name: "LumaLiving Minimal Desk Lamp",
    brand: "LumaLiving",
    category: "accessories",
    price: 39.99,
    priceMinor: 3999,
    currency: "USD",
    description: "Architect-grade matte aluminum desk lamp with stepless color temperature control, circadian rhythm timer, and 15W Qi wireless phone charger.",
    rating: 4.6,
    reviewCount: 144,
    inStock: true,
    stockCount: 40,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=85",
    ],
    specifications: {
      Material: "Anodized Matte Aluminum",
      "Color Temp": "2700K - 6500K Stepless",
      Output: "800 Lumens (CRI > 95)",
      Extra: "Integrated 15W Qi Wireless Fast Charger Base",
    },
    pros: [
      "Natural CRI > 95 light prevents eye strain during night shifts",
      "Wireless charger keeps smartphone charged without extra cables",
      "Minimalist footprint leaves full desk space open",
    ],
    cons: [
      "Arm only folds vertically, does not pivot horizontally",
    ],
    highlights: ["Stepless Dimming", "Wireless Charging Base", "CRI 95+ LEDs"],
  },
  {
    id: "prod-voyage-bag",
    slug: "voyage-travel-bag",
    name: "Voyage Modular Tech Backpack",
    brand: "Voyage",
    category: "lifestyle",
    price: 79.99,
    priceMinor: 7999,
    currency: "USD",
    description: "Weatherproof Cordura travel backpack featuring an independent suspended 16-inch laptop compartment, luggage pass-through, and modular cable organizers.",
    rating: 4.8,
    reviewCount: 215,
    inStock: true,
    stockCount: 22,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&auto=format&fit=crop&q=85",
    ],
    specifications: {
      Capacity: "22L expandable to 28L",
      Laptop: "Padded sleeve fits up to 16-inch laptops",
      Fabric: "840D Ballistic Recycled Nylon with DWR coating",
      Weight: "1.1 kg",
    },
    pros: [
      "Weather-resistant zippers protect electronics during rain",
      "Clamshell opening for airport TSA security checks",
      "Hidden passport pocket against the lumbar back panel",
    ],
    cons: [
      "Structure remains relatively rigid even when partially empty",
    ],
    highlights: ["TSA Clamshell Check", "Ballistic Nylon", "Suspended Sleeve"],
  },
];

export const MOCK_SCENARIOS: ShoppingScenario[] = [
  {
    id: "scenario-home-office",
    title: "Home Office Setup",
    tagline: "Under $1,000",
    description: "QHD display, mechanical keyboard, precision mouse, USB-C hub, and ergonomic seating.",
    targetBudget: 1000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=85",
    category: "Workspace",
    prompt: "Home office setup under $1,000 with a monitor, keyboard, mouse, USB-C hub, and ergonomic chair.",
    featuredProducts: [
      MOCK_PRODUCTS[0], // StudioView 27
      MOCK_PRODUCTS[1], // Keychron K2
      MOCK_PRODUCTS[2], // MX Master 3S
      MOCK_PRODUCTS[3], // Anker Hub
      MOCK_PRODUCTS[4], // ErgoPro Chair
    ],
  },
  {
    id: "scenario-creative-pro",
    title: "Creative Studio",
    tagline: "Under $750",
    description: "Color-accurate 4K monitor paired with quiet wireless controls and hybrid ANC audio.",
    targetBudget: 750,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=85",
    category: "Creative",
    prompt: "Creative workstation under $750 with a 4K color-accurate monitor, quiet keyboard and mouse, and ANC headphones.",
    featuredProducts: [
      MOCK_PRODUCTS[5], // VisionPro 4K
      MOCK_PRODUCTS[1], // Keychron K2
      MOCK_PRODUCTS[2], // MX Master 3S
      MOCK_PRODUCTS[6], // AudioCraft ANC
    ],
  },
  {
    id: "scenario-travel-essentials",
    title: "Remote Travel Kit",
    tagline: "Under $350",
    description: "Weatherproof clamshell carry, noise-cancelling headphones, and 8-in-1 travel hub.",
    targetBudget: 350,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&auto=format&fit=crop&q=85",
    category: "Travel",
    prompt: "Remote travel essentials under $350 with a backpack, noise-cancelling headphones, and USB-C hub.",
    featuredProducts: [
      MOCK_PRODUCTS[8], // Voyage Bag
      MOCK_PRODUCTS[6], // AudioCraft ANC
      MOCK_PRODUCTS[3], // Anker Hub
    ],
  },
  {
    id: "scenario-desk-upgrade",
    title: "Everyday Desk",
    tagline: "Under $300",
    description: "Tactile wireless peripherals and eye-caring task lighting for a calmer workspace.",
    targetBudget: 300,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=85",
    category: "Lifestyle",
    prompt: "Upgrade my everyday desk under $300 with a mechanical keyboard, wireless mouse, and minimalist desk lamp.",
    featuredProducts: [
      MOCK_PRODUCTS[1], // Keychron K2
      MOCK_PRODUCTS[2], // MX Master 3S
      MOCK_PRODUCTS[7], // LumaLiving Lamp
    ],
  },
];

export const MOCK_RECENT_SESSIONS: ShoppingSession[] = [
  {
    id: "session-1",
    title: "Home Office Under $1,000",
    preview: "5 pieces",
    updatedAt: "Just now",
    itemCount: 5,
    initialPrompt: "Home office setup under $1,000 with a monitor, keyboard, mouse, and ergonomic chair.",
  },
  {
    id: "session-2",
    title: "Creative 4K Studio",
    preview: "4 pieces",
    updatedAt: "2 days ago",
    itemCount: 4,
    initialPrompt: "Creative workstation under $750 with a 4K monitor, quiet peripherals, and ANC headphones.",
  },
  {
    id: "session-3",
    title: "Remote Travel Kit",
    preview: "3 pieces",
    updatedAt: "Last week",
    itemCount: 3,
    initialPrompt: "Remote travel essentials under $350 with a backpack, ANC headphones, and USB-C hub.",
  },
];

export const MOCK_EXAMPLE_PROMPTS = [
  "Home office under $1,000",
  "4K creative desk under $750",
  "Remote travel essentials under $350",
  "Minimal everyday desk upgrade",
];

export function getMockResponseForPrompt(promptText: string) {
  const lower = promptText.toLowerCase();

  if (lower.includes("travel") || lower.includes("backpack") || lower.includes("portable")) {
    const products = [MOCK_PRODUCTS[8], MOCK_PRODUCTS[6], MOCK_PRODUCTS[3]];
    const total = products.reduce((acc, p) => acc + p.price, 0);
    return {
      text: "A compact travel setup built around durability, active noise cancellation, and single-hub connectivity.",
      products,
      comparison: [MOCK_PRODUCTS[6], MOCK_PRODUCTS[8]],
      budget: {
        total: Number(total.toFixed(2)),
        budget: 350,
        status: "under_budget" as const,
        difference: Number((350 - total).toFixed(2)),
        breakdown: products.map((p) => ({ label: p.name, amount: p.price })),
      },
    };
  }

  if (lower.includes("4k") || lower.includes("creative") || lower.includes("design") || lower.includes("photo")) {
    const products = [MOCK_PRODUCTS[5], MOCK_PRODUCTS[1], MOCK_PRODUCTS[2], MOCK_PRODUCTS[6]];
    const total = products.reduce((acc, p) => acc + p.price, 0);
    return {
      text: "A color-accurate 4K workstation paired with quiet tactile controls and hybrid ANC audio.",
      products,
      comparison: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[5]],
      budget: {
        total: Number(total.toFixed(2)),
        budget: 750,
        status: "under_budget" as const,
        difference: Number((750 - total).toFixed(2)),
        breakdown: products.map((p) => ({ label: p.name, amount: p.price })),
      },
    };
  }

  if (lower.includes("desk") || lower.includes("lamp") || lower.includes("upgrade")) {
    const products = [MOCK_PRODUCTS[1], MOCK_PRODUCTS[2], MOCK_PRODUCTS[7]];
    const total = products.reduce((acc, p) => acc + p.price, 0);
    return {
      text: "A focused desk upgrade prioritizing typing feel, wrist comfort, and balanced lighting.",
      products,
      comparison: [MOCK_PRODUCTS[1], MOCK_PRODUCTS[2]],
      budget: {
        total: Number(total.toFixed(2)),
        budget: 300,
        status: "under_budget" as const,
        difference: Number((300 - total).toFixed(2)),
        breakdown: products.map((p) => ({ label: p.name, amount: p.price })),
      },
    };
  }

  // Default Home Office setup
  const products = [
    MOCK_PRODUCTS[0], // StudioView 27 QHD ($179.99)
    MOCK_PRODUCTS[1], // Keychron K2 ($89.99)
    MOCK_PRODUCTS[2], // MX Master 3S ($99.99)
    MOCK_PRODUCTS[3], // Anker Hub ($49.99)
    MOCK_PRODUCTS[4], // ErgoPro Chair ($349.99)
  ];
  const total = products.reduce((acc, p) => acc + p.price, 0); // 769.95

  return {
    text: "A balanced 5-piece home office setup combining ergonomics, crisp QHD clarity, and lasting comfort well under $1,000.",
    products,
    comparison: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[5]],
    budget: {
      total: Number(total.toFixed(2)),
      budget: 1000,
      status: "under_budget" as const,
      difference: Number((1000 - total).toFixed(2)),
      breakdown: products.map((p) => ({ label: p.name, amount: p.price })),
    },
  };
}
