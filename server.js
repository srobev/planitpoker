const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
//const tasksFilePath = __dirname + '/public/tasks.txt';

let users = {};
let votes = {};
let showVotes = false;
let moderators = {};
let currentRowIndex = 0;
let rows = [];

const MODERATOR_PASSWORD = '1234'; // Set your moderator password here
const TASKS_FILE_PATH = path.join(__dirname, '/public/tasks.txt'); // Path to your text file with tasks split by ID REST_TEXT_IS_THE_NAME


// Serve the text file content
app.get('/votes', (req, res) => {
	fs.readFile(TASKS_FILE_PATH, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading file:', err);
			res.status(500).send('Internal Server Error');
		} else {
			rows = data.split('\n').filter(line => line.trim() !== '');
			res.send(data);
		}
	});
});

io.on('connection', (socket) => {
	console.log('a user connected:', socket.id);

	socket.on('setUsername', (data) => {
		users[socket.id] = data.username;
		console.log('Username set:', data.username);
		io.emit('users', users);
		io.emit('votes', { votes, showVotes, currentRowIndex });
		fs.readFile(TASKS_FILE_PATH, 'utf-8', (err, data) => {
			if (err) {
				console.error('Error reading ', TASKS_FILE_PATH, ':', err);
				return;
			}
			const rows = data.split('\n').map(row => row.trim()).filter(row => row !== '');
			socket.emit('initialRows', rows);
		});
	});

	socket.on('becomeModerator', (data) => {
		if (data.password === MODERATOR_PASSWORD) {
			moderators[socket.id] = true;
			console.log('Moderator added:', socket.id);
			socket.emit('moderatorStatus', { isModerator: true });
		} else {
			socket.emit('moderatorStatus', { isModerator: false });
		}
	});
	socket.on('removeModerator', () => {
		delete moderators[socket.id];
		console.log('Moderator removed:', socket.id);
		socket.emit('moderatorStatus', { isModerator: false });
	});

	socket.on('vote', (data) => {
		if (!votes[currentRowIndex]) {
			votes[currentRowIndex] = {};
		}
		votes[currentRowIndex][socket.id] = data.vote;
		console.log('Vote received:', data.vote, 'from', socket.id, 'for row', currentRowIndex);
		io.emit('votes', { votes, showVotes, currentRowIndex });
	});

	socket.on('flipCards', () => {
		if (moderators[socket.id]) {
			showVotes = true;
			console.log('Cards flipped by:', socket.id);
			io.emit('votes', { votes, showVotes, currentRowIndex });
		}
	});

	socket.on('nextRow', () => {
		if (moderators[socket.id]) {
			if (currentRowIndex < rows.length - 1) {
				currentRowIndex++;
				votes = {}; // Reset votes for the new row
				showVotes = false; // Reset showVotes for the new row
				console.log('Next row:', currentRowIndex);
				io.emit('votes', { votes, showVotes, currentRowIndex });
			} else {
				console.log('No more rows');
			}
		}
	});

	socket.on('resetVotes', () => {
		if (moderators[socket.id]) {
			votes = {};
			showVotes = false;
			currentRowIndex = 0;
			console.log('Votes reset by:', socket.id);
			io.emit('votesReset');
		}
	});

	socket.on('disconnect', () => {
		console.log('a user disconnected:', socket.id);
		delete users[socket.id];
		for (let rowIndex in votes) {
			if (votes[rowIndex][socket.id]) {
				delete votes[rowIndex][socket.id];
			}
		}
		delete moderators[socket.id];
		io.emit('users', users);
		io.emit('votes', { votes, showVotes, currentRowIndex });
	});

	socket.on('saveText', (editedText) => {
		// Save edited text to tasks file
		fs.writeFile(TASKS_FILE_PATH, editedText, (err) => {
			if (err) {
				console.error('Error saving text:', err);
				socket.emit('saveTextError', 'Error saving file');
				return;
			}
			console.log('File updated successfully');
			socket.emit('textSavedSuccessfully');
		});
	});
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});

