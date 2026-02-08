// Global salary data and location mappings for salary analyzer

// Major cities by country for salary analysis
export const GLOBAL_LOCATIONS = {
  "US": [
    "New York", "San Francisco", "Los Angeles", "Chicago", "Seattle", 
    "Boston", "Austin", "Denver", "Miami", "Atlanta", "Washington DC", 
    "San Diego", "Phoenix", "Dallas", "Houston"
  ],
  "GB": [
    "London", "Manchester", "Birmingham", "Edinburgh", "Glasgow", 
    "Bristol", "Leeds", "Liverpool", "Cardiff", "Belfast", "Newcastle", 
    "Nottingham", "Sheffield", "Leicester", "Cambridge"
  ],
  "CA": [
    "Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", 
    "Edmonton", "Winnipeg", "Quebec City", "Halifax", "Hamilton", 
    "London", "Kitchener", "Victoria", "Regina", "Saskatoon"
  ],
  "AU": [
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", 
    "Canberra", "Gold Coast", "Newcastle", "Wollongong", "Geelong", 
    "Hobart", "Townsville", "Cairns", "Darwin", "Ballarat"
  ],
  "DE": [
    "Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", 
    "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", 
    "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg"
  ],
  "FR": [
    "Paris", "Lyon", "Marseille", "Toulouse", "Nice", 
    "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", 
    "Rennes", "Reims", "Saint-Étienne", "Toulon", "Le Havre"
  ],
  "IN": [
    "Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad", 
    "Chennai", "Kolkata", "Ahmedabad", "Noida", "Gurgaon", 
    "Kochi", "Coimbatore", "Indore", "Chandigarh", "Jaipur"
  ],
  "SG": [
    "Singapore", "Jurong East", "Tampines", "Woodlands", "Sengkang"
  ],
  "HK": [
    "Hong Kong", "Kowloon", "New Territories", "Central", "Tsim Sha Tsui"
  ],
  "JP": [
    "Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", 
    "Sapporo", "Fukuoka", "Kobe", "Kawasaki", "Saitama"
  ],
  "CN": [
    "Beijing", "Shanghai", "Shenzhen", "Guangzhou", "Hangzhou", 
    "Nanjing", "Chengdu", "Suzhou", "Wuhan", "Xi'an"
  ],
  "NL": [
    "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", 
    "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen"
  ],
  "SE": [
    "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", 
    "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping"
  ],
  "NO": [
    "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", 
    "Fredrikstad", "Kristiansand", "Sandnes", "Tromsø", "Sarpsborg"
  ],
  "DK": [
    "Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", 
    "Randers", "Kolding", "Horsens", "Vejle", "Roskilde"
  ],
  "CH": [
    "Zurich", "Geneva", "Basel", "Bern", "Lausanne", 
    "Winterthur", "Lucerne", "St. Gallen", "Lugano", "Biel"
  ],
  "BR": [
    "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", 
    "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Goiânia"
  ],
  "MX": [
    "Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", 
    "León", "Juárez", "Torreón", "Querétaro", "San Luis Potosí"
  ],
  "ZA": [
    "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", 
    "Bloemfontein", "East London", "Nelspruit", "Polokwane", "Kimberley"
  ]
};

// Currency symbols and formatting
export const CURRENCY_SYMBOLS = {
  "USD": "$", "EUR": "€", "GBP": "£", "INR": "₹", "CAD": "C$", 
  "AUD": "A$", "JPY": "¥", "CHF": "CHF", "CNY": "¥", "SGD": "S$", 
  "HKD": "HK$", "KRW": "₩", "MXN": "$", "BRL": "R$", "ZAR": "R", 
  "AED": "د.إ", "SEK": "kr", "NOK": "kr", "DKK": "kr", "PLN": "zł", 
  "CZK": "Kč", "HUF": "Ft", "RUB": "₽", "TRY": "₺"
};

