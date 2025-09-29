// Main application logic for travel tracker
class TravelTracker {
    constructor() {
        this.storage = new TravelStorage();
        this.currentEditingTrip = null;
        this.currentEditingState = null;
        this.currentView = 'states';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderStates();
        this.renderTrips();
        this.updateStatistics();
    }

    bindEvents() {
        // Navigation
        const statesTab = document.getElementById('states-tab');
        const tripsTab = document.getElementById('trips-tab');

        statesTab.addEventListener('click', () => this.switchView('states'));
        tripsTab.addEventListener('click', () => this.switchView('trips'));

        // State filter
        const statusFilter = document.getElementById('status-filter');
        statusFilter.addEventListener('change', () => this.renderStates());

        // State modal controls
        const stateModal = document.getElementById('state-modal');
        const stateCloseBtn = document.querySelector('.state-close');
        const stateCancelBtn = document.getElementById('state-cancel-btn');
        const stateForm = document.getElementById('state-form');
        const stateStatus = document.getElementById('state-status');

        stateCloseBtn.addEventListener('click', () => this.closeStateModal());
        stateCancelBtn.addEventListener('click', () => this.closeStateModal());
        stateForm.addEventListener('submit', (e) => this.handleStateFormSubmit(e));
        stateStatus.addEventListener('change', () => this.toggleVisitDateField());

        // Trip modal controls
        const addTripBtn = document.getElementById('add-trip-btn');
        const tripModal = document.getElementById('trip-modal');
        const tripCloseBtn = document.querySelector('.trip-close');
        const cancelBtn = document.getElementById('cancel-btn');
        const tripForm = document.getElementById('trip-form');

        addTripBtn.addEventListener('click', () => this.openTripModal());
        tripCloseBtn.addEventListener('click', () => this.closeTripModal());
        cancelBtn.addEventListener('click', () => this.closeTripModal());
        tripForm.addEventListener('submit', (e) => this.handleTripFormSubmit(e));

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === stateModal) {
                this.closeStateModal();
            }
            if (e.target === tripModal) {
                this.closeTripModal();
            }
        });
    }

    openTripModal(trip = null) {
        const modal = document.getElementById('trip-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('trip-form');

        if (trip) {
            // Editing existing trip
            this.currentEditingTrip = trip;
            modalTitle.textContent = 'Edit Trip';
            this.populateTripForm(trip);
        } else {
            // Adding new trip
            this.currentEditingTrip = null;
            modalTitle.textContent = 'Add New Trip';
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeTripModal() {
        const modal = document.getElementById('trip-modal');
        modal.style.display = 'none';
        this.currentEditingTrip = null;
    }

    populateTripForm(trip) {
        document.getElementById('destination').value = trip.destination;
        document.getElementById('country').value = trip.country;
        document.getElementById('start-date').value = trip.startDate;
        document.getElementById('end-date').value = trip.endDate;
        document.getElementById('notes').value = trip.notes || '';
    }

    handleTripFormSubmit(e) {
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

        this.closeTripModal();
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
            this.openTripModal(trip);
        }
    }

    deleteTrip(tripId) {
        if (confirm('Are you sure you want to delete this trip?')) {
            this.storage.deleteTrip(tripId);
            this.renderTrips();
            this.updateStatistics();
        }
    }

    switchView(view) {
        this.currentView = view;

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}-tab`).classList.add('active');

        // Show/hide sections
        document.getElementById('states-section').style.display = view === 'states' ? 'block' : 'none';
        document.getElementById('trips-section').style.display = view === 'trips' ? 'block' : 'none';
    }

    renderStates() {
        const container = document.getElementById('states-container');
        const filter = document.getElementById('status-filter').value;
        const states = this.storage.getAllStates();

        let filteredStates = states;
        if (filter !== 'all') {
            filteredStates = states.filter(state => state.status === filter);
        }

        // Sort states alphabetically
        filteredStates.sort((a, b) => a.name.localeCompare(b.name));

        container.innerHTML = filteredStates.map(state => this.createStateCard(state)).join('');
    }

    createStateCard(state) {
        const statusClass = state.status;
        const statusText = state.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const visitDate = state.visitDate ? new Date(state.visitDate).toLocaleDateString() : '';

        return `
            <div class="state-card" onclick="app.openStateModal('${state.name}')">
                <h3>${state.name}</h3>
                <div class="status ${statusClass}">${statusText}</div>
                ${visitDate ? `<div class="visit-date">Visited: ${visitDate}</div>` : ''}
                ${state.notes ? `<div class="notes">${state.notes}</div>` : ''}
            </div>
        `;
    }

    openStateModal(stateName) {
        const state = this.storage.getStateByName(stateName);
        if (!state) return;

        this.currentEditingState = stateName;

        document.getElementById('state-name').value = state.name;
        document.getElementById('state-status').value = state.status;
        document.getElementById('visit-date').value = state.visitDate || '';
        document.getElementById('state-notes').value = state.notes || '';

        this.toggleVisitDateField();
        document.getElementById('state-modal').style.display = 'block';
    }

    closeStateModal() {
        document.getElementById('state-modal').style.display = 'none';
        this.currentEditingState = null;
    }

    toggleVisitDateField() {
        const status = document.getElementById('state-status').value;
        const visitDateGroup = document.getElementById('visit-date-group');
        visitDateGroup.style.display = status === 'visited' ? 'block' : 'none';
    }

    handleStateFormSubmit(e) {
        e.preventDefault();

        const status = document.getElementById('state-status').value;
        const visitDate = status === 'visited' ? document.getElementById('visit-date').value : null;
        const notes = document.getElementById('state-notes').value.trim();

        this.storage.updateStateStatus(this.currentEditingState, status, visitDate, notes);

        this.closeStateModal();
        this.renderStates();
        this.updateStatistics();
    }

    updateStatistics() {
        const stateStats = this.storage.getStatesStatistics();
        document.getElementById('states-visited').textContent = stateStats.visited;
        document.getElementById('states-planned').textContent = stateStats.planToVisit;
        document.getElementById('states-not-visited').textContent = stateStats.notVisited;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TravelTracker();
});