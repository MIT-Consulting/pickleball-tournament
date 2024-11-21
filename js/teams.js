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
            li.innerHTML = `
                ${team.player1} & ${team.player2} (Seed: ${team.seed})
                <button class="btn btn-danger btn-sm remove-team" data-team-id="${team.id}">Remove</button>
            `;
            teamsList.appendChild(li);
        });
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