class TeamManager {
    constructor() {
        this.teams = [];
        this.loadTeams();
        this.setupEventListeners();
    }

    loadTeams() {
        const savedTeams = localStorage.getItem('pickleballTeams');
        if (savedTeams) {
            this.teams = JSON.parse(savedTeams);
            this.updateTeamsList();
            this.updateStartButton();
        }
    }

    saveTeams() {
        localStorage.setItem('pickleballTeams', JSON.stringify(this.teams));
    }

    addTeam(player1, player2, seed) {
        const highestSeed = this.teams.reduce((max, team) => 
            Math.max(max, team.seed), 0);

        const team = {
            id: Date.now(),
            player1,
            player2,
            seed: seed || highestSeed + 1
        };
        this.teams.push(team);
        this.teams.sort((a, b) => a.seed - b.seed);
        this.saveTeams();
        this.updateTeamsList();
        this.updateStartButton();
    }

    removeTeam(teamId) {
        this.teams = this.teams.filter(team => team.id !== teamId);
        this.saveTeams();
        this.updateTeamsList();
        this.updateStartButton();
    }

    updateTeamsList() {
        const teamsList = document.getElementById('teams-list');
        teamsList.innerHTML = '';
        
        this.teams.forEach(team => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.dataset.teamId = team.id;
            li.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="drag-handle me-2">⋮⋮</span>
                    <span>${team.player1} & ${team.player2} (Seed: ${team.seed})</span>
                </div>
                <button class="btn btn-danger btn-sm remove-team" data-team-id="${team.id}">Remove</button>
            `;
            teamsList.appendChild(li);
        });

        // Initialize Sortable
        if (!this.sortable) {
            this.sortable = new Sortable(teamsList, {
                handle: '.drag-handle',
                animation: 150,
                onEnd: (evt) => {
                    this.updateSeeds();
                }
            });
        }
    }

    updateSeeds() {
        const teamsList = document.getElementById('teams-list');
        const items = teamsList.getElementsByTagName('li');
        
        // Create new array with updated order
        const reorderedTeams = Array.from(items).map((item, index) => {
            const teamId = parseInt(item.dataset.teamId);
            const team = this.teams.find(t => t.id === teamId);
            return {
                ...team,
                seed: index + 1
            };
        });

        // Update teams array and save
        this.teams = reorderedTeams;
        this.saveTeams();
        this.updateTeamsList();
    }

    updateStartButton() {
        const startButton = document.getElementById('start-tournament');
        startButton.disabled = this.teams.length < 4;
    }

    setupEventListeners() {
        const teamForm = document.getElementById('team-form');
        const teamsList = document.getElementById('teams-list');
        const startButton = document.getElementById('start-tournament');

        teamForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const player1 = document.getElementById('player1').value;
            const player2 = document.getElementById('player2').value;
            const seed = parseInt(document.getElementById('seed').value) || null;
            
            this.addTeam(player1, player2, seed);
            teamForm.reset();
        });

        teamsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-team')) {
                const teamId = parseInt(e.target.dataset.teamId);
                this.removeTeam(teamId);
            }
        });

        startButton.addEventListener('click', () => {
            const tournament = new TournamentBracket(this.teams);
            tournament.initializeBrackets();
            document.getElementById('registration-section').style.display = 'none';
        });
    }
}

const teamManager = new TeamManager(); 