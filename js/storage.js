// Storage management for travel tracker
class TravelStorage {
    constructor() {
        this.storageKey = 'travelTracker_trips';
        this.statesKey = 'travelTracker_states';
        this.initializeStates();
    }

    // Initialize all 50 US states with default status
    initializeStates() {
        const existingStates = localStorage.getItem(this.statesKey);
        if (!existingStates) {
            const allStates = [
                'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
                'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
                'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
                'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
                'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
                'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
                'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
                'Wisconsin', 'Wyoming'
            ];

            const statesData = allStates.map(state => ({
                name: state,
                status: 'not-visited', // not-visited, plan-to-visit, visited
                visitDate: null,
                notes: ''
            }));

            localStorage.setItem(this.statesKey, JSON.stringify(statesData));
        }
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
        const states = localStorage.getItem(this.statesKey);
        return states ? JSON.parse(states) : [];
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
}