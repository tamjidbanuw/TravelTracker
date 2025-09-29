// Main application logic for travel tracker
class TravelTracker {
    constructor() {
        this.storage = new TravelStorage();
        this.currentEditingTrip = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTrips();
        this.updateStatistics();
    }

    bindEvents() {
        // Modal controls
        const addTripBtn = document.getElementById('add-trip-btn');
        const modal = document.getElementById('trip-modal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-btn');
        const tripForm = document.getElementById('trip-form');

        addTripBtn.addEventListener('click', () => this.openModal());
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        tripForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    openModal(trip = null) {
        const modal = document.getElementById('trip-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('trip-form');

        if (trip) {
            // Editing existing trip
            this.currentEditingTrip = trip;
            modalTitle.textContent = 'Edit Trip';
            this.populateForm(trip);
        } else {
            // Adding new trip
            this.currentEditingTrip = null;
            modalTitle.textContent = 'Add New Trip';
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('trip-modal');
        modal.style.display = 'none';
        this.currentEditingTrip = null;
    }

    populateForm(trip) {
        document.getElementById('destination').value = trip.destination;
        document.getElementById('country').value = trip.country;
        document.getElementById('start-date').value = trip.startDate;
        document.getElementById('end-date').value = trip.endDate;
        document.getElementById('notes').value = trip.notes || '';
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            destination: document.getElementById('destination').value.trim(),
            country: document.getElementById('country').value.trim(),
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
            notes: document.getElementById('notes').value.trim()
        };

        // Validate dates
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            alert('End date must be after start date');
            return;
        }

        if (this.currentEditingTrip) {
            // Update existing trip
            this.storage.updateTrip(this.currentEditingTrip.id, formData);
        } else {
            // Add new trip
            this.storage.saveTrip(formData);
        }

        this.closeModal();
        this.renderTrips();
        this.updateStatistics();
    }

    renderTrips() {
        const container = document.getElementById('trips-container');
        const trips = this.storage.getAllTrips();

        if (trips.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No trips yet!</h3>
                    <p>Start tracking your adventures by adding your first trip.</p>
                </div>
            `;
            return;
        }

        // Sort trips by start date (newest first)
        trips.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        container.innerHTML = trips.map(trip => this.createTripCard(trip)).join('');
    }

    createTripCard(trip) {
        const startDate = new Date(trip.startDate).toLocaleDateString();
        const endDate = new Date(trip.endDate).toLocaleDateString();
        const duration = this.calculateDuration(trip.startDate, trip.endDate);

        return `
            <div class="trip-card">
                <h3>${trip.destination}</h3>
                <div class="country">${trip.country}</div>
                <div class="dates">
                    ${startDate} - ${endDate} (${duration} day${duration !== 1 ? 's' : ''})
                </div>
                ${trip.notes ? `<div class="notes">${trip.notes}</div>` : ''}
                <div class="trip-actions">
                    <button class="btn-edit" onclick="app.editTrip('${trip.id}')">Edit</button>
                    <button class="btn-delete" onclick="app.deleteTrip('${trip.id}')">Delete</button>
                </div>
            </div>
        `;
    }

    calculateDuration(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    editTrip(tripId) {
        const trip = this.storage.getTripById(tripId);
        if (trip) {
            this.openModal(trip);
        }
    }

    deleteTrip(tripId) {
        if (confirm('Are you sure you want to delete this trip?')) {
            this.storage.deleteTrip(tripId);
            this.renderTrips();
            this.updateStatistics();
        }
    }

    updateStatistics() {
        const stats = this.storage.getStatistics();
        document.getElementById('total-trips').textContent = stats.totalTrips;
        document.getElementById('countries-visited').textContent = stats.totalCountries;
        document.getElementById('total-days').textContent = stats.totalDays;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TravelTracker();
});