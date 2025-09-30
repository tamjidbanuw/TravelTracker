// Main application logic for travel tracker
class TravelTracker {
    constructor() {
        this.storage = new TravelStorage();
        this.currentEditingTrip = null;
        this.currentEditingState = null;
        this.currentView = 'states';
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupHomeStateSelect();
        this.renderStates();
        this.updateStatistics();
        // this.renderTrips(); // Commented out for now
    }

    bindEvents() {
        // Navigation - COMMENTED OUT FOR NOW
        // const statesTab = document.getElementById('states-tab');
        // const tripsTab = document.getElementById('trips-tab');

        // statesTab.addEventListener('click', () => this.switchView('states'));
        // tripsTab.addEventListener('click', () => this.switchView('trips'));

        // Home state and filter
        const homeStateSelect = document.getElementById('home-state-select');
        const statusFilter = document.getElementById('status-filter');
        
        homeStateSelect.addEventListener('change', (e) => {
            const selectedState = e.target.value;
            const currentHome = this.storage.getHomeState();
            
            if (selectedState) {
                if (currentHome && currentHome !== selectedState) {
                    // Two-step confirmation for changing home state
                    this.handleHomeStateChange(selectedState, currentHome, e.target);
                } else if (!currentHome) {
                    // Single confirmation for setting first home state
                    this.showConfirmation(
                        'Set Home State?',
                        `Are you sure you want to set ${selectedState} as your home state?\n\nThis will automatically mark it as "Visited".`,
                        () => {
                            this.storage.setHomeState(selectedState);
                            this.storage.updateStateStatus(selectedState, 'visited', new Date().toISOString().split('T')[0], '');
                            this.renderStates();
                            this.updateStatistics();
                        },
                        () => {
                            e.target.value = '';
                        }
                    );
                }
            }
        });
        // Make statistics cards clickable filters
        document.querySelectorAll('.stat-card.clickable').forEach(card => {
            card.addEventListener('click', () => {
                const filter = card.getAttribute('data-filter');
                this.filterStates(filter);
            });
        });

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

        // Detailed modal controls
        const detailModal = document.getElementById('state-detail-modal');
        const detailCloseBtn = document.querySelector('.detail-close');
        const closeDetailBtn = document.getElementById('close-detail-modal');
        const saveDetailBtn = document.getElementById('save-state-details');

        detailCloseBtn.addEventListener('click', () => this.closeDetailModal());
        closeDetailBtn.addEventListener('click', () => this.closeDetailModal());
        saveDetailBtn.addEventListener('click', () => this.saveStateDetails());

        // Detail tabs
        document.querySelectorAll('.detail-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchDetailTab(e.target.dataset.tab));
        });

        // Trip modal controls - COMMENTED OUT FOR NOW
        // const addTripBtn = document.getElementById('add-trip-btn');
        // const tripModal = document.getElementById('trip-modal');
        // const tripCloseBtn = document.querySelector('.trip-close');
        // const cancelBtn = document.getElementById('cancel-btn');
        // const tripForm = document.getElementById('trip-form');

        // addTripBtn.addEventListener('click', () => this.openTripModal());
        // tripCloseBtn.addEventListener('click', () => this.closeTripModal());
        // cancelBtn.addEventListener('click', () => this.closeTripModal());
        // tripForm.addEventListener('submit', (e) => this.handleTripFormSubmit(e));

        // Confirmation modal controls
        const confirmationModal = document.getElementById('confirmation-modal');
        const confirmYes = document.getElementById('confirm-yes');
        const confirmNo = document.getElementById('confirm-no');

        // Reset choice modal controls
        const resetChoiceModal = document.getElementById('reset-choice-modal');
        const resetChoiceReset = document.getElementById('reset-choice-reset');
        const resetChoiceKeep = document.getElementById('reset-choice-keep');
        const resetChoiceCancel = document.getElementById('reset-choice-cancel');

        confirmYes.addEventListener('click', () => {
            if (this.confirmCallback) {
                const callback = this.confirmCallback;
                this.confirmCallback = null;
                this.closeConfirmation();
                // Execute callback after modal is closed
                setTimeout(() => {
                    callback();
                }, 100);
            } else {
                this.closeConfirmation();
            }
        });

