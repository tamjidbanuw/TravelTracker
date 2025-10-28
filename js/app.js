// Main application logic for travel tracker
class TravelTracker {
    constructor() {
        this.storage = new TravelStorage();
        this.currentEditingState = null;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupHomeStateSelect();
        this.renderStates();
        this.updateStatistics();
    }

    bindEvents() {
        // Analytics toggle
        const analyticsHeader = document.getElementById('analytics-header');
        const analyticsToggle = document.getElementById('analytics-toggle');
        const analyticsContent = document.getElementById('analytics-content');

        analyticsHeader.addEventListener('click', () => {
            const isExpanded = analyticsContent.classList.contains('expanded');
            
            if (isExpanded) {
                analyticsContent.classList.remove('expanded');
                analyticsToggle.classList.remove('expanded');
                analyticsToggle.querySelector('.toggle-text').textContent = 'Show Details';
            } else {
                analyticsContent.classList.add('expanded');
                analyticsToggle.classList.add('expanded');
                analyticsToggle.querySelector('.toggle-text').textContent = 'Hide Details';
            }
        });

        // Home state selection
        const homeStateSelect = document.getElementById('home-state-select');

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
        });
    }



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
        
        // Update header color based on status
        const header = document.querySelector('.state-detail-header');
        header.className = `state-detail-header status-${state.status}`;

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
        
        // Update progress bar and analytics
        this.updateProgressBar(stateStats);
        this.updateAnalytics();
    }

    updateProgressBar(stats) {
        const totalStates = 50;
        const visitedPercent = Math.round((stats.visited / totalStates) * 100);
        const plannedPercent = Math.round((stats.planToVisit / totalStates) * 100);
        const totalProgress = visitedPercent + plannedPercent;

        // Update completion percentage
        document.getElementById('completion-percent').textContent = `${visitedPercent}%`;
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = `${totalProgress}%`;
        progressFill.style.setProperty('--visited-width', `${(visitedPercent / totalProgress) * 100}%`);
        
        // Update progress stats
        document.getElementById('visited-count').textContent = stats.visited;
        document.getElementById('planned-count').textContent = stats.planToVisit;
        document.getElementById('remaining-count').textContent = stats.notVisited;
    }

    updateAnalytics() {
        this.updateRegionalProgress();
        this.updateTravelPersonality();
        this.updateAchievements();
        this.updateRecommendations();
    }

    updateRegionalProgress() {
        const states = this.storage.getAllStates();
        const homeState = this.storage.getHomeState();
        
        // Define US regions (US Census Bureau standard regions)
        const regions = {
            'Northeast': ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'New Jersey', 'New York', 'Pennsylvania', 'Rhode Island', 'Vermont'],
            'Midwest': ['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'South Dakota', 'Wisconsin'],
            'South': ['Alabama', 'Arkansas', 'Delaware', 'Florida', 'Georgia', 'Kentucky', 'Louisiana', 'Maryland', 'Mississippi', 'North Carolina', 'Oklahoma', 'South Carolina', 'Tennessee', 'Texas', 'Virginia', 'West Virginia'],
            'West': ['Alaska', 'Arizona', 'California', 'Colorado', 'Hawaii', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Oregon', 'Utah', 'Washington', 'Wyoming']
        };

        const container = document.getElementById('regional-progress');
        
        const regionHTML = Object.entries(regions).map(([regionName, regionStates]) => {
            const visitedInRegion = regionStates.filter(stateName => {
                const state = states.find(s => s.name === stateName);
                return state && state.status === 'visited' && stateName !== homeState;
            }).length;
            
            const totalInRegion = regionStates.length;
            const isCompleted = visitedInRegion === totalInRegion;
            
            return `
                <div class="region-item ${isCompleted ? 'completed' : ''}">
                    <div class="region-name">${regionName}</div>
                    <div class="region-progress">
                        <span class="region-count">${visitedInRegion}/${totalInRegion}</span>
                        <span class="region-badge">${Math.round((visitedInRegion / totalInRegion) * 100)}%</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = regionHTML || '<p class="no-data">Visit states to see regional progress!</p>';
    }

    updateTravelPersonality() {
        const states = this.storage.getAllStates();
        const homeState = this.storage.getHomeState();
        const visitedStates = states.filter(state => state.status === 'visited' && state.name !== homeState);
        
        const container = document.getElementById('travel-personality');
        
        if (visitedStates.length === 0) {
            container.innerHTML = '<p class="no-data">Visit states to discover your travel style!</p>';
            return;
        }

        // Analyze travel patterns
        const totalVisited = visitedStates.length;
        const withDates = visitedStates.filter(s => s.visitDate).length;
        const withNotes = visitedStates.filter(s => s.userNotes && s.userNotes.trim()).length;
        
        // Determine personality type
        let personalityType = '';
        let description = '';
        let traits = [];

        if (totalVisited >= 25) {
            personalityType = '🌟 Master Explorer';
            description = 'You\'re a seasoned traveler who has seen most of America!';
            traits = ['Experienced', 'Adventurous', 'Well-Traveled'];
        } else if (totalVisited >= 15) {
            personalityType = '🗺️ Avid Adventurer';
            description = 'You love exploring new places and have great travel momentum!';
            traits = ['Enthusiastic', 'Curious', 'Goal-Oriented'];
        } else if (totalVisited >= 8) {
            personalityType = '🎒 Weekend Warrior';
            description = 'You enjoy regular getaways and discovering new destinations!';
            traits = ['Consistent', 'Exploratory', 'Balanced'];
        } else if (totalVisited >= 3) {
            personalityType = '🌱 Rising Explorer';
            description = 'You\'re building great travel habits and expanding your horizons!';
            traits = ['Growing', 'Motivated', 'Curious'];
        } else {
            personalityType = '🚀 Future Traveler';
            description = 'Your adventure is just beginning - exciting times ahead!';
            traits = ['Potential', 'Dreamer', 'Ready'];
        }

        // Add traits based on behavior
        if (withNotes / Math.max(totalVisited, 1) > 0.7) {
            traits.push('Thoughtful');
        }
        if (withDates / Math.max(totalVisited, 1) > 0.8) {
            traits.push('Organized');
        }

        const traitsHTML = traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('');

        container.innerHTML = `
            <div class="personality-type">${personalityType}</div>
            <div class="personality-description">${description}</div>
            <div class="personality-traits">${traitsHTML}</div>
        `;
    }

    updateAchievements() {
        const states = this.storage.getAllStates();
        const homeState = this.storage.getHomeState();
        const visitedStates = states.filter(state => state.status === 'visited' && state.name !== homeState);
        
        const achievements = [
            {
                id: 'first-state',
                icon: '🎯',
                name: 'First Steps',
                description: '1 state',
                unlocked: visitedStates.length >= 1
            },
            {
                id: 'three-states',
                icon: '🌟',
                name: 'Getting Started',
                description: '3 states',
                unlocked: visitedStates.length >= 3
            },
            {
                id: 'five-states',
                icon: '⭐',
                name: 'Explorer',
                description: '5 states',
                unlocked: visitedStates.length >= 5
            },
            {
                id: 'seven-states',
                icon: '🚀',
                name: 'Rising Star',
                description: '7 states',
                unlocked: visitedStates.length >= 7
            },
            {
                id: 'ten-states',
                icon: '🏆',
                name: 'Adventurer',
                description: '10 states',
                unlocked: visitedStates.length >= 10
            },
            {
                id: 'fifteen-states',
                icon: '🎖️',
                name: 'Veteran Traveler',
                description: '15 states',
                unlocked: visitedStates.length >= 15
            },
            {
                id: 'twenty-states',
                icon: '👑',
                name: 'Travel Royalty',
                description: '20 states',
                unlocked: visitedStates.length >= 20
            },
            {
                id: 'twenty-five-states',
                icon: '💎',
                name: 'Diamond Explorer',
                description: '25 states',
                unlocked: visitedStates.length >= 25
            },
            {
                id: 'thirty-states',
                icon: '✨',
                name: 'Elite Traveler',
                description: '30 states',
                unlocked: visitedStates.length >= 30
            },
            {
                id: 'forty-states',
                icon: '🔥',
                name: 'Legend',
                description: '40 states',
                unlocked: visitedStates.length >= 40
            },
            {
                id: 'all-states',
                icon: '🏅',
                name: 'Master of America',
                description: 'All 50 states',
                unlocked: visitedStates.length >= 50
            },
            {
                id: 'quarter-complete',
                icon: '🎊',
                name: 'Quarter Master',
                description: '25% complete',
                unlocked: visitedStates.length >= 12
            },
            {
                id: 'half-complete',
                icon: '🎉',
                name: 'Halfway Hero',
                description: '50% complete',
                unlocked: visitedStates.length >= 25
            },
            {
                id: 'three-quarters',
                icon: '🎆',
                name: 'Almost There',
                description: '75% complete',
                unlocked: visitedStates.length >= 37
            },
            {
                id: 'coast-to-coast',
                icon: '🌊',
                name: 'Coast to Coast',
                description: 'Both coasts',
                unlocked: this.hasCoastToCoast(visitedStates)
            },
            {
                id: 'note-taker',
                icon: '📝',
                name: 'Memory Keeper',
                description: '5 notes',
                unlocked: visitedStates.filter(s => s.userNotes && s.userNotes.trim()).length >= 5
            },
            {
                id: 'storyteller',
                icon: '📖',
                name: 'Storyteller',
                description: '10 notes',
                unlocked: visitedStates.filter(s => s.userNotes && s.userNotes.trim()).length >= 10
            },
            {
                id: 'region-master',
                icon: '🗺️',
                name: 'Region Master',
                description: 'Complete 1 region',
                unlocked: this.hasCompleteRegion(visitedStates)
            },
            {
                id: 'region-champion',
                icon: '🏰',
                name: 'Region Champion',
                description: 'Complete 2 regions',
                unlocked: this.hasCompleteRegions(visitedStates, 2)
            },
            {
                id: 'speed-runner',
                icon: '⚡',
                name: 'Speed Runner',
                description: '5 states in 1 year',
                unlocked: this.hasSpeedRun(visitedStates)
            },
            {
                id: 'marathon-runner',
                icon: '🏃',
                name: 'Marathon Runner',
                description: '10 states in 1 year',
                unlocked: this.hasMarathonRun(visitedStates)
            },
            {
                id: 'mountain-climber',
                icon: '⛰️',
                name: 'Mountain Climber',
                description: 'Visit 3 mountain states',
                unlocked: this.hasMountainStates(visitedStates)
            },
            {
                id: 'beach-lover',
                icon: '🏖️',
                name: 'Beach Lover',
                description: 'Visit 5 coastal states',
                unlocked: this.hasCoastalStates(visitedStates)
            },
            {
                id: 'desert-explorer',
                icon: '🌵',
                name: 'Desert Explorer',
                description: 'Visit 3 desert states',
                unlocked: this.hasDesertStates(visitedStates)
            }
        ];

        const container = document.getElementById('achievements');
        
        const achievementsHTML = achievements.map(achievement => `
            <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}" 
                 data-tooltip="${achievement.name}: ${achievement.description}">
                <span class="achievement-icon">${achievement.icon}</span>
            </div>
        `).join('');

        container.innerHTML = achievementsHTML || '<p class="no-data">Start exploring to unlock achievements!</p>';
    }

    updateRecommendations() {
        const states = this.storage.getAllStates();
        const homeState = this.storage.getHomeState();
        const container = document.getElementById('recommendations');
        
        if (!homeState) {
            container.innerHTML = '<p class="no-data">Set your home state to get recommendations!</p>';
            return;
        }

        const visitedStates = states.filter(state => state.status === 'visited');
        const unvisitedStates = states.filter(state => state.status === 'not-visited' && state.name !== homeState);
        
        if (unvisitedStates.length === 0) {
            container.innerHTML = '<p class="no-data">Congratulations! You\'ve visited all states!</p>';
            return;
        }

        // Get recommendations based on distance and other factors
        const recommendations = unvisitedStates
            .map(state => {
                const distance = this.storage.calculateDistance(homeState, state.name);
                let reason = '';
                
                if (distance <= 300) {
                    reason = 'Weekend trip';
                } else if (distance <= 800) {
                    reason = 'Road trip';
                } else {
                    reason = 'Far adventure';
                }

                return {
                    state: state,
                    distance: distance,
                    reason: reason
                };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3);

        const recommendationsHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-state">${rec.state.name}</div>
                <div class="recommendation-reason">${rec.reason}</div>
                <div class="recommendation-distance">${rec.distance} miles away</div>
                <button class="recommendation-button" onclick="app.openDetailModal('${rec.state.name}')">
                    Plan Visit
                </button>
            </div>
        `).join('');

        container.innerHTML = recommendationsHTML;
    }

    hasCoastToCoast(visitedStates) {
        const eastCoast = ['Maine', 'New Hampshire', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New York', 'New Jersey', 'Delaware', 'Maryland', 'Virginia', 'North Carolina', 'South Carolina', 'Georgia', 'Florida'];
        const westCoast = ['Washington', 'Oregon', 'California'];
        
        const hasEast = visitedStates.some(state => eastCoast.includes(state.name));
        const hasWest = visitedStates.some(state => westCoast.includes(state.name));
        
        return hasEast && hasWest;
    }

    hasCompleteRegion(visitedStates) {
        const regions = {
            'Northeast': ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'New Jersey', 'New York', 'Pennsylvania', 'Rhode Island', 'Vermont'],
            'Midwest': ['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'South Dakota', 'Wisconsin'],
            'South': ['Alabama', 'Arkansas', 'Delaware', 'Florida', 'Georgia', 'Kentucky', 'Louisiana', 'Maryland', 'Mississippi', 'North Carolina', 'Oklahoma', 'South Carolina', 'Tennessee', 'Texas', 'Virginia', 'West Virginia'],
            'West': ['Alaska', 'Arizona', 'California', 'Colorado', 'Hawaii', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Oregon', 'Utah', 'Washington', 'Wyoming']
        };

        const homeState = this.storage.getHomeState();
        
        return Object.values(regions).some(regionStates => {
            const visitedInRegion = regionStates.filter(stateName => {
                return visitedStates.some(visited => visited.name === stateName) && stateName !== homeState;
            });
            return visitedInRegion.length === regionStates.length;
        });
    }

    hasCompleteRegions(visitedStates, requiredCount) {
        const regions = {
            'Northeast': ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'New Jersey', 'New York', 'Pennsylvania', 'Rhode Island', 'Vermont'],
            'Midwest': ['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'South Dakota', 'Wisconsin'],
            'South': ['Alabama', 'Arkansas', 'Delaware', 'Florida', 'Georgia', 'Kentucky', 'Louisiana', 'Maryland', 'Mississippi', 'North Carolina', 'Oklahoma', 'South Carolina', 'Tennessee', 'Texas', 'Virginia', 'West Virginia'],
            'West': ['Alaska', 'Arizona', 'California', 'Colorado', 'Hawaii', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Oregon', 'Utah', 'Washington', 'Wyoming']
        };

        const homeState = this.storage.getHomeState();
        let completedRegions = 0;
        
        Object.values(regions).forEach(regionStates => {
            const visitedInRegion = regionStates.filter(stateName => {
                return visitedStates.some(visited => visited.name === stateName) && stateName !== homeState;
            });
            if (visitedInRegion.length === regionStates.length) {
                completedRegions++;
            }
        });

        return completedRegions >= requiredCount;
    }

    hasSpeedRun(visitedStates) {
        if (visitedStates.length < 5) return false;
        
        const statesWithDates = visitedStates.filter(state => state.visitDate);
        if (statesWithDates.length < 5) return false;

        // Group by year
        const yearGroups = {};
        statesWithDates.forEach(state => {
            const year = new Date(state.visitDate).getFullYear();
            yearGroups[year] = (yearGroups[year] || 0) + 1;
        });

        // Check if any year has 5 or more visits
        return Object.values(yearGroups).some(count => count >= 5);
    }

    hasMarathonRun(visitedStates) {
        if (visitedStates.length < 10) return false;
        
        const statesWithDates = visitedStates.filter(state => state.visitDate);
        if (statesWithDates.length < 10) return false;

        // Group by year
        const yearGroups = {};
        statesWithDates.forEach(state => {
            const year = new Date(state.visitDate).getFullYear();
            yearGroups[year] = (yearGroups[year] || 0) + 1;
        });

        // Check if any year has 10 or more visits
        return Object.values(yearGroups).some(count => count >= 10);
    }

    hasMountainStates(visitedStates) {
        const mountainStates = ['Colorado', 'Montana', 'Wyoming', 'Idaho', 'Utah', 'Nevada', 'Alaska', 'Washington', 'Oregon'];
        const visitedMountainStates = visitedStates.filter(state => mountainStates.includes(state.name));
        return visitedMountainStates.length >= 3;
    }

    hasCoastalStates(visitedStates) {
        const coastalStates = ['Maine', 'New Hampshire', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New York', 'New Jersey', 'Delaware', 'Maryland', 'Virginia', 'North Carolina', 'South Carolina', 'Georgia', 'Florida', 'Alabama', 'Mississippi', 'Louisiana', 'Texas', 'California', 'Oregon', 'Washington', 'Alaska', 'Hawaii'];
        const visitedCoastalStates = visitedStates.filter(state => coastalStates.includes(state.name));
        return visitedCoastalStates.length >= 5;
    }

    hasDesertStates(visitedStates) {
        const desertStates = ['Arizona', 'Nevada', 'New Mexico', 'Utah', 'California', 'Texas'];
        const visitedDesertStates = visitedStates.filter(state => desertStates.includes(state.name));
        return visitedDesertStates.length >= 3;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TravelTracker();
});