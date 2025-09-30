// Storage management for travel tracker
class TravelStorage {
    constructor() {
        this.storageKey = 'travelTracker_trips';
        this.statesKey = 'travelTracker_states';
        this.initializeStates();
    }

    // Initialize all 50 US states with default status and detailed info
    initializeStates() {
        const existingStates = localStorage.getItem(this.statesKey);
        if (!existingStates) {
            const statesData = this.getStatesWithDetails();
            localStorage.setItem(this.statesKey, JSON.stringify(statesData));
        } else {
            // Update existing states with abbreviations if they don't have them
            this.updateStatesWithAbbreviations();
        }
    }

    // Update existing states to add abbreviations
    updateStatesWithAbbreviations() {
        const states = this.getAllStates();
        const stateFlags = {
            'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
            'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
            'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
            'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
            'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
            'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
            'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
            'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
            'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
            'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
        };

        let needsUpdate = false;
        states.forEach(state => {
            if (!state.abbreviation && stateFlags[state.name]) {
                state.abbreviation = stateFlags[state.name];
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            localStorage.setItem(this.statesKey, JSON.stringify(states));
        }
    }

    // Get states with detailed information
    getStatesWithDetails() {
        const statesInfo = {
            'Alabama': { capital: 'Montgomery', nickname: 'Heart of Dixie', bestCities: ['Birmingham', 'Mobile', 'Huntsville'], famousPlaces: ['Gulf Shores', 'U.S. Space & Rocket Center'], recommendedDays: 4, estimatedBudget: 800, flag: '🏴󠁵󠁳󠁡󠁬󠁿' },
            'Alaska': { capital: 'Juneau', nickname: 'Last Frontier', bestCities: ['Anchorage', 'Fairbanks', 'Juneau'], famousPlaces: ['Denali National Park', 'Glacier Bay'], recommendedDays: 7, estimatedBudget: 2000 },
            'Arizona': { capital: 'Phoenix', nickname: 'Grand Canyon State', bestCities: ['Phoenix', 'Tucson', 'Sedona'], famousPlaces: ['Grand Canyon', 'Antelope Canyon'], recommendedDays: 5, estimatedBudget: 1000 },
            'Arkansas': { capital: 'Little Rock', nickname: 'Natural State', bestCities: ['Little Rock', 'Fayetteville', 'Hot Springs'], famousPlaces: ['Hot Springs National Park', 'Buffalo National River'], recommendedDays: 3, estimatedBudget: 600 },
            'California': { capital: 'Sacramento', nickname: 'Golden State', bestCities: ['Los Angeles', 'San Francisco', 'San Diego'], famousPlaces: ['Hollywood', 'Golden Gate Bridge', 'Yosemite'], recommendedDays: 10, estimatedBudget: 2500 },
            'Colorado': { capital: 'Denver', nickname: 'Centennial State', bestCities: ['Denver', 'Boulder', 'Aspen'], famousPlaces: ['Rocky Mountain National Park', 'Garden of the Gods'], recommendedDays: 6, estimatedBudget: 1200 },
            'Connecticut': { capital: 'Hartford', nickname: 'Constitution State', bestCities: ['Hartford', 'New Haven', 'Stamford'], famousPlaces: ['Mystic Seaport', 'Yale University'], recommendedDays: 3, estimatedBudget: 800 },
            'Delaware': { capital: 'Dover', nickname: 'First State', bestCities: ['Wilmington', 'Dover', 'Rehoboth Beach'], famousPlaces: ['Rehoboth Beach', 'Winterthur Museum'], recommendedDays: 2, estimatedBudget: 500 },
            'Florida': { capital: 'Tallahassee', nickname: 'Sunshine State', bestCities: ['Miami', 'Orlando', 'Tampa'], famousPlaces: ['Disney World', 'Everglades', 'Key West'], recommendedDays: 8, estimatedBudget: 1800 },
            'Georgia': { capital: 'Atlanta', nickname: 'Peach State', bestCities: ['Atlanta', 'Savannah', 'Augusta'], famousPlaces: ['Savannah Historic District', 'Stone Mountain'], recommendedDays: 5, estimatedBudget: 1000 },
            'Hawaii': { capital: 'Honolulu', nickname: 'Aloha State', bestCities: ['Honolulu', 'Hilo', 'Kailua-Kona'], famousPlaces: ['Pearl Harbor', 'Volcanoes National Park'], recommendedDays: 7, estimatedBudget: 2200 },
            'Idaho': { capital: 'Boise', nickname: 'Gem State', bestCities: ['Boise', 'Coeur d\'Alene', 'Sun Valley'], famousPlaces: ['Craters of the Moon', 'Sawtooth Mountains'], recommendedDays: 4, estimatedBudget: 800 },
            'Illinois': { capital: 'Springfield', nickname: 'Prairie State', bestCities: ['Chicago', 'Springfield', 'Peoria'], famousPlaces: ['Millennium Park', 'Navy Pier'], recommendedDays: 4, estimatedBudget: 1000 },
            'Indiana': { capital: 'Indianapolis', nickname: 'Hoosier State', bestCities: ['Indianapolis', 'Fort Wayne', 'Evansville'], famousPlaces: ['Indianapolis Motor Speedway', 'Indiana Dunes'], recommendedDays: 3, estimatedBudget: 700 },
            'Iowa': { capital: 'Des Moines', nickname: 'Hawkeye State', bestCities: ['Des Moines', 'Cedar Rapids', 'Davenport'], famousPlaces: ['Field of Dreams', 'Effigy Mounds'], recommendedDays: 3, estimatedBudget: 600 },
            'Kansas': { capital: 'Topeka', nickname: 'Sunflower State', bestCities: ['Wichita', 'Kansas City', 'Topeka'], famousPlaces: ['Monument Rocks', 'Tallgrass Prairie'], recommendedDays: 3, estimatedBudget: 600 },
            'Kentucky': { capital: 'Frankfort', nickname: 'Bluegrass State', bestCities: ['Louisville', 'Lexington', 'Bowling Green'], famousPlaces: ['Kentucky Derby', 'Mammoth Cave'], recommendedDays: 4, estimatedBudget: 800 },
            'Louisiana': { capital: 'Baton Rouge', nickname: 'Pelican State', bestCities: ['New Orleans', 'Baton Rouge', 'Lafayette'], famousPlaces: ['French Quarter', 'Bourbon Street'], recommendedDays: 5, estimatedBudget: 1100 },
            'Maine': { capital: 'Augusta', nickname: 'Pine Tree State', bestCities: ['Portland', 'Bar Harbor', 'Augusta'], famousPlaces: ['Acadia National Park', 'Portland Head Light'], recommendedDays: 4, estimatedBudget: 900 },
            'Maryland': { capital: 'Annapolis', nickname: 'Old Line State', bestCities: ['Baltimore', 'Annapolis', 'Frederick'], famousPlaces: ['Inner Harbor', 'Fort McHenry'], recommendedDays: 3, estimatedBudget: 800 },
            'Massachusetts': { capital: 'Boston', nickname: 'Bay State', bestCities: ['Boston', 'Cambridge', 'Salem'], famousPlaces: ['Freedom Trail', 'Harvard University'], recommendedDays: 4, estimatedBudget: 1100 },
            'Michigan': { capital: 'Lansing', nickname: 'Great Lakes State', bestCities: ['Detroit', 'Grand Rapids', 'Ann Arbor'], famousPlaces: ['Mackinac Island', 'Sleeping Bear Dunes'], recommendedDays: 5, estimatedBudget: 900 },
            'Minnesota': { capital: 'Saint Paul', nickname: 'Land of 10,000 Lakes', bestCities: ['Minneapolis', 'Saint Paul', 'Duluth'], famousPlaces: ['Boundary Waters', 'Mall of America'], recommendedDays: 4, estimatedBudget: 800 },
            'Mississippi': { capital: 'Jackson', nickname: 'Magnolia State', bestCities: ['Jackson', 'Biloxi', 'Natchez'], famousPlaces: ['Vicksburg National Military Park', 'Natchez Trace'], recommendedDays: 3, estimatedBudget: 600 },
            'Missouri': { capital: 'Jefferson City', nickname: 'Show Me State', bestCities: ['Kansas City', 'St. Louis', 'Springfield'], famousPlaces: ['Gateway Arch', 'Branson'], recommendedDays: 4, estimatedBudget: 800 },
            'Montana': { capital: 'Helena', nickname: 'Big Sky Country', bestCities: ['Billings', 'Missoula', 'Bozeman'], famousPlaces: ['Glacier National Park', 'Yellowstone'], recommendedDays: 6, estimatedBudget: 1200 },
            'Nebraska': { capital: 'Lincoln', nickname: 'Cornhusker State', bestCities: ['Omaha', 'Lincoln', 'Grand Island'], famousPlaces: ['Chimney Rock', 'Henry Doorly Zoo'], recommendedDays: 3, estimatedBudget: 600 },
            'Nevada': { capital: 'Carson City', nickname: 'Silver State', bestCities: ['Las Vegas', 'Reno', 'Carson City'], famousPlaces: ['Las Vegas Strip', 'Lake Tahoe'], recommendedDays: 4, estimatedBudget: 1000 },
            'New Hampshire': { capital: 'Concord', nickname: 'Live Free or Die', bestCities: ['Manchester', 'Nashua', 'Concord'], famousPlaces: ['Mount Washington', 'White Mountains'], recommendedDays: 3, estimatedBudget: 700 },
            'New Jersey': { capital: 'Trenton', nickname: 'Garden State', bestCities: ['Newark', 'Jersey City', 'Atlantic City'], famousPlaces: ['Atlantic City Boardwalk', 'Cape May'], recommendedDays: 3, estimatedBudget: 800 },
            'New Mexico': { capital: 'Santa Fe', nickname: 'Land of Enchantment', bestCities: ['Albuquerque', 'Santa Fe', 'Las Cruces'], famousPlaces: ['Carlsbad Caverns', 'White Sands'], recommendedDays: 5, estimatedBudget: 900 },
            'New York': { capital: 'Albany', nickname: 'Empire State', bestCities: ['New York City', 'Buffalo', 'Rochester'], famousPlaces: ['Statue of Liberty', 'Niagara Falls'], recommendedDays: 7, estimatedBudget: 1800 },
            'North Carolina': { capital: 'Raleigh', nickname: 'Tar Heel State', bestCities: ['Charlotte', 'Raleigh', 'Asheville'], famousPlaces: ['Great Smoky Mountains', 'Outer Banks'], recommendedDays: 5, estimatedBudget: 1000 },
            'North Dakota': { capital: 'Bismarck', nickname: 'Peace Garden State', bestCities: ['Fargo', 'Bismarck', 'Grand Forks'], famousPlaces: ['Theodore Roosevelt National Park', 'Badlands'], recommendedDays: 3, estimatedBudget: 600 },
            'Ohio': { capital: 'Columbus', nickname: 'Buckeye State', bestCities: ['Columbus', 'Cleveland', 'Cincinnati'], famousPlaces: ['Rock and Roll Hall of Fame', 'Cedar Point'], recommendedDays: 4, estimatedBudget: 800 },
            'Oklahoma': { capital: 'Oklahoma City', nickname: 'Sooner State', bestCities: ['Oklahoma City', 'Tulsa', 'Norman'], famousPlaces: ['Oklahoma City National Memorial', 'Gathering Place'], recommendedDays: 3, estimatedBudget: 600 },
            'Oregon': { capital: 'Salem', nickname: 'Beaver State', bestCities: ['Portland', 'Eugene', 'Bend'], famousPlaces: ['Crater Lake', 'Columbia River Gorge'], recommendedDays: 5, estimatedBudget: 1100 },
            'Pennsylvania': { capital: 'Harrisburg', nickname: 'Keystone State', bestCities: ['Philadelphia', 'Pittsburgh', 'Harrisburg'], famousPlaces: ['Liberty Bell', 'Gettysburg'], recommendedDays: 5, estimatedBudget: 1000 },
            'Rhode Island': { capital: 'Providence', nickname: 'Ocean State', bestCities: ['Providence', 'Newport', 'Warwick'], famousPlaces: ['Newport Mansions', 'Block Island'], recommendedDays: 2, estimatedBudget: 600 },
            'South Carolina': { capital: 'Columbia', nickname: 'Palmetto State', bestCities: ['Charleston', 'Columbia', 'Myrtle Beach'], famousPlaces: ['Charleston Historic District', 'Myrtle Beach'], recommendedDays: 4, estimatedBudget: 900 },
            'South Dakota': { capital: 'Pierre', nickname: 'Mount Rushmore State', bestCities: ['Sioux Falls', 'Rapid City', 'Pierre'], famousPlaces: ['Mount Rushmore', 'Badlands National Park'], recommendedDays: 4, estimatedBudget: 800 },
            'Tennessee': { capital: 'Nashville', nickname: 'Volunteer State', bestCities: ['Nashville', 'Memphis', 'Knoxville'], famousPlaces: ['Great Smoky Mountains', 'Graceland'], recommendedDays: 5, estimatedBudget: 1000 },
            'Texas': { capital: 'Austin', nickname: 'Lone Star State', bestCities: ['Houston', 'Dallas', 'Austin'], famousPlaces: ['The Alamo', 'Big Bend National Park'], recommendedDays: 8, estimatedBudget: 1500 },
            'Utah': { capital: 'Salt Lake City', nickname: 'Beehive State', bestCities: ['Salt Lake City', 'Park City', 'Moab'], famousPlaces: ['Zion National Park', 'Arches National Park'], recommendedDays: 6, estimatedBudget: 1200 },
            'Vermont': { capital: 'Montpelier', nickname: 'Green Mountain State', bestCities: ['Burlington', 'Montpelier', 'Stowe'], famousPlaces: ['Green Mountains', 'Lake Champlain'], recommendedDays: 3, estimatedBudget: 700 },
            'Virginia': { capital: 'Richmond', nickname: 'Old Dominion', bestCities: ['Virginia Beach', 'Norfolk', 'Richmond'], famousPlaces: ['Colonial Williamsburg', 'Shenandoah National Park'], recommendedDays: 5, estimatedBudget: 1000 },
            'Washington': { capital: 'Olympia', nickname: 'Evergreen State', bestCities: ['Seattle', 'Spokane', 'Tacoma'], famousPlaces: ['Mount Rainier', 'Pike Place Market'], recommendedDays: 6, estimatedBudget: 1300 },
            'West Virginia': { capital: 'Charleston', nickname: 'Mountain State', bestCities: ['Charleston', 'Huntington', 'Morgantown'], famousPlaces: ['New River Gorge', 'Harpers Ferry'], recommendedDays: 3, estimatedBudget: 600 },
            'Wisconsin': { capital: 'Madison', nickname: 'Badger State', bestCities: ['Milwaukee', 'Madison', 'Green Bay'], famousPlaces: ['Wisconsin Dells', 'Door County'], recommendedDays: 4, estimatedBudget: 800 },
            'Wyoming': { capital: 'Cheyenne', nickname: 'Equality State', bestCities: ['Cheyenne', 'Casper', 'Jackson'], famousPlaces: ['Yellowstone National Park', 'Grand Teton'], recommendedDays: 6, estimatedBudget: 1200 }
        };

        const stateFlags = {
            'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
            'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
            'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
            'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
            'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
            'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
            'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
            'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
            'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
            'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
        };

        return Object.keys(statesInfo).map(stateName => ({
            name: stateName,
            status: 'not-visited',
            visitDate: null,
            notes: '',
            ...statesInfo[stateName],
            abbreviation: stateFlags[stateName],
            userBudget: null,
            userDays: null,
            userNotes: ''
        }));
    }

    // Get all trips from localStorage
    getAllTrips() {
        const trips = localStorage.getItem(this.storageKey);
        return trips ? JSON.parse(trips) : [];
    }

    // Save a new trip
    saveTrip(trip) {
        const trips = this.getAllTrips();
        trip.id = this.generateId();
        trip.createdAt = new Date().toISOString();
        trips.push(trip);
        localStorage.setItem(this.storageKey, JSON.stringify(trips));
        return trip;
    }

    // Update an existing trip
    updateTrip(tripId, updatedTrip) {
        const trips = this.getAllTrips();
        const index = trips.findIndex(trip => trip.id === tripId);
        if (index !== -1) {
            trips[index] = { ...trips[index], ...updatedTrip };
            localStorage.setItem(this.storageKey, JSON.stringify(trips));
            return trips[index];
        }
        return null;
    }

    // Delete a trip
    deleteTrip(tripId) {
        const trips = this.getAllTrips();
        const filteredTrips = trips.filter(trip => trip.id !== tripId);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredTrips));
        return true;
    }

