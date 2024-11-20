class TournamentBracket {
    constructor(teams) {
        this.teams = teams;
        this.winnersBracket = [];
        this.losersBracket = [];
        this.matchHistory = [];
    }

    initializeBrackets() {
        this.createWinnersBracket();
        this.renderBrackets();
        this.setupClickHandlers();
    }

    createWinnersBracket() {
        // Calculate number of rounds needed
        const roundCount = Math.ceil(Math.log2(this.teams.length));
        
        // Create initial round
        let currentRound = this.teams.map(team => ({
            team1: team,
            team2: null,
            winner: null,
            loser: null
        }));

        // Fill in byes if necessary
        const totalSlots = Math.pow(2, roundCount);
        while (currentRound.length < totalSlots) {
            currentRound.push({
                team1: null,
                team2: null,
                winner: null,
                loser: null
            });
        }

        // Pair up teams
        currentRound = this.pairTeams(currentRound);
        this.winnersBracket.push(currentRound);

        // Create subsequent rounds
        for (let i = 1; i < roundCount; i++) {
            const nextRound = [];
            for (let j = 0; j < currentRound.length / 2; j++) {
                nextRound.push({
                    team1: null,
                    team2: null,
                    winner: null,
                    loser: null
                });
            }
            this.winnersBracket.push(nextRound);
            currentRound = nextRound;
        }
    }

    pairTeams(matches) {
        // Implementation of standard tournament seeding
        const pairedMatches = [];
        const n = matches.length;
        
        for (let i = 0; i < n/2; i++) {
            pairedMatches.push({
                team1: matches[i].team1,
                team2: matches[n-1-i].team1,
                winner: null,
                loser: null
            });
        }
        
        return pairedMatches;
    }

    renderBrackets() {
        this.renderWinnersBracket();
        this.renderLosersBracket();
    }

    renderWinnersBracket() {
        const bracket = document.getElementById('winners-bracket');
        bracket.innerHTML = '';

        this.winnersBracket.forEach((round, roundIndex) => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round';
            roundDiv.innerHTML = `<h3>Round ${roundIndex + 1}</h3>`;

            round.forEach((match, matchIndex) => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'match';
                matchDiv.dataset.round = roundIndex;
                matchDiv.dataset.match = matchIndex;
                matchDiv.dataset.bracket = 'winners';

                matchDiv.innerHTML = `
                    <div class="team ${match.winner === match.team1 ? 'winner' : ''}" 
                         data-team-id="${match.team1?.id || ''}"}>
                        ${match.team1 ? `${match.team1.player1} & ${match.team1.player2}` : 'TBD'}
                    </div>
                    <div class="team ${match.winner === match.team2 ? 'winner' : ''}"
                         data-team-id="${match.team2?.id || ''}"}>
                        ${match.team2 ? `${match.team2.player1} & ${match.team2.player2}` : 'TBD'}
                    </div>
                `;

                roundDiv.appendChild(matchDiv);
            });

            bracket.appendChild(roundDiv);
        });
    }

    renderLosersBracket() {
        const bracket = document.getElementById('losers-bracket');
        bracket.innerHTML = '<h3>Losers Bracket</h3>';
        
        if (this.losersBracket.length === 0) return;

        this.losersBracket.forEach((round, roundIndex) => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round';
            roundDiv.innerHTML = `<h4>Round ${roundIndex + 1}</h4>`;

            round.forEach((match, matchIndex) => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'match';
                matchDiv.dataset.round = roundIndex;
                matchDiv.dataset.match = matchIndex;
                matchDiv.dataset.bracket = 'losers';

                matchDiv.innerHTML = `
                    <div class="team ${match.winner === match.team1 ? 'winner' : ''}"
                         data-team-id="${match.team1?.id || ''}"}>
                        ${match.team1 ? `${match.team1.player1} & ${match.team1.player2}` : 'TBD'}
                    </div>
                    <div class="team ${match.winner === match.team2 ? 'winner' : ''}"
                         data-team-id="${match.team2?.id || ''}"}>
                        ${match.team2 ? `${match.team2.player1} & ${match.team2.player2}` : 'TBD'}
                    </div>
                `;

                roundDiv.appendChild(matchDiv);
            });

            bracket.appendChild(roundDiv);
        });
    }

    setupClickHandlers() {
        document.getElementById('winners-bracket').addEventListener('click', (e) => {
            if (e.target.classList.contains('team') && e.target.textContent !== 'TBD') {
                this.handleTeamClick(e.target);
            }
        });

        document.getElementById('losers-bracket').addEventListener('click', (e) => {
            if (e.target.classList.contains('team') && e.target.textContent !== 'TBD') {
                this.handleTeamClick(e.target);
            }
        });
    }

    handleTeamClick(teamElement) {
        const matchDiv = teamElement.parentElement;
        const round = parseInt(matchDiv.dataset.round);
        const matchIndex = parseInt(matchDiv.dataset.match);
        const bracket = matchDiv.dataset.bracket;

        const match = bracket === 'winners' 
            ? this.winnersBracket[round][matchIndex]
            : this.losersBracket[round][matchIndex];

        const clickedTeamId = parseInt(teamElement.dataset.teamId);
        const clickedTeam = this.teams.find(team => team.id === clickedTeamId);

        if (match.winner) return; // Match already decided

        match.winner = clickedTeam;
        match.loser = clickedTeam === match.team1 ? match.team2 : match.team1;

        // Advance winner
        if (bracket === 'winners') {
            if (round + 1 < this.winnersBracket.length) {
                const nextMatchIndex = Math.floor(matchIndex / 2);
                const nextMatch = this.winnersBracket[round + 1][nextMatchIndex];
                if (matchIndex % 2 === 0) {
                    nextMatch.team1 = match.winner;
                } else {
                    nextMatch.team2 = match.winner;
                }
            }
            
            // Move loser to losers bracket
            this.addToLosersBracket(match.loser, round);
        } else {
            // Handle advancement in losers bracket
            if (round + 1 < this.losersBracket.length) {
                const nextMatchIndex = Math.floor(matchIndex / 2);
                const nextMatch = this.losersBracket[round + 1][nextMatchIndex];
                if (matchIndex % 2 === 0) {
                    nextMatch.team1 = match.winner;
                } else {
                    nextMatch.team2 = match.winner;
                }
            }
        }

        this.renderBrackets();
    }

    addToLosersBracket(team, winnersBracketRound) {
        if (this.losersBracket.length === 0) {
            this.losersBracket.push([]);
        }

        const currentRound = this.losersBracket[this.losersBracket.length - 1];
        
        if (currentRound.length === 0 || currentRound[currentRound.length - 1].team2) {
            currentRound.push({
                team1: team,
                team2: null,
                winner: null,
                loser: null
            });
        } else {
            currentRound[currentRound.length - 1].team2 = team;
        }

        // Create new round if necessary
        if (currentRound.length === Math.pow(2, this.losersBracket.length - 1)) {
            this.losersBracket.push([]);
        }
    }
} 