// Storage management for travel tracker
class TravelStorage {
    constructor() {
        this.storageKey = 'travelTracker_trips';
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

    // Clear all data (for testing purposes)
    clearAllData() {
        localStorage.removeItem(this.storageKey);
    }
}