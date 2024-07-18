# PlanIT Poker Clone

This is a README.md template for a PlanIT Poker clone project.

## Overview

PlanIT Poker is a collaborative tool for teams to estimate project complexity using the Planning Poker technique. This clone project aims to replicate its functionality with real-time voting and moderation features.

## Features

- **User Authentication**: Users can set their usernames to participate in voting.
- **Moderator Controls**: Moderators can manage voting sessions, flip cards to reveal votes, and reset votes.
- **Real-time Updates**: Voting results and statistics are updated in real-time for all participants.
- **Visualization**: Clear visualization of votes, mode value, and average value after flipping cards.
- **Text File Integration**: Ability for moderators to edit and save a text file containing voting options, which are displayed for users to vote on.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Socket.IO for real-time communication.
- **Backend**: Node.js, Express.js for server-side logic, Socket.IO for real-time communication.
- **Persistence**: Votes and settings stored in-memory (can be extended to use a database for persistence).
- **Editor Integration**: Ability to edit and save text files directly from the application interface.

## Installation and Usage

1. Clone the repository: `git clone https://github.com/your/repository.git`
2. Navigate to the project directory: `cd planit-poker-clone`
3. Install dependencies: `npm install`
4. Start the server: `node server.js`
5. Open your browser and navigate to `http://localhost:3000`

## How to Use

- Set your username and participate in voting.
- Moderators can manage sessions, flip cards to reveal votes, and reset votes. Modify server.js to set the moderator password.
- Editing and saving the text file (tasks.txt) updates the voting options dynamically.

## Contributing

Contributions are welcome! Fork the repository and submit pull requests for any improvements or fixes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
