import { useState } from "react";

// ─── RISK MODEL DATA ─────────────────────────────────────────────────────────

const weights = {
  zipBaseline: { gradeRisk: 0.45, costNorm: 0.35, walkRisk: 0.12, densityNorm: 0.08 },
  finalScore:  { zipBaseline: 0.70, housingRisk: 0.15, visibilityRisk: 0.15 }
};

const mappings = {
  crimeGradeToRisk: {
    "A+": 2, "A": 5, "A-": 8,
    "B+": 15, "B": 20, "B-": 25,
    "C+": 35, "C": 42, "C-": 50,
    "D+": 60, "D": 68, "D-": 75,
    "F": 92
  },
  walkabilityToRisk: {
    "1 - 5.75 (Least Walkable)": 20,
    "5.76 - 10.50 (Below Average Walkable)": 45,
    "10.51 - 15.25 (Above Average Walkable)": 70,
    "15.26 - 20 (Most Walkable)": 90
  },
  housingTypeToRisk: { "House": 35, "Townhome": 50, "Condo": 60, "Apartment": 80 },
  visibilityToRisk:  { "Very Visible": 90, "Partially Hidden": 55, "Well Hidden": 20 }
};

const normalization = {
  crimeCost: { min: 159, max: 1520 },
  density:   { min: 2.3, max: 8922.2 }
};

const zipData = {
  "37010": { grade: "A",  cost: 159, walkability: "1 - 5.75 (Least Walkable)",              density: 170.3   },
  "37013": { grade: "D",  cost: 625, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 2267.4  },
  "37015": { grade: "B",  cost: 213, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 488.4   },
  "37022": { grade: "B-", cost: 180, walkability: "1 - 5.75 (Least Walkable)",              density: 99.5    },
  "37027": { grade: "D+", cost: 427, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 1163.9  },
  "37064": { grade: "B-", cost: 271, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 461.6   },
  "37066": { grade: "C",  cost: 241, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 913     },
  "37067": { grade: "C+", cost: 298, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 2132.3  },
  "37069": { grade: "C+", cost: 298, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 2789.7  },
  "37072": { grade: "D-", cost: 506, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 1182.9  },
  "37075": { grade: "C+", cost: 280, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 1071    },
  "37076": { grade: "D",  cost: 526, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 2782.4  },
  "37086": { grade: "B-", cost: 287, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 2247.3  },
  "37087": { grade: "C-", cost: 286, walkability: "1 - 5.75 (Least Walkable)",              density: 191.1   },
  "37115": { grade: "F",  cost: 809, walkability: "15.26 - 20 (Most Walkable)",             density: 3270    },
  "37116": { grade: "F",  cost: 809, walkability: "15.26 - 20 (Most Walkable)",             density: 3270    },
  "37122": { grade: "C+", cost: 263, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 1182.9  },
  "37127": { grade: "C-", cost: 307, walkability: "1 - 5.75 (Least Walkable)",              density: 469.4   },
  "37128": { grade: "C-", cost: 307, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 5787    },
  "37129": { grade: "C-", cost: 307, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 2146.3  },
  "37130": { grade: "C-", cost: 307, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 5728.5  },
  "37132": { grade: "C-", cost: 307, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 5728.5  },
  "37138": { grade: "D",  cost: 539, walkability: "1 - 5.75 (Least Walkable)",              density: 1288.1  },
  "37143": { grade: "B-", cost: 279, walkability: "1 - 5.75 (Least Walkable)",              density: 51      },
  "37148": { grade: "C-", cost: 400, walkability: "1 - 5.75 (Least Walkable)",              density: 959.4   },
  "37172": { grade: "D+", cost: 316, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 1605.2  },
  "37179": { grade: "B",  cost: 207, walkability: "1 - 5.75 (Least Walkable)",              density: 1105.1  },
  "37184": { grade: "B",  cost: 186, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 46.2    },
  "37201": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 6054    },
  "37203": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 8922.2  },
  "37204": { grade: "D",  cost: 424, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 3761.8  },
  "37205": { grade: "D",  cost: 424, walkability: "1 - 5.75 (Least Walkable)",              density: 1360.6  },
  "37206": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 5215.9  },
  "37207": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 2269.1  },
  "37208": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 4689.7  },
  "37209": { grade: "D",  cost: 424, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 3304.3  },
  "37210": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 1437.4  },
  "37211": { grade: "D",  cost: 424, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 4304.1  },
  "37212": { grade: "D",  cost: 424, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 6622.3  },
  "37213": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 2623.3  },
  "37214": { grade: "D",  cost: 424, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 1408.9  },
  "37215": { grade: "D",  cost: 424, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 3056.3  },
  "37216": { grade: "D",  cost: 424, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 3529.6  },
  "37217": { grade: "D",  cost: 424, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 2.3     },
  "37218": { grade: "D",  cost: 424, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 1450.5  },
  "37219": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 6054    },
  "37220": { grade: "D",  cost: 424, walkability: "5.76 - 10.50 (Below Average Walkable)",  density: 1876.6  },
  "37221": { grade: "D",  cost: 424, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 3234.6  },
  "37228": { grade: "D",  cost: 424, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 1800.2  },
  "37229": { grade: "D",  cost: 424, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 1408.9  },
  "37230": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 6054    },
  "37232": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 8339.6  },
  "37234": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 6054    },
  "37235": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 8339.6  },
  "37236": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 8922.2  },
  "37238": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 6054    },
  "37240": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 8339.6  },
  "37241": { grade: "D",  cost: 424, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 1408.9  },
  "37242": { grade: "D",  cost: 424, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 6054    },
  "37243": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 6054    },
  "37244": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 6054    },
  "37246": { grade: "D",  cost: 424, walkability: "15.26 - 20 (Most Walkable)",             density: 5858.2  },
  "37250": { grade: "D",  cost: 424, walkability: "10.51 - 15.25 (Above Average Walkable)", density: 1408.9  }
};

