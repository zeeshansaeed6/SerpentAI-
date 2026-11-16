// Initial sample community sightings for a rich map display (seeded when the table is empty).
// Photos are bundled with the client (client/public/samples); empty string = no photo.
const initialSightings = [
  {
    speciesName: 'King Cobra',
    scientificName: 'Ophiophagus hannah',
    venomous: true,
    dangerLevel: 'Deadly',
    locationName: 'Western Ghats Forest Trail, India',
    latitude: 14.5204,
    longitude: 74.8567,
    notes: 'Spotted near stream crossing. Maintained 15m distance, was approx 12ft long.',
    reporterName: 'Arun V. (Wildlife Guide)',
    imageData: '/samples/king-cobra.jpg'
  },
  {
    speciesName: "Russell's Viper",
    scientificName: 'Daboia russelii',
    venomous: true,
    dangerLevel: 'Deadly',
    locationName: 'Paddy Fields outskirts, Tamil Nadu',
    latitude: 11.1271,
    longitude: 78.6569,
    notes: 'Coiled under agricultural wood pile. Loud hiss heard before sighting.',
    reporterName: 'Karthik S.',
    imageData: ''
  },
  {
    speciesName: 'Corn Snake',
    scientificName: 'Pantherophis guttatus',
    venomous: false,
    dangerLevel: 'Harmless',
    locationName: 'Everglades National Park, Florida, USA',
    latitude: 25.2866,
    longitude: -80.8987,
    notes: 'Sunbathing across gravel bike trail. Very calm demeanor.',
    reporterName: 'Sarah Jenkins',
    imageData: '/samples/corn-snake.jpg'
  },
  {
    speciesName: 'Green Tree Python',
    scientificName: 'Morelia viridis',
    venomous: false,
    dangerLevel: 'Harmless',
    locationName: 'Cape York Rainforest, Queensland, Australia',
    latitude: -12.4862,
    longitude: 143.0855,
    notes: 'Resting wrapped on low branch near camping grounds.',
    reporterName: 'Dave Miller',
    imageData: '/samples/green-tree-python.jpg'
  },
  {
    speciesName: 'Eastern Diamondback Rattlesnake',
    scientificName: 'Crotalus adamanteus',
    venomous: true,
    dangerLevel: 'Dangerous',
    locationName: 'Ocala National Forest, FL',
    latitude: 29.1872,
    longitude: -81.8236,
    notes: 'Active rattle warning while hiking trail. Retreated safely.',
    reporterName: 'Mike R.',
    imageData: ''
  }
];

module.exports = { initialSightings };
