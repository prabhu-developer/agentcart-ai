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
    title: "Home Office Setup Under $1,000",
    tagline: "Productivity & Ergonomics",
    description: "Curated 5-piece setup designed for software engineers, designers, and remote professionals needing comfort and high output.",
    targetBudget: 1000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=85",
    category: "Workspace",
    prompt: "I need a complete home office setup under $1,000. I need a monitor, keyboard, mouse, USB-C hub, and an ergonomic chair. Prioritize quality, reliability, and value.",
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
    title: "Creative & Coding Workstation",
    tagline: "4K Clarity & Precision Audio",
    description: "Color-accurate 4K display, high-precision tactile input, and active noise isolation for focused creative deep-work sessions.",
    targetBudget: 750,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=85",
    category: "Creative",
    prompt: "Recommend a creative workstation setup under $750 with a 4K color-accurate monitor, quiet input devices, and studio ANC headphones.",
    featuredProducts: [
      MOCK_PRODUCTS[5], // VisionPro 4K
      MOCK_PRODUCTS[1], // Keychron K2
      MOCK_PRODUCTS[2], // MX Master 3S
      MOCK_PRODUCTS[6], // AudioCraft ANC
    ],
  },
  {
    id: "scenario-travel-essentials",
    title: "Remote Worker Travel Kit",
    tagline: "Portability & Power",
    description: "Packable tech gear to work efficiently from anywhere in the world without hauling heavy equipment.",
    targetBudget: 350,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&auto=format&fit=crop&q=85",
    category: "Travel",
    prompt: "Plan my travel essentials under $350. I need a modular backpack, noise cancelling headphones, and a reliable multi-port USB hub.",
    featuredProducts: [
      MOCK_PRODUCTS[8], // Voyage Bag
      MOCK_PRODUCTS[6], // AudioCraft ANC
      MOCK_PRODUCTS[3], // Anker Hub
    ],
  },
  {
    id: "scenario-desk-upgrade",
    title: "Everyday Tech Desk Refresh",
    tagline: "Minimal & Functional",
    description: "Elevate your existing desk with premium tactile peripherals, intelligent lighting, and an ergonomic pointer.",
    targetBudget: 300,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=85",
    category: "Lifestyle",
    prompt: "Upgrade my everyday tech desk setup under $300 with a mechanical keyboard, wireless mouse, and a minimalist eye-caring desk lamp.",
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
    title: "Home Office Setup Under $1,000",
    preview: "5 items · Monitor, Keychron K2, MX Master 3S, Chair, Hub",
    updatedAt: "Just now",
    itemCount: 5,
    initialPrompt: "I need a complete home office setup under $1,000. I need a monitor, keyboard, mouse and ergonomic chair. Prioritize quality, reliability and value for money.",
  },
  {
    id: "session-2",
    title: "Creative 4K Workspace",
    preview: "4 items · VisionPro 4K, AudioCraft ANC, MX Master 3S",
    updatedAt: "2 days ago",
    itemCount: 4,
    initialPrompt: "Recommend a creative workstation setup under $750 with a 4K color-accurate monitor, quiet input devices, and studio ANC headphones.",
  },
  {
    id: "session-3",
    title: "Remote Travel Essentials",
    preview: "3 items · Tech Backpack, ANC Headphones, Multi-Hub",
    updatedAt: "Last week",
    itemCount: 3,
    initialPrompt: "Plan my travel essentials under $350. I need a modular backpack, noise cancelling headphones, and a reliable multi-port USB hub.",
  },
];

export const MOCK_EXAMPLE_PROMPTS = [
  "Build my home office under $1,000",
  "Find the best gaming setup for my budget",
  "Plan my travel essentials for remote work",
  "Upgrade my everyday desk tech with premium gear",
];

export function getMockResponseForPrompt(promptText: string) {
  const lower = promptText.toLowerCase();

  if (lower.includes("travel") || lower.includes("backpack") || lower.includes("portable")) {
    const products = [MOCK_PRODUCTS[8], MOCK_PRODUCTS[6], MOCK_PRODUCTS[3]];
    const total = products.reduce((acc, p) => acc + p.price, 0);
    return {
      text: "Here is a balanced travel and remote mobility setup. Every item is compact, resilient, and keeps your mobile workstation organized across flights, cafes, and co-working spaces.",
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
      text: "I have curated a specialized creative workstation setup. The centerpiece is the VisionPro 27 4K display with 99% DCI-P3 color accuracy, paired with silent tactile controls and hybrid ANC audio for deep focus.",
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
      text: "Here is an everyday desk upgrade package. It focuses on your most frequent daily touchpoints: mechanical typing comfort, wrist fatigue reduction, and high-CRI flicker-free illumination.",
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
    text: "I analyzed your requirements for a comprehensive home office setup. I prioritized build quality, ergonomic posture, and high value for money. Here is an optimized 5-piece recommendation that remains comfortably under your $1,000 budget.",
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