const validZipCodes = Object.keys(zipData).sort();

function normalize(value, min, max) {
  return Math.round(((value - min) / (max - min)) * 100);
}

function calculateZipBaseline(zip) {
  const data = zipData[zip];
  if (!data) return null;
  const gradeRisk   = mappings.crimeGradeToRisk[data.grade] || 50;
  const costNorm    = normalize(data.cost, normalization.crimeCost.min, normalization.crimeCost.max);
  const walkRisk    = mappings.walkabilityToRisk[data.walkability] || 50;
  const densityNorm = normalize(data.density, normalization.density.min, normalization.density.max);
  const baseline    = Math.round(
    gradeRisk   * weights.zipBaseline.gradeRisk   +
    costNorm    * weights.zipBaseline.costNorm     +
    walkRisk    * weights.zipBaseline.walkRisk     +
    densityNorm * weights.zipBaseline.densityNorm
  );
  return { baseline, gradeRisk, costNorm, walkRisk, densityNorm, grade: data.grade, walkability: data.walkability };
}

function calculateRiskScore(zipCode, housingType, visibility) {
  const zipBaseline    = calculateZipBaseline(zipCode);
  const housingRisk    = mappings.housingTypeToRisk[housingType]  || 50;
  const visibilityRisk = mappings.visibilityToRisk[visibility]    || 55;
  const hasZipData     = !!zipBaseline;

  let score = hasZipData
    ? Math.round(zipBaseline.baseline * weights.finalScore.zipBaseline + housingRisk * weights.finalScore.housingRisk + visibilityRisk * weights.finalScore.visibilityRisk)
    : Math.round(housingRisk * 0.5 + visibilityRisk * 0.5);

  score = Math.max(0, Math.min(100, score));
  const tier = score <= 39 ? "Low" : score <= 69 ? "Medium" : "High";

  return {
    score, tier, hasZipData,
    components: {
      zipBaseline:   zipBaseline?.baseline   || null,
      housingRisk,
      visibilityRisk,
      gradeRisk:    zipBaseline?.gradeRisk   || null,
      costNorm:     zipBaseline?.costNorm    || null,
      walkRisk:     zipBaseline?.walkRisk    || null,
      densityNorm:  zipBaseline?.densityNorm || null
    },
    zipInfo: zipBaseline ? { grade: zipBaseline.grade, walkability: zipBaseline.walkability } : null
  };
}

// ─── ICON SVGs (inline, no library needed) ───────────────────────────────────