        confirmNo.addEventListener('click', () => {
            if (this.cancelCallback) {
                const callback = this.cancelCallback;
                this.cancelCallback = null;
                this.closeConfirmation();
                // Execute callback after modal is closed
                setTimeout(() => {
                    callback();
                }, 100);
            } else {
                this.closeConfirmation();
            }
        });

        // Reset choice modal event listeners
        resetChoiceReset.addEventListener('click', () => {
            if (this.resetCallback) {
                const callback = this.resetCallback;
                this.resetCallback = null;
                this.closeResetChoice();
                setTimeout(() => {
                    callback();
                }, 100);
            }
        });

        resetChoiceKeep.addEventListener('click', () => {
            if (this.keepCallback) {
                const callback = this.keepCallback;
                this.keepCallback = null;
                this.closeResetChoice();
                setTimeout(() => {
                    callback();
                }, 100);
            }
        });

        resetChoiceCancel.addEventListener('click', () => {
            if (this.resetCancelCallback) {
                const callback = this.resetCancelCallback;
                this.resetCancelCallback = null;
                this.closeResetChoice();
                setTimeout(() => {
                    callback();
                }, 100);
            } else {
                this.closeResetChoice();
            }
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === stateModal) {
                this.closeStateModal();
            }
            if (e.target === detailModal) {
                this.closeDetailModal();
            }
            if (e.target === confirmationModal) {
                if (this.cancelCallback) {
                    this.cancelCallback();
                    this.cancelCallback = null;
                }
                this.closeConfirmation();
            }
            if (e.target === resetChoiceModal) {
                if (this.resetCancelCallback) {
                    this.resetCancelCallback();
                    this.resetCancelCallback = null;
                }
                this.closeResetChoice();
            }
            // Trip modal functionality commented out
            // if (e.target === tripModal) {
            //     this.closeTripModal();
            // }
        });
    }

    // COMMENTED OUT FOR NOW - Trip functionality
    /*
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
    */

    /*
    closeTripModal() {
        const modal = document.getElementById('trip-modal');
        modal.style.display = 'none';
        this.currentEditingTrip = null;
    }
    */

    /*
    populateTripForm(trip) {
        document.getElementById('destination').value = trip.destination;
        document.getElementById('country').value = trip.country;
        document.getElementById('start-date').value = trip.startDate;
        document.getElementById('end-date').value = trip.endDate;
        document.getElementById('notes').value = trip.notes || '';
    }
    */

    /*
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
    */

    /*
    switchView(view) {
        this.currentView = view;

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}-tab`).classList.add('active');

        // Show/hide sections
        document.getElementById('states-section').style.display = view === 'states' ? 'block' : 'none';
        document.getElementById('trips-section').style.display = view === 'trips' ? 'block' : 'none';
    }
    */

    renderStates() {
        const container = document.getElementById('states-container');
        const states = this.storage.getAllStates();
        
        let filteredStates = states;
        if (this.currentFilter && this.currentFilter !== 'all') {
            filteredStates = states.filter(state => state.status === this.currentFilter);
        }

        // Sort states alphabetically
        filteredStates.sort((a, b) => a.name.localeCompare(b.name));

        container.innerHTML = filteredStates.map(state => this.createStateCard(state)).join('');
        
        // Update filter display
        this.updateFilterDisplay();
    }

    filterStates(status) {
        this.currentFilter = status;
        this.renderStates();
    }

    updateFilterDisplay() {
        // Remove active class from all stat cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.classList.remove('active-filter');
        });
        
        // Add active class to current filter
        if (this.currentFilter) {
            const activeCard = document.querySelector(`[data-filter="${this.currentFilter}"]`);
            if (activeCard) {
                activeCard.classList.add('active-filter');
            }
        }
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

    setupHomeStateSelect() {
        const select = document.getElementById('home-state-select');
        if (!select) return;

        const states = this.storage.getAllStates();
        const currentHome = this.storage.getHomeState();

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select your home state...</option>';
        
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state.name;
            option.textContent = state.name;
            if (state.name === currentHome) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    createStateCard(state) {
        const statusClass = state.status;
        const statusText = state.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const homeState = this.storage.getHomeState();
        
        let distanceInfo = '';
        let transportInfo = '';
        
        if (homeState && homeState !== state.name) {
            const distance = this.storage.calculateDistance(homeState, state.name);
            const transport = this.storage.getBestTransport(distance);
            distanceInfo = `${distance} miles away`;
            transportInfo = `${transport.icon} ${transport.mode} (${transport.time})`;
        } else if (homeState === state.name) {
            distanceInfo = 'Home Sweet Home';
            transportInfo = '✨ You live here!';
        } else {
            distanceInfo = 'Set home state to see distance';
            transportInfo = '';
        }

        const isHomeState = homeState === state.name;
        let cardClass = 'state-card';
        
        if (isHomeState) {
            cardClass += ' home-state';
        } else {
            // Add color coding based on status
            cardClass += ` status-${state.status}`;
        }

        return `
            <div class="${cardClass}" onclick="app.openDetailModal('${state.name}')">
                <div class="status ${statusClass}">${statusText}</div>
                ${isHomeState ? '<div class="home-badge">🏠</div>' : ''}
                <h3>${state.name}</h3>
                <div class="distance-info">${distanceInfo}</div>
                <div class="transport-info">${transportInfo}</div>
            </div>
        `;
    }

    openDetailModal(stateName) {
        const state = this.storage.getStateByName(stateName);
        if (!state) return;

        // Clean up old "My home state" notes if they exist
        if (state.notes === 'My home state') {
            state.notes = '';
            // Save the cleanup
            const states = this.storage.getAllStates();
            const stateIndex = states.findIndex(s => s.name === stateName);
            if (stateIndex !== -1) {
                states[stateIndex].notes = '';
                localStorage.setItem('travelTracker_states', JSON.stringify(states));
            }
        }

        this.currentDetailState = stateName;
        
        // Update header
        document.getElementById('detail-state-name').textContent = state.name;
        document.getElementById('detail-state-nickname').textContent = state.nickname;
        document.getElementById('detail-status-badge').textContent = 
            state.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        document.getElementById('detail-status-badge').className = 
            `state-status-badge ${state.status}`;

        // Update overview tab
        document.getElementById('detail-capital').textContent = state.capital;
        
        const citiesList = document.getElementById('detail-cities');
        citiesList.innerHTML = state.bestCities.map(city => `<li>${city}</li>`).join('');
        
        const placesList = document.getElementById('detail-places');
        placesList.innerHTML = state.famousPlaces.map(place => `<li>${place}</li>`).join('');

        // Distance info
        const homeState = this.storage.getHomeState();
        if (homeState && homeState !== state.name) {
            const distance = this.storage.calculateDistance(homeState, state.name);
            document.getElementById('detail-distance').textContent = `${distance} miles from ${homeState}`;
        } else if (homeState === state.name) {
            document.getElementById('detail-distance').textContent = 'This is your home state';
        } else {
            document.getElementById('detail-distance').textContent = 'Set home state to see distance';
        }

        // Update planning tab
        document.getElementById('detail-recommended-days').textContent = `${state.recommendedDays} days`;
        
        if (homeState && homeState !== state.name) {
            const distance = this.storage.calculateDistance(homeState, state.name);
            const transport = this.storage.getBestTransport(distance);
            document.getElementById('detail-transport').textContent = `${transport.icon} ${transport.mode} (${transport.time})`;
        } else {
            document.getElementById('detail-transport').textContent = homeState === state.name ? '🏠 Home' : 'Set home state';
        }

        document.getElementById('user-planned-days').value = state.userDays || '';
        document.getElementById('user-visit-date').value = state.visitDate || '';

        // Update budget tab
        document.getElementById('detail-estimated-budget').textContent = `$${state.estimatedBudget}`;
        document.getElementById('user-budget').value = state.userBudget || '';
        
        // Budget breakdown
        document.getElementById('accommodation-cost').textContent = `$${Math.round(state.estimatedBudget * 0.4)}`;
        document.getElementById('food-cost').textContent = `$${Math.round(state.estimatedBudget * 0.3)}`;
        document.getElementById('activities-cost').textContent = `$${Math.round(state.estimatedBudget * 0.2)}`;
        document.getElementById('transport-cost').textContent = `$${Math.round(state.estimatedBudget * 0.1)}`;

        // Update personal tab
        document.getElementById('detail-status-select').value = state.status;
        document.getElementById('detail-user-notes').value = state.userNotes || '';

        // Show modal
        document.getElementById('state-detail-modal').style.display = 'block';
    }

    closeDetailModal() {
        document.getElementById('state-detail-modal').style.display = 'none';
        this.currentDetailState = null;
    }

    switchDetailTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.detail-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    saveStateDetails() {
        if (!this.currentDetailState) return;

        const status = document.getElementById('detail-status-select').value;
        const visitDate = document.getElementById('user-visit-date').value;
        const userNotes = document.getElementById('detail-user-notes').value;
        const userDays = document.getElementById('user-planned-days').value;
        const userBudget = document.getElementById('user-budget').value;

        // Update state with new information
        const states = this.storage.getAllStates();
        const stateIndex = states.findIndex(state => state.name === this.currentDetailState);
        
        if (stateIndex !== -1) {
            states[stateIndex].status = status;
            states[stateIndex].visitDate = visitDate;
            states[stateIndex].userNotes = userNotes;
            states[stateIndex].userDays = userDays ? parseInt(userDays) : null;
            states[stateIndex].userBudget = userBudget ? parseInt(userBudget) : null;
            
            localStorage.setItem('travelTracker_states', JSON.stringify(states));
        }

        this.closeDetailModal();
        this.renderStates();
        this.updateStatistics();
    }

    showConfirmation(title, message, onConfirm, onCancel) {
        const titleEl = document.getElementById('confirmation-title');
        const messageEl = document.getElementById('confirmation-message');
        const modalEl = document.getElementById('confirmation-modal');
        
        if (!titleEl || !messageEl || !modalEl) {
            console.error('Confirmation modal elements not found');
            return;
        }
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        this.confirmCallback = onConfirm;
        this.cancelCallback = onCancel;
        
        modalEl.style.display = 'block';
    }

    closeConfirmation() {
        document.getElementById('confirmation-modal').style.display = 'none';
        this.confirmCallback = null;
        this.cancelCallback = null;
    }

    showResetChoiceConfirmation(title, message, onReset, onKeep, onCancel) {
        const titleEl = document.getElementById('reset-choice-title');
        const messageEl = document.getElementById('reset-choice-message');
        const modalEl = document.getElementById('reset-choice-modal');
        
        if (!titleEl || !messageEl || !modalEl) {
            console.error('Reset choice modal elements not found');
            return;
        }
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        this.resetCallback = onReset;
        this.keepCallback = onKeep;
        this.resetCancelCallback = onCancel;
        
        modalEl.style.display = 'block';
    }

    closeResetChoice() {
        document.getElementById('reset-choice-modal').style.display = 'none';
        this.resetCallback = null;
        this.keepCallback = null;
        this.resetCancelCallback = null;
    }

    handleHomeStateChange(newState, oldState, selectElement) {
        // Step 1: Confirm the home state change
        this.showConfirmation(
            'Change Home State?',
            `Do you want to change your home state from ${oldState} to ${newState}?`,
            () => {
                // Step 2: Ask what to do with the old home state
                this.showResetChoiceConfirmation(
                    'What about your previous home state?',
                    `${oldState} is currently marked as "Visited".\n\nWhat would you like to do?`,
                    () => {
                        // User chose to reset - change old state to not-visited
                        this.storage.updateStateStatus(oldState, 'not-visited', null, '');
                        this.storage.setHomeState(newState);
                        this.storage.updateStateStatus(newState, 'visited', new Date().toISOString().split('T')[0], '');
                        this.renderStates();
                        this.updateStatistics();
                    },
                    () => {
                        // User chose to keep - leave old state as visited
                        this.storage.setHomeState(newState);
                        this.storage.updateStateStatus(newState, 'visited', new Date().toISOString().split('T')[0], '');
                        this.renderStates();
                        this.updateStatistics();
                    },
                    () => {
                        // User cancelled - revert selection
                        selectElement.value = oldState;
                    }
                );
            },
            () => {
                // User cancelled step 1 - revert selection
                selectElement.value = oldState;
            }
        );
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