// Regional job market information
export const REGIONAL_JOB_MARKETS = {
  "US": {
    name: "United States",
    marketType: "Highly Competitive",
    currency: "USD",
    majorIndustries: ["Technology", "Finance", "Healthcare", "Manufacturing", "Entertainment"],
    techHubs: ["San Francisco", "Seattle", "Austin", "New York", "Boston"],
    salaryMultiplier: 1.0, // Base multiplier
    averageWorkHours: 40,
    vacationDays: 15,
    healthcareBenefits: "Employer-provided",
    retirementBenefits: "401(k) matching"
  },
  "GB": {
    name: "United Kingdom",
    marketType: "Mature Market",
    currency: "GBP", 
    majorIndustries: ["Finance", "Technology", "Healthcare", "Education", "Manufacturing"],
    techHubs: ["London", "Cambridge", "Edinburgh", "Manchester", "Bristol"],
    salaryMultiplier: 0.85,
    averageWorkHours: 37.5,
    vacationDays: 28,
    healthcareBenefits: "NHS + Private options",
    retirementBenefits: "Pension schemes"
  },
  "CA": {
    name: "Canada",
    marketType: "Growing Market", 
    currency: "CAD",
    majorIndustries: ["Technology", "Natural Resources", "Healthcare", "Finance", "Manufacturing"],
    techHubs: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    salaryMultiplier: 0.75,
    averageWorkHours: 40,
    vacationDays: 15,
    healthcareBenefits: "Universal healthcare",
    retirementBenefits: "CPP + company plans"
  },
  "AU": {
    name: "Australia",
    marketType: "Stable Market",
    currency: "AUD",
    majorIndustries: ["Mining", "Technology", "Healthcare", "Finance", "Education"],
    techHubs: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    salaryMultiplier: 0.80,
    averageWorkHours: 38,
    vacationDays: 20,
    healthcareBenefits: "Medicare + Private",
    retirementBenefits: "Superannuation"
  },
  "DE": {
    name: "Germany",
    marketType: "Engineering Focused",
    currency: "EUR",
    majorIndustries: ["Automotive", "Technology", "Manufacturing", "Finance", "Healthcare"],
    techHubs: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Stuttgart"],
    salaryMultiplier: 0.70,
    averageWorkHours: 35,
    vacationDays: 30,
    healthcareBenefits: "Statutory health insurance",
    retirementBenefits: "Pension system"
  },
  "IN": {
    name: "India",
    marketType: "Rapidly Growing",
    currency: "INR",
    majorIndustries: ["Technology", "Manufacturing", "Pharmaceuticals", "Finance", "Telecommunications"],
    techHubs: ["Bangalore", "Hyderabad", "Pune", "Chennai", "Mumbai"],
    salaryMultiplier: 0.15,
    averageWorkHours: 45,
    vacationDays: 12,
    healthcareBenefits: "Company-provided",
    retirementBenefits: "EPF + Gratuity"
  },
  "SG": {
    name: "Singapore",
    marketType: "Financial Hub",
    currency: "SGD",
    majorIndustries: ["Finance", "Technology", "Logistics", "Manufacturing", "Biotechnology"],
    techHubs: ["Singapore"],
    salaryMultiplier: 0.70,
    averageWorkHours: 44,
    vacationDays: 14,
    healthcareBenefits: "Medisave + Private",
    retirementBenefits: "CPF system"
  },
  "JP": {
    name: "Japan",
    marketType: "Traditional + Innovation",
    currency: "JPY",
    majorIndustries: ["Technology", "Automotive", "Manufacturing", "Finance", "Robotics"],
    techHubs: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Fukuoka"],
    salaryMultiplier: 0.65,
    averageWorkHours: 40,
    vacationDays: 10,
    healthcareBenefits: "National health insurance",
    retirementBenefits: "Pension system"
  }
};

// Global skill premiums by region
export const REGIONAL_SKILL_PREMIUMS = {
  "US": {
    "AI/ML": 1.40, "Cloud Computing": 1.35, "DevOps": 1.30, "Cybersecurity": 1.35,
    "Data Science": 1.32, "Blockchain": 1.25, "React": 1.20, "Python": 1.25,
    "Java": 1.15, "JavaScript": 1.18, "AWS": 1.30, "Docker": 1.22
  },
  "GB": {
    "AI/ML": 1.35, "Cloud Computing": 1.30, "DevOps": 1.25, "Cybersecurity": 1.30,
    "Data Science": 1.28, "Blockchain": 1.20, "React": 1.18, "Python": 1.22,
    "Java": 1.12, "JavaScript": 1.15, "AWS": 1.25, "Docker": 1.20
  },
  "IN": {
    "AI/ML": 1.50, "Cloud Computing": 1.45, "DevOps": 1.40, "Cybersecurity": 1.35,
    "Data Science": 1.35, "Blockchain": 1.30, "React": 1.25, "Python": 1.30,
    "Java": 1.20, "JavaScript": 1.22, "AWS": 1.35, "Docker": 1.25
  },
  "CA": {
    "AI/ML": 1.38, "Cloud Computing": 1.32, "DevOps": 1.28, "Cybersecurity": 1.32,
    "Data Science": 1.30, "Blockchain": 1.22, "React": 1.19, "Python": 1.24,
    "Java": 1.14, "JavaScript": 1.17, "AWS": 1.28, "Docker": 1.21
  },
  "AU": {
    "AI/ML": 1.36, "Cloud Computing": 1.31, "DevOps": 1.27, "Cybersecurity": 1.31,
    "Data Science": 1.29, "Blockchain": 1.21, "React": 1.18, "Python": 1.23,
    "Java": 1.13, "JavaScript": 1.16, "AWS": 1.27, "Docker": 1.20
  }
};

// Format salary based on currency and region
export const formatSalaryGlobal = (amount, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  
  switch (currency) {
    case "INR":
      return `${symbol}${(amount / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}L`;
    case "JPY":
      return `${symbol}${(amount / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万`;
    case "KRW":
      return `${symbol}${(amount / 10000).toLocaleString("ko-KR", { maximumFractionDigits: 0 })}만`;
    case "USD":
    case "CAD":
    case "AUD":
      return `${symbol}${(amount / 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })}K`;
    case "EUR":
    case "GBP":
    case "CHF":
      return `${symbol}${(amount / 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })}K`;
    default:
      return `${symbol}${amount.toLocaleString()}`;
  }
};

// Get appropriate locations for a country
export const getLocationsForCountry = (countryCode) => {
  return GLOBAL_LOCATIONS[countryCode] || GLOBAL_LOCATIONS["US"];
};

// Get market information for a country
export const getMarketInfo = (countryCode) => {
  return REGIONAL_JOB_MARKETS[countryCode] || REGIONAL_JOB_MARKETS["US"];
};

// Get skill premiums for a region
export const getSkillPremiums = (countryCode) => {
  return REGIONAL_SKILL_PREMIUMS[countryCode] || REGIONAL_SKILL_PREMIUMS["US"];
};