    // Get a single trip by ID
    getTripById(tripId) {
        const trips = this.getAllTrips();
        return trips.find(trip => trip.id === tripId);
    }

    // Generate unique ID for trips
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get all states data
    getAllStates() {
        try {
            const states = localStorage.getItem(this.statesKey);
            return states ? JSON.parse(states) : [];
        } catch (error) {
            console.error('Error getting states from storage:', error);
            return [];
        }
    }

    // Update state status
    updateStateStatus(stateName, status, visitDate = null, notes = '') {
        const states = this.getAllStates();
        const stateIndex = states.findIndex(state => state.name === stateName);
        
        if (stateIndex !== -1) {
            states[stateIndex].status = status;
            states[stateIndex].visitDate = visitDate;
            states[stateIndex].notes = notes;
            localStorage.setItem(this.statesKey, JSON.stringify(states));
            return states[stateIndex];
        }
        return null;
    }

    // Get state by name
    getStateByName(stateName) {
        const states = this.getAllStates();
        return states.find(state => state.name === stateName);
    }

    // Calculate statistics
    getStatistics() {
        const trips = this.getAllTrips();
        const totalTrips = trips.length;
        const countries = [...new Set(trips.map(trip => trip.country))];
        const totalCountries = countries.length;
        
        const totalDays = trips.reduce((total, trip) => {
            const startDate = new Date(trip.startDate);
            const endDate = new Date(trip.endDate);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return total + diffDays;
        }, 0);

        return {
            totalTrips,
            totalCountries,
            totalDays
        };
    }

