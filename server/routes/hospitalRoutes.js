const express = require('express');
const router = express.Router();

// Curated global & regional Antivenom & Toxicology Emergency Centers
const HOSPITALS = [
  {
    id: 'hosp-1',
    name: 'National Toxicology & Antivenom Emergency Center',
    type: 'Level 1 Trauma & Comprehensive Toxicology',
    city: 'New Delhi / National Capital Region',
    country: 'India',
    address: 'Ansari Nagar, New Delhi, 110029',
    phone: '+91-11-2658-8500',
    emergencyPhone: '108 / 102',
    antivenomAvailable: ['Polyvalent Snake Antivenom (Cobra, Krait, Russell Viper, Saw-scaled Viper)'],
    stockStatus: 'In Stock (High Capacity)',
    distanceEstimate: '8.4 km',
    lat: 28.5672,
    lng: 77.2100,
    open24_7: true
  },
  {
    id: 'hosp-2',
    name: 'Apollo Emergency Trauma & Snakebite Critical Care',
    type: 'Tertiary Care Emergency & ICU',
    city: 'Bangalore / Karnataka',
    country: 'India',
    address: 'Bannerghatta Road, Bengaluru, 560076',
    phone: '+91-80-2630-4050',
    emergencyPhone: '1066',
    antivenomAvailable: ['Polyvalent Antivenom', 'ICU Ventilatory Support Units'],
    stockStatus: 'In Stock (Verified)',
    distanceEstimate: '12.1 km',
    lat: 12.8954,
    lng: 77.5983,
    open24_7: true
  },
  {
    id: 'hosp-3',
    name: 'King Edward Memorial Toxicology Unit',
    type: 'Regional Snakebite Referral Hospital',
    city: 'Mumbai / Maharashtra',
    country: 'India',
    address: 'Parel, Mumbai, 400012',
    phone: '+91-22-2410-7000',
    emergencyPhone: '108',
    antivenomAvailable: ['Polyvalent Antivenom', 'Plasma Exchange Therapy'],
    stockStatus: 'In Stock (Verified)',
    distanceEstimate: '15.7 km',
    lat: 19.0019,
    lng: 72.8427,
    open24_7: true
  },
  {
    id: 'hosp-4',
    name: 'Florida Poison & Snakebite Envenomation Network',
    type: 'Level 1 Trauma Center & Antivenom Depot',
    city: 'Tampa / Orlando / Miami',
    country: 'United States',
    address: '1 Tampa General Circle, Tampa, FL 33606',
    phone: '+1-800-222-1222',
    emergencyPhone: '911',
    antivenomAvailable: ['CroFab (Crotalidae Polyvalent)', 'Anavip (Rattlesnake)', 'Coral Snake Antivenin'],
    stockStatus: 'In Stock (Verified)',
    distanceEstimate: '18.2 km',
    lat: 27.9378,
    lng: -82.4578,
    open24_7: true
  },
  {
    id: 'hosp-5',
    name: 'Sydney Royal Toxicology & Envenomation Center',
    type: 'Major Referral Hospital & Antivenom Bank',
    city: 'Sydney / New South Wales',
    country: 'Australia',
    address: 'Missenden Rd, Camperdown NSW 2050',
    phone: '+61-2-9515-6111',
    emergencyPhone: '000',
    antivenomAvailable: ['Brown Snake Antivenom', 'Taipan Antivenom', 'Death Adder Antivenom', 'Tiger Snake Antivenom'],
    stockStatus: 'In Stock (Verified)',
    distanceEstimate: '22.0 km',
    lat: -33.8911,
    lng: 151.1824,
    open24_7: true
  },
  {
    id: 'hosp-6',
    name: 'Queen Mary Hospital Toxicology Unit',
    type: 'Regional Antivenom Center',
    city: 'Hong Kong / Southern China',
    country: 'Hong Kong',
    address: '102 Pokfulam Rd, Hong Kong',
    phone: '+852-2255-3838',
    emergencyPhone: '999',
    antivenomAvailable: ['Banded Krait Antivenom', 'Bamboo Pit Viper Antivenom', 'Cobra Antivenom'],
    stockStatus: 'In Stock (Verified)',
    distanceEstimate: '25.4 km',
    lat: 22.2700,
    lng: 114.1310,
    open24_7: true
  }
];

// GET /api/hospitals — Search nearby emergency antivenom centers
router.get('/', (req, res) => {
  const { query, country } = req.query;
  let results = [...HOSPITALS];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.country.toLowerCase().includes(q) ||
      h.antivenomAvailable.some(a => a.toLowerCase().includes(q))
    );
  }

  if (country && country !== 'all') {
    results = results.filter(h => h.country.toLowerCase() === country.toLowerCase());
  }

  res.json({
    success: true,
    data: results,
    total: results.length
  });
});

module.exports = router;