const Icon = ({ d, size = 20, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  package:     "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M16 8h-2a2 2 0 0 0-2 2v1M12 8v5M8 8h2",
  packageBox:  "M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  shield:      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  mapPin:      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  home:        "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  building2:   "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4",
  building:    "M2 20h20 M5 20V8l7-6 7 6v12 M9 20V14h6v6",
  warehouse:   "M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35z M6 18h12 M6 14h12 M6 10h12",
  eye:         "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff:      "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22",
  trees:       "M17 14c0-4.4-3.6-8-8-8S1 9.6 1 14 M17 14h4 M17 14c0 2.5 1.2 4 4 6 M1 14c0 2.5-1.2 4-4 6 M9 6V2 M5 8l-1-3 M13 8l1-3",
  zap:         "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  barChart:    "M18 20V10 M12 20V4 M6 20v-6",
  arrowRight:  "M5 12h14 M12 5l7 7-7 7",
  arrowUp:     "M12 19V5 M5 12l7-7 7 7",
  arrowLeft:   "M19 12H5 M12 19l-7-7 7-7",
  calculator:  "M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M8 6h8 M8 12h8 M8 18h8",
  mail:        "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3",
  alertTri:    "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  info:        "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01",
  bell:        "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  camera:      "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  users:       "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  lock:        "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  lightbulb:   "M9 18h6 M10 22h4 M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 0 0-12 0c0 1.34.47 2.58 1.24 3.56.76.78 1.23 1.54 1.41 2.44",
  share:       "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13",
  chevDown:    "M6 9l6 6 6-6",
  chevUp:      "M18 15l-6-6-6 6",
  database:    "M12 2C6.48 2 2 4.69 2 8v4c0 3.31 4.48 6 10 6s10-2.69 10-6V8c0-3.31-4.48-6-10-6z M2 8c0 3.31 4.48 6 10 6s10-2.69 10-6 M2 12v4c0 3.31 4.48 6 10 6s10-2.69 10-6v-4",
  trending:    "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  footprints:  "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0z M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 8 14 9.8 14 11.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 1 4 0z",
  shieldAlert: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01",
};

const Ico = ({ name, size = 18, className = "", color }) => (
  <Icon d={icons[name] || icons.info} size={size} className={className} color={color} />
);

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fff; }

  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 12px; font-weight: 600;
    font-size: 15px; border: none; cursor: pointer; transition: all .18s;
    text-decoration: none;
  }
  .btn-primary { background: #0f172a; color: #fff; }
  .btn-primary:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,23,42,.25); }
  .btn-outline { background: transparent; color: #0f172a; border: 2px solid #e2e8f0; }
  .btn-outline:hover { background: #f8fafc; }
  .btn-white { background: #fff; color: #0f172a; }
  .btn-white:hover { background: #f1f5f9; }
  .btn-lg { padding: 14px 32px; font-size: 17px; border-radius: 14px; }
  .btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  .input {
    width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px;
    font-size: 16px; font-family: 'DM Sans', sans-serif; outline: none; transition: border .2s;
    background: #fff;
  }
  .input:focus { border-color: #3b82f6; }
  .input.error { border-color: #ef4444; }

  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; }
  .badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }

  /* Animations */
  @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp .5s ease forwards; }
  .fade-up-1 { animation: fadeUp .5s .1s ease both; }
  .fade-up-2 { animation: fadeUp .5s .2s ease both; }
  .fade-up-3 { animation: fadeUp .5s .3s ease both; }
  .fade-up-4 { animation: fadeUp .5s .4s ease both; }

  /* Layout */
  .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
  .section { padding: 80px 0; }

  /* Score ring */
  .score-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-ring .score-label { position: absolute; text-align: center; }
`;

// ─── LAYOUT ───────────────────────────────────────────────────────────────────

function Header({ page: _page, setPage }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid #e2e8f0"
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, border: "none", background: "none", cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico name="packageBox" size={18} color="#fff" />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a", lineHeight: 1.2 }}>PorchScore</div>
            <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.2 }}>powered by Pop Block</div>
          </div>
        </button>

        <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <button onClick={() => setPage("methodology")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#64748b" }}>
            How It Works
          </button>
          <button onClick={() => setPage("home")} className="btn btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
            Check Risk
          </button>
        </nav>
      </div>
    </header>
  );
}

function Footer({ setPage }) {
  return (
    <footer style={{ background: "#0f172a", color: "#fff", padding: "60px 0 32px" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: "#3b82f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico name="packageBox" size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>PorchScore</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>powered by Pop Block</div>
              </div>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 300, lineHeight: 1.6 }}>
              Know your package theft risk and protect your deliveries with personalized recommendations.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Product</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14, textAlign: "left" }}>Risk Check</button>
              <button onClick={() => setPage("methodology")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14, textAlign: "left" }}>Methodology</button>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Stay Updated</div>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 10 }}>Get theft prevention tips</p>
            <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "#60a5fa", fontSize: 14 }}>
              Join mailing list →
            </button>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#64748b", fontSize: 13 }}>© {new Date().getFullYear()} PorchScore by Pop Block. All rights reserved.</p>
          <p style={{ color: "#64748b", fontSize: 13 }}>Data-driven package protection</p>
        </div>
      </div>
    </footer>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HeroSection({ setPage, setResultData }) {
  const [step, setStep]               = useState(1);
  const [zipCode, setZipCode]         = useState("");
  const [dwelling, setDwelling]       = useState("");
  const [visibility, setVisibility]   = useState("");
  const [zipError, setZipError]       = useState("");
  const [zipWarning, setZipWarning]   = useState(false);

  const dwellingTypes = [
    { value: "House",     label: "House",     icon: "home"      },
    { value: "Townhome",  label: "Townhome",  icon: "building"  },
    { value: "Condo",     label: "Condo",     icon: "building2" },
    { value: "Apartment", label: "Apartment", icon: "warehouse" },
  ];

  const visibilityOptions = [
    { value: "Very Visible",     label: "Very Visible",     icon: "eye",    desc: "Seen from street"     },
    { value: "Partially Hidden", label: "Partially Hidden", icon: "eyeOff", desc: "Somewhat concealed"   },
    { value: "Well Hidden",      label: "Well Hidden",      icon: "trees",  desc: "Not visible from road" },
  ];

  const handleZipChange = (val) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 5);
    setZipCode(cleaned);
    setZipError("");
    setZipWarning(false);
  };

  const validateAndContinue = () => {
    if (zipCode.length !== 5) { setZipError("Please enter a 5-digit zip code"); return; }
    if (!validZipCodes.includes(zipCode)) setZipWarning(true);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!dwelling || !visibility) return;
    const result = calculateRiskScore(zipCode, dwelling, visibility);
    setResultData({ result, zipCode, dwelling, visibility });
    setPage("results");
  };

  return (
    <section style={{
      background: "linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 40%, #f8fafc 100%)",
      padding: "80px 0 100px", minHeight: "85vh", display: "flex", alignItems: "center"
    }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        {/* Left: copy */}
        <div className="fade-up">
          <span className="badge" style={{ background: "#dbeafe", color: "#1d4ed8", marginBottom: 20 }}>
            Nashville Beta
          </span>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 52, lineHeight: 1.1, color: "#0f172a", marginBottom: 20 }}>
            Is your porch a target?
          </h1>
          <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
            Get a personalized package theft risk score based on your Nashville neighborhood, housing type, and delivery visibility.
          </p>
          <div style={{ display: "flex", gap: 32 }}>
            {[["60+", "Zip Codes"], ["3", "Data Inputs"], ["30s", "Instant Results"]].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{val}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form card */}
        <div className="card fade-up-1" style={{ padding: 32, boxShadow: "0 20px 60px rgba(15,23,42,.12)" }}>
          {/* Step indicators */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 99,
                background: s <= step ? "#3b82f6" : "#e2e8f0",
                transition: "background .3s"
              }} />
            ))}
          </div>

          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Enter your zip code</h3>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>We cover 60+ Nashville area zip codes.</p>
              <div style={{ position: "relative", marginBottom: 6 }}>
                <Ico name="mapPin" size={18} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  className={`input ${zipError ? "error" : ""}`}
                  style={{ paddingLeft: 44, fontSize: 18 }}
                  placeholder="e.g. 37027"
                  value={zipCode}
                  onChange={e => handleZipChange(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && validateAndContinue()}
                />
              </div>
              {zipError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{zipError}</p>}
              {zipWarning && (
                <p style={{ color: "#f59e0b", fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Ico name="alertTri" size={14} /> Zip not in dataset — score will use only your property inputs.
                </p>
              )}
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px" }} onClick={validateAndContinue}>
                Continue <Ico name="arrowRight" size={16} color="#fff" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Your housing type</h3>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Different properties have different risk profiles.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {dwellingTypes.map(t => (
                  <button key={t.value} onClick={() => setDwelling(t.value)} style={{
                    padding: "16px 14px", borderRadius: 14,
                    border: `2px solid ${dwelling === t.value ? "#3b82f6" : "#e2e8f0"}`,
                    background: dwelling === t.value ? "#eff6ff" : "#fff",
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, transition: "all .18s"
                  }}>
                    <Ico name={t.icon} size={22} color={dwelling === t.value ? "#3b82f6" : "#94a3b8"} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: dwelling === t.value ? "#1d4ed8" : "#374151" }}>{t.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: "0 0 auto" }}>
                  <Ico name="arrowLeft" size={16} /> Back
                </button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={!dwelling} onClick={() => setStep(3)}>
                  Continue <Ico name="arrowRight" size={16} color="#fff" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Delivery visibility</h3>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>How visible is your typical delivery spot from the street?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {visibilityOptions.map(v => (
                  <button key={v.value} onClick={() => setVisibility(v.value)} style={{
                    padding: "14px 18px", borderRadius: 14,
                    border: `2px solid ${visibility === v.value ? "#3b82f6" : "#e2e8f0"}`,
                    background: visibility === v.value ? "#eff6ff" : "#fff",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all .18s"
                  }}>
                    <Ico name={v.icon} size={20} color={visibility === v.value ? "#3b82f6" : "#94a3b8"} />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: visibility === v.value ? "#1d4ed8" : "#374151" }}>{v.label}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{v.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-outline" onClick={() => setStep(2)} style={{ flex: "0 0 auto" }}>
                  <Ico name="arrowLeft" size={16} /> Back
                </button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={!visibility} onClick={handleSubmit}>
                  Get My PorchScore <Ico name="arrowRight" size={16} color="#fff" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const blocks = [
    { icon: "zap",      title: "Instant Results",      desc: "Get your risk score in under 30 seconds. No waiting, no complicated forms." },
    { icon: "mapPin",   title: "Location Intelligence", desc: "We analyze multiple data sources to give you the most accurate picture of your area." },
    { icon: "barChart", title: "Data-Driven",           desc: "Our scoring model uses real crime statistics and area characteristics for accurate assessments." },
    { icon: "shield",   title: "Actionable Insights",   desc: "Get personalized recommendations based on your specific property type and location." },
  ];
  return (
    <section className="section" style={{ background: "#fff" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, marginBottom: 14 }}>Powered by Data</h2>
          <p style={{ color: "#64748b", fontSize: 17, maxWidth: 520, margin: "0 auto" }}>
            Our platform combines multiple data sources to deliver accurate, actionable risk assessments.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 28 }}>
          {blocks.map((b, i) => (
            <div key={i} className="card" style={{ padding: 28 }}>
              <div style={{ width: 48, height: 48, background: "#eff6ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Ico name={b.icon} size={22} color="#3b82f6" />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{b.title}</h4>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: "mapPin",     num: "01", title: "Enter your zip code",        desc: "We have data for 60+ Nashville area zip codes with crime grades, costs, walkability, and density metrics." },
    { icon: "home",       num: "02", title: "Select your housing type",   desc: "Houses, townhomes, condos, and apartments each have different theft risk profiles based on delivery exposure." },
    { icon: "eye",        num: "03", title: "Rate delivery visibility",   desc: "How visible is your delivery spot from the street? This impacts opportunity for theft." },
    { icon: "calculator", num: "04", title: "Get your PorchScore",        desc: "We calculate a 0–100 score: 70% zip baseline + 15% housing + 15% visibility, with actionable recommendations." },
  ];
  return (
    <section className="section" style={{ background: "#f8fafc" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, marginBottom: 14 }}>How it works</h2>
          <p style={{ color: "#64748b", fontSize: 17 }}>Three inputs, one clear score — powered by real Nashville crime data</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 28 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 12 }}>{s.num}</div>
              <div style={{ width: 44, height: 44, background: "#0f172a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Ico name={s.icon} size={20} color="#fff" />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</h4>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{s.desc}</p>
              {i < 3 && (
                <div style={{ position: "absolute", right: -14, top: 36, color: "#cbd5e1" }}>
                  <Ico name="arrowRight" size={16} color="#cbd5e1" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MailingListSection() {
  const [email, setEmail]       = useState("");
  const [submitted, setSubmit]  = useState(false);
  return (
    <section className="section" style={{ background: "#fff" }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <div style={{ background: "linear-gradient(135deg, #eff6ff, #eef2ff)", borderRadius: 28, padding: "56px 48px", textAlign: "center", border: "1px solid #dbeafe" }}>
          <div style={{ width: 56, height: 56, background: "#dbeafe", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Ico name="mail" size={26} color="#3b82f6" />
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, marginBottom: 12 }}>Get Package Protection Tips</h2>
          <p style={{ color: "#64748b", fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Join our mailing list for monthly theft prevention tips, local crime trends, and updates when we expand to new cities.
          </p>
          {!submitted ? (
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className="input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && email && setSubmit(true)}
              />
              <button className="btn btn-primary" disabled={!email} onClick={() => setSubmit(true)} style={{ whiteSpace: "nowrap" }}>
                Subscribe
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#16a34a", fontWeight: 600 }}>
              <Ico name="checkCircle" size={20} color="#16a34a" /> You&apos;re subscribed!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CTASection({ scrollToTop }) {
  return (
    <section style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", padding: "80px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
        <div style={{ position: "absolute", top: 0, left: "25%", width: 400, height: 400, background: "#3b82f6", borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: 0, right: "25%", width: 400, height: 400, background: "#6366f1", borderRadius: "50%", filter: "blur(80px)" }} />
      </div>
      <div className="container" style={{ textAlign: "center", position: "relative" }}>
        <div style={{ width: 64, height: 64, background: "rgba(59,130,246,.2)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
          <Ico name="packageBox" size={30} color="#60a5fa" />
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 44, color: "#fff", marginBottom: 18 }}>Ready to check your risk?</h2>
        <p style={{ color: "#94a3b8", fontSize: 17, maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.6 }}>
          Get your Nashville package theft risk score in seconds.
        </p>
        <button className="btn btn-white btn-lg" onClick={scrollToTop}>
          Get My PorchScore <Ico name="arrowUp" size={18} />
        </button>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 18 }}>Nashville Beta · 60+ Zip Codes · Instant Results</p>
      </div>
    </section>
  );
}

function HomePage({ setPage, setResultData }) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <>
      <HeroSection setPage={setPage} setResultData={setResultData} />
      <TrustSection />
      <HowItWorks />
      <MailingListSection />
      <CTASection scrollToTop={scrollToTop} />
    </>
  );
}

// ─── RESULTS PAGE ─────────────────────────────────────────────────────────────

function ScoreRing({ score, tier }) {
  const size = 200;
  const radius = 80;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const tierColor = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" }[tier] || "#3b82f6";

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={14} />
        <circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke={tierColor} strokeWidth={14}
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="score-label">
        <div style={{ fontSize: 42, fontWeight: 800, color: tierColor, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{tier} Risk</div>
      </div>
    </div>
  );
}

function ResultsPage({ resultData, setPage }) {
  const { result, zipCode, dwelling, visibility } = resultData;
  const [email, setEmail]         = useState("");
  const [submitted, setSubmitted] = useState(false);

  const tierConfig = {
    Low:    { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", label: "Low Risk" },
    Medium: { bg: "#fffbeb", border: "#fde68a", text: "#d97706", label: "Medium Risk" },
    High:   { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", label: "High Risk" },
  }[result.tier];

  const recommendations = [
    { cat: "Quick Wins",     icon: "bell",     items: ["Request carriers leave packages in less visible areas", "Schedule deliveries when you'll be home", "Require signature for valuable items"] },
    { cat: "Deterrents",     icon: "camera",   items: ["Install a video doorbell camera", "Add a lockable package box", "Improve porch lighting with motion sensors"] },
    { cat: "Community",      icon: "users",    items: ["Coordinate with neighbors for mutual package-watching", "Join or start a neighborhood watch program"] },
    { cat: "Pickup Options", icon: "mapPin",   items: ["Use Amazon Locker or similar secure pickup", "Ship to your workplace", "Use carrier pickup locations (UPS, FedEx, USPS)"] },
  ];

  const [openCat, setOpenCat] = useState([0]);
  const toggleCat = (i) => setOpenCat(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const factors = [
    { label: "Area Theft Reports", value: result.components.gradeRisk  || 50, icon: "trending" },
    { label: "Foot Traffic Level", value: result.components.walkRisk   || 50, icon: "footprints" },
    { label: "Property Type",      value: result.components.housingRisk,      icon: "home" },
    { label: "Delivery Visibility",value: result.components.visibilityRisk,   icon: "eye" },
  ];

  const getImpact = (v) => v >= 70 ? { label: "High",   bg: "#fef2f2", color: "#dc2626" }
                          : v >= 40 ? { label: "Medium", bg: "#fffbeb", color: "#d97706" }
                          :           { label: "Low",    bg: "#f0fdf4", color: "#15803d" };

  return (
    <main style={{ background: "linear-gradient(160deg,#f8fafc,#eff6ff)", minHeight: "100vh", padding: "48px 0 80px" }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <button onClick={() => setPage("home")} className="btn btn-outline" style={{ marginBottom: 28, fontSize: 14 }}>
          <Ico name="arrowLeft" size={15} /> Back
        </button>

        {/* Score header */}
        <div className="card fade-up" style={{ padding: 40, marginBottom: 24, display: "flex", gap: 48, alignItems: "center", boxShadow: "0 12px 40px rgba(15,23,42,.09)" }}>
          <ScoreRing score={result.score} tier={result.tier} />
          <div style={{ flex: 1 }}>
            <span className="badge" style={{ background: tierConfig.bg, color: tierConfig.text, border: `1px solid ${tierConfig.border}`, fontSize: 13, marginBottom: 12 }}>
              {tierConfig.label}
            </span>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, marginBottom: 8 }}>Your PorchScore is {result.score}</h1>
            <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
              Based on zip code <strong>{zipCode || "unknown"}</strong>, a <strong>{dwelling}</strong>, and <strong>{visibility.toLowerCase()}</strong> delivery placement.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 18px" }}>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Zip Grade</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{result.zipInfo?.grade || "N/A"}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 18px" }}>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Walkability</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{result.zipInfo?.walkability?.split("(")[0]?.trim() || "N/A"}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 18px" }}>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Zip Data</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{result.hasZipData ? "Included" : "Not in dataset"}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Risk breakdown */}
          <div className="card fade-up-1" style={{ padding: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Risk Breakdown</h3>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Key factors that influenced your score</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {factors.map((f, i) => {
                const imp = getImpact(f.value);
                const pct = f.value;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
                        <Ico name={f.icon} size={14} color="#94a3b8" /> {f.label}
                      </div>
                      <span className="badge" style={{ background: imp.bg, color: imp.color, fontSize: 11 }}>{imp.label}</span>
                    </div>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: imp.color, borderRadius: 99, transition: "width 1s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <div style={{ marginTop: 24, background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <Ico name="info" size={16} color="#94a3b8" />
                <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                  This score is a probabilistic estimate based on available data, not a guarantee. Use it as one input in your decision-making.
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card fade-up-2" style={{ padding: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Recommended Actions</h3>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Practical steps to reduce your risk</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recommendations.map((r, i) => (
                <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                  <button
                    onClick={() => toggleCat(i)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#fff", border: "none", cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, background: "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Ico name={r.icon} size={14} color="#64748b" />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{r.cat}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>({r.items.length})</span>
                    </div>
                    <Ico name={openCat.includes(i) ? "chevUp" : "chevDown"} size={14} color="#94a3b8" />
                  </button>
                  {openCat.includes(i) && (
                    <div style={{ padding: "4px 14px 14px", borderTop: "1px solid #f1f5f9" }}>
                      {r.items.map((item, j) => (
                        <div key={j} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: j < r.items.length - 1 ? "1px solid #f8fafc" : "none" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", marginTop: 7, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email signup */}
        <div className="card fade-up-3" style={{ padding: 32, marginTop: 24, background: "linear-gradient(135deg,#1e293b,#0f172a)", border: "none" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, background: "rgba(59,130,246,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Ico name="mail" size={22} color="#60a5fa" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 4 }}>Stay in the loop</div>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Monthly theft prevention tips and updates when we expand to new cities.</p>
            </div>
            {!submitted ? (
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <input
                  className="input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: 220, background: "#1e293b", color: "#fff", borderColor: "#334155" }}
                />
                <button className="btn" onClick={() => email && setSubmitted(true)} disabled={!email}
                  style={{ background: "#3b82f6", color: "#fff", whiteSpace: "nowrap" }}>
                  Subscribe
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4ade80", fontWeight: 600 }}>
                <Ico name="checkCircle" size={18} color="#4ade80" /> Subscribed!
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── METHODOLOGY PAGE ─────────────────────────────────────────────────────────

function MethodologyPage({ setPage }) {
  const dataInputs = [
    { icon: "trending",  title: "Crime Grade",          weight: "45% of baseline", desc: "Letter grades (A+ to F) from local crime data, weighted at 45% of your zip baseline." },
    { icon: "mapPin",    title: "Cost Per Household",   weight: "35% of baseline", desc: "Economic impact of theft ($159–$1,520 range), normalized and weighted at 35%." },
    { icon: "footprints",title: "Walkability Score",    weight: "12% of baseline", desc: "Four tiers from Least to Most Walkable — higher foot traffic means more opportunity." },
    { icon: "users",     title: "Population Density",   weight: "8% of baseline",  desc: "Ranges from 2.3 to 8,922 per sq mi, normalized to account for urban vs suburban patterns." },
  ];

  const limitations = [
    "Data is based on reported incidents—unreported theft is not captured",
    "Individual property features (fences, cameras) are not factored in",
    "Scores reflect zip code averages, not specific addresses",
    "Crime patterns can change; data may have reporting delays",
    "Beta model covers Nashville metro area zip codes only",
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#fff", padding: "48px 0 80px" }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <button onClick={() => setPage("home")} className="btn btn-outline" style={{ marginBottom: 32, fontSize: 14 }}>
          <Ico name="arrowLeft" size={15} /> Back to home
        </button>

        <span className="badge" style={{ background: "#dbeafe", color: "#1d4ed8", marginBottom: 16 }}>Nashville Beta</span>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 44, marginBottom: 14, lineHeight: 1.15 }}>
          How We Calculate Your PorchScore
        </h1>
        <p style={{ color: "#64748b", fontSize: 17, marginBottom: 56, maxWidth: 520, lineHeight: 1.6 }}>
          Your score combines zip code baseline data (70%) with property-specific factors (30%).
        </p>

        {/* Formula */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)", borderRadius: 20, padding: 40, color: "#fff" }}>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>The Formula</h2>
            <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 12, padding: "20px 28px", fontFamily: "monospace", fontSize: 15, textAlign: "center", marginBottom: 28, lineHeight: 2 }}>
              <span style={{ color: "#60a5fa" }}>PorchScore</span> =&nbsp;
              <span style={{ color: "#4ade80" }}>70%</span> × Zip Baseline +&nbsp;
              <span style={{ color: "#fbbf24" }}>15%</span> × Housing +&nbsp;
              <span style={{ color: "#c084fc" }}>15%</span> × Visibility
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, fontSize: 14 }}>
              {[
                { color: "#4ade80", title: "Zip Baseline (70%)",  body: "Combines crime grade (45%), cost per household (35%), walkability (12%), and density (8%)." },
                { color: "#fbbf24", title: "Housing Type (15%)",  body: "House (35), Townhome (50), Condo (60), Apartment (80) based on typical delivery exposure." },
                { color: "#c084fc", title: "Visibility (15%)",    body: "Very Visible (90), Partially Hidden (55), Well Hidden (20) based on street view exposure." },
              ].map((col, i) => (
                <div key={i}>
                  <div style={{ color: col.color, fontWeight: 700, marginBottom: 6 }}>{col.title}</div>
                  <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>{col.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Zip Baseline Components */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, marginBottom: 24 }}>Zip Baseline Components</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {dataInputs.map((d, i) => (
              <div key={i} className="card" style={{ padding: 24 }}>
                <div style={{ width: 40, height: 40, background: "#eff6ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Ico name={d.icon} size={18} color="#3b82f6" />
                </div>
                <h4 style={{ fontWeight: 700, marginBottom: 6 }}>{d.title}</h4>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 10, lineHeight: 1.5 }}>{d.desc}</p>
                <span className="badge" style={{ background: "#eff6ff", color: "#3b82f6", fontSize: 11 }}>{d.weight}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Risk Bands */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, marginBottom: 24 }}>Risk Bands</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { range: "0–39",   tier: "Low Risk",    bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", desc: "Lower than average theft risk. Standard precautions recommended." },
              { range: "40–69",  tier: "Medium Risk", bg: "#fffbeb", border: "#fde68a", text: "#d97706", desc: "Moderate risk. Consider additional protective measures." },
              { range: "70–100", tier: "High Risk",   bg: "#fef2f2", border: "#fecaca", text: "#dc2626", desc: "Above average risk. Multiple protection strategies recommended." },
            ].map((b, i) => (
              <div key={i} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 14, padding: 20, display: "flex", gap: 24, alignItems: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: b.text, minWidth: 80 }}>{b.range}</div>
                <div>
                  <div style={{ fontWeight: 700, color: b.text, marginBottom: 4 }}>{b.tier}</div>
                  <p style={{ fontSize: 14, color: "#475569" }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Limitations */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <Ico name="alertTri" size={26} color="#f59e0b" /> Known Limitations
          </h2>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 16, padding: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {limitations.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <Ico name="info" size={16} color="#f59e0b" />
                  <span style={{ fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div style={{ textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: 48 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 18 }}>Ready to check your score?</h2>
          <button className="btn btn-primary btn-lg" onClick={() => setPage("home")}>
            Get My PorchScore <Ico name="arrowUp" size={18} color="#fff" />
          </button>
        </div>
      </div>
    </main>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage]             = useState("home");
  const [resultData, setResultData] = useState(null);

  const navigate = (p) => { setPage(p); window.scrollTo(0, 0); };

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header page={page} setPage={navigate} />
        <div style={{ flex: 1 }}>
          {page === "home"        && <HomePage setPage={navigate} setResultData={setResultData} />}
          {page === "results"     && resultData && <ResultsPage resultData={resultData} setPage={navigate} />}
          {page === "methodology" && <MethodologyPage setPage={navigate} />}
          {page === "results"     && !resultData && <HomePage setPage={navigate} setResultData={setResultData} />}
        </div>
        <Footer setPage={navigate} />
      </div>
    </>
  );
}