    // Calculate US states statistics
    getStatesStatistics() {
        const states = this.getAllStates();
        const visited = states.filter(state => state.status === 'visited').length;
        const planToVisit = states.filter(state => state.status === 'plan-to-visit').length;
        const notVisited = states.filter(state => state.status === 'not-visited').length;

        return {
            visited,
            planToVisit,
            notVisited,
            total: 50
        };
    }

    // Clear all data (for testing purposes)
    clearAllData() {
        localStorage.removeItem(this.storageKey);
    }

    // Home state management
    getHomeState() {
        return localStorage.getItem('travelTracker_homeState') || null;
    }

    setHomeState(stateName) {
        localStorage.setItem('travelTracker_homeState', stateName);
    }

    // Calculate distance between states (simplified - using state coordinates)
    getStateCoordinates() {
        return {
            'Alabama': { lat: 32.806671, lng: -86.791130 },
            'Alaska': { lat: 61.370716, lng: -152.404419 },
            'Arizona': { lat: 33.729759, lng: -111.431221 },
            'Arkansas': { lat: 34.969704, lng: -92.373123 },
            'California': { lat: 36.116203, lng: -119.681564 },
            'Colorado': { lat: 39.059811, lng: -105.311104 },
            'Connecticut': { lat: 41.597782, lng: -72.755371 },
            'Delaware': { lat: 39.318523, lng: -75.507141 },
            'Florida': { lat: 27.766279, lng: -81.686783 },
            'Georgia': { lat: 33.040619, lng: -83.643074 },
            'Hawaii': { lat: 21.094318, lng: -157.498337 },
            'Idaho': { lat: 44.240459, lng: -114.478828 },
            'Illinois': { lat: 40.349457, lng: -88.986137 },
            'Indiana': { lat: 39.849426, lng: -86.258278 },
            'Iowa': { lat: 42.011539, lng: -93.210526 },
            'Kansas': { lat: 38.526600, lng: -96.726486 },
            'Kentucky': { lat: 37.668140, lng: -84.670067 },
            'Louisiana': { lat: 31.169546, lng: -91.867805 },
            'Maine': { lat: 44.693947, lng: -69.381927 },
            'Maryland': { lat: 39.063946, lng: -76.802101 },
            'Massachusetts': { lat: 42.230171, lng: -71.530106 },
            'Michigan': { lat: 43.326618, lng: -84.536095 },
            'Minnesota': { lat: 45.694454, lng: -93.900192 },
            'Mississippi': { lat: 32.741646, lng: -89.678696 },
            'Missouri': { lat: 38.456085, lng: -92.288368 },
            'Montana': { lat: 47.052952, lng: -109.633040 },
            'Nebraska': { lat: 41.125370, lng: -98.268082 },
            'Nevada': { lat: 38.313515, lng: -117.055374 },
            'New Hampshire': { lat: 43.452492, lng: -71.563896 },
            'New Jersey': { lat: 40.298904, lng: -74.756138 },
            'New Mexico': { lat: 34.840515, lng: -106.248482 },
            'New York': { lat: 42.165726, lng: -74.948051 },
            'North Carolina': { lat: 35.630066, lng: -79.806419 },
            'North Dakota': { lat: 47.528912, lng: -99.784012 },
            'Ohio': { lat: 40.388783, lng: -82.764915 },
            'Oklahoma': { lat: 35.565342, lng: -96.928917 },
            'Oregon': { lat: 44.931109, lng: -120.767178 },
            'Pennsylvania': { lat: 40.590752, lng: -77.209755 },
            'Rhode Island': { lat: 41.680893, lng: -71.51178 },
            'South Carolina': { lat: 33.856892, lng: -80.945007 },
            'South Dakota': { lat: 44.299782, lng: -99.438828 },
            'Tennessee': { lat: 35.747845, lng: -86.692345 },
            'Texas': { lat: 31.054487, lng: -97.563461 },
            'Utah': { lat: 40.150032, lng: -111.862434 },
            'Vermont': { lat: 44.045876, lng: -72.710686 },
            'Virginia': { lat: 37.769337, lng: -78.169968 },
            'Washington': { lat: 47.400902, lng: -121.490494 },
            'West Virginia': { lat: 38.491226, lng: -80.954570 },
            'Wisconsin': { lat: 44.268543, lng: -89.616508 },
            'Wyoming': { lat: 42.755966, lng: -107.302490 }
        };
    }

    calculateDistance(state1, state2) {
        const coords = this.getStateCoordinates();
        const coord1 = coords[state1];
        const coord2 = coords[state2];
        
        if (!coord1 || !coord2) return 0;

        const R = 3959; // Earth's radius in miles
        const dLat = this.toRad(coord2.lat - coord1.lat);
        const dLng = this.toRad(coord2.lng - coord1.lng);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRad(coord1.lat)) * Math.cos(this.toRad(coord2.lat)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c);
    }

    toRad(deg) {
        return deg * (Math.PI/180);
    }

    getBestTransport(distance) {
        if (distance < 600) return { mode: 'Car', icon: '🚗', time: Math.round(distance / 60) + 'h drive' };
        return { mode: 'Flight', icon: '✈️', time: Math.round(distance / 500) + 'h flight' };
    }


}