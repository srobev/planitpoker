const socket = io();
let username = '';
let users = {};
let votes = {};
let rows = [];
let modeResults = {};
let currentRowIndex = 0;
let isModerator = false;
let cardsFlipped = false;

function setUsername() {
		username = document.getElementById('usernameInput').value;
		if (username) {
				socket.emit('setUsername', { username });
				document.getElementById('votingSection').style.display = 'block';
				document.getElementById('usernameSection').style.display = 'none';
				document.getElementById('allRowsSection').style.display = 'inline-block';
				document.getElementById('results').style.display = 'inline-block';
				document.getElementByID('currentRowSection').style.display = 'inline-block';
		}
}

function vote(value) {
		if (username && !cardsFlipped) {
				console.log('Voting:', value);
				socket.emit('vote', { vote: value });
		} else {
				alert('Voting is closed or you are not allowed to vote now.');
		}
}

function toggleModerator() {
		const password = document.getElementById('moderatorPassword').value;
		socket.emit('becomeModerator', { password });
}

function removeModerator() {
		socket.emit('removeModerator');
}

function updateModeratorButtonVisibility() {
		const removeModeratorButton = document.getElementById('removeModeratorButton');
		const resetVotesButton = document.getElementById('resetVotesButton');
		const nextRowButton = document.getElementById('nextRowButton');
		const VoteEditor = document.getElementById('votesEditor');
		const saveButton = document.getElementById('saveButton');
		if (isModerator) {
				removeModeratorButton.style.display = 'inline-block';
				resetVotesButton.style.display = 'inline-block';
				nextRowButton.style.display = 'inline-block';
				VoteEditor.style.display = 'inline-block';
				saveButton.style.display = 'inline-block;';
		} else {
				removeModeratorButton.style.display = 'none';
				resetVotesButton.style.display = 'none';
				nextRowButton.style.display = 'none';
				saveButton.style.display = 'none';
				VoteEditor.style.display = 'none';
		}
}

socket.on('moderatorStatus', (data) => {
				if (data.isModerator) {
				isModerator = true;
				console.log('You are now a moderator');
				updateModeratorButtonVisibility();
				document.getElementById('moderatorButton').style.display = 'none';
				document.getElementById('flipCardsButton').style.display = 'block';
				document.getElementById('moderatorSection').style.display = 'none';
				document.getElementById('saveButton').style.display = 'inline-block';
				document.getElementById('votesEditor').style.display = 'inline-block';
				} else if (!data.isModerator) {
				console.log('logout');
				isModerator = false;
				updateModeratorButtonVisibility();
				document.getElementById('flipCardsButton').style.display = 'none';
				document.getElementById('moderatorButton').style.display = 'inline-block';
				document.getElementById('moderatorSection').style.display = 'block';
				document.getElementById('saveButton').style.display = 'none';
				document.getElementById('votesEditor').style.display = 'none';
				} else {
				alert('Incorrect moderator password');
				document.getElementById('moderatorPassword').value = '';
				}
});

socket.on('users', (usersData) => {
				users = usersData;
				updateResults();
				});

socket.on('votes', (data) => {
				votes = data.votes;
				cardsFlipped = data.showVotes;
				currentRowIndex = data.currentRowIndex;
				updateResults();
				if (cardsFlipped) {
				calculateStatistics();
				updateCurrentModeValue();
				}
				});

function updateResults() {
		const resultsBody = document.getElementById('resultsBody');
		const currentRowElement = document.getElementById('currentRow');
		resultsBody.innerHTML = ''; // Clear previous content
		if (rows.length > 0) {
				const currentRow = rows[currentRowIndex];
				currentRowElement.textContent = currentRow;

				for (const [id, name] of Object.entries(users)) {
						let vote = '-';
						if (votes[currentRowIndex] && votes[currentRowIndex][id] !== undefined) {
							vote = cardsFlipped ? votes[currentRowIndex][id] : '?';
						}
						const rowElement = document.createElement('tr');
						const nameCell = document.createElement('td');
						nameCell.textContent = name;
						const voteCell = document.createElement('td');
						voteCell.textContent = vote;
						rowElement.appendChild(nameCell);
						rowElement.appendChild(voteCell);
						resultsBody.appendChild(rowElement);
				}
		}
}

function updateCurrentModeValue() {
		const currentModeValueElement = document.getElementById('currentModeValue');
		const modeResult = modeResults[currentRowIndex];
		currentModeValueElement.textContent = modeResult !== undefined ? modeResult : '-';
}

function updateAllRowsTable() {
	const allRowsBody = document.getElementById('allRowsBody');
	allRowsBody.innerHTML = ''; // Clear previous content
	rows.forEach((row, index) => {
		const rowParts = row.split(' ', 2);
		const firstString = rowParts[0];
		const restOfRow = row.substring(firstString.length).trim();

		const rowElement = document.createElement('tr');
		rowElement.style.border = '1px solid black';

		const firstStringCell = document.createElement('td');
		firstStringCell.textContent = firstString;
		firstStringCell.style.border = '1px solid black';

		const restOfRowCell = document.createElement('td');
		restOfRowCell.textContent = restOfRow;
		restOfRowCell.style.border = '1px solid black';

		const modeResultCell = document.createElement('td');
		modeResultCell.textContent = modeResults[index] !== undefined ? modeResults[index] : ' - ';
		modeResultCell.style.border = '1px solid black';
		rowElement.appendChild(firstStringCell);
		rowElement.appendChild(restOfRowCell);
		rowElement.appendChild(modeResultCell);
		allRowsBody.appendChild(rowElement);
	});
}

function calculateStatistics() {
	const votesArray = Object.values(votes[currentRowIndex] || {}).filter(vote => typeof vote === 'number');
	if (votesArray.length > 0) {
		const average = votesArray.reduce((acc, val) => acc + val, 0) / votesArray.length;
		document.getElementById('averageValue').innerText = average.toFixed(2);

		const modeMap = {};
		let maxCount = 0;
		let modeValue = null;
		votesArray.forEach((vote) => {
			if (modeMap[vote]) {
				modeMap[vote]++;
			} else {
				modeMap[vote] = 1;
			}
			if (modeMap[vote] > maxCount) {
				maxCount = modeMap[vote];
				modeValue = vote;
			}
		});
		document.getElementById('modeValue').innerText = modeValue !== null ? modeValue : '-';
		modeResults[currentRowIndex] = modeValue;
		updateAllRowsTable();
	} else {
		document.getElementById('averageValue').innerText = '-';
		document.getElementById('modeValue').innerText = '-';
	}
}

function flipCards() {
	if (isModerator) {
		console.log('Flipping cards');
		socket.emit('flipCards');
	}
}

function resetVotes() {
	if (isModerator) {
		console.log('Resetting votes');
		socket.emit('resetVotes');
	}
}

function nextRow() {
	if (isModerator) {
		console.log('Moving to the next row');
		socket.emit('nextRow');
	}
}

socket.on('votesReset', () => {
	console.log('Votes have been reset by moderator');
	votes = {};
	cardsFlipped = false;
	currentRowIndex = 0;
	updateResults();
	calculateStatistics();
});

socket.on('initialRows', (rows) => {
	console.log('Initial rows received:', rows);
	const votesBody = document.getElementById('allRowsBody');
	const editor = document.getElementById('votesEditor');
	editor.value = rows.join('\n');
	votesBody.innerHTML = ''; // Clear existing rows

	rows.forEach(row => {
		const [firstColumn, ...restOfRow] = row.split(',');
		const modeResult = '-'; // You can initialize as per your logic
		const newRow = document.createElement('tr');
		newRow.innerHTML = `
			<td>${firstColumn}</td>
			<td>${restOfRow.join(',')}</td>
			<td>${modeResult}</td>
		`;
		votesBody.appendChild(newRow);
	});
});

// Function to fetch and display contents of txt file  in the editor
function fetchRows() {
	fetch('/votes')
	.then(response => response.text())
	.then(data => {
		rows = data.split('\n').filter(line => line.trim() !== '');
		updateResults();
	})
	.catch(error => console.error('Error fetching rows:', error));
}

// Function to save edited content of txt file
function saveText() {
	const editedText = document.getElementById('votesEditor').value;
	socket.emit('saveText', editedText);
}

//TODO: Function to update the table showing rows from txt file
function updateVotesTable() {
		// Implement logic to update the table with new data from txt file
		// Fetch the updated data or refresh the table
}

document.addEventListener('DOMContentLoaded', fetchRows);
