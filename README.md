# Pokémon Gen 1 Speedrun Bingo

A collaborative bingo board application for Pokémon Generation 1 speedrun challenges. Create custom challenges, generate randomized bingo boards, and share progress with friends in real-time!

## Features

- **Challenge Management**: Add custom speedrun challenges to a persistent database
- **Random Bingo Generation**: Creates 5x5 bingo boards using seeded randomization (UUID as seed)
- **Shared Rooms**: Each bingo run gets a unique URL that can be shared with friends
- **Real-time Sync**: Progress is synchronized across all players in the same room
- **Persistent Data**: All challenges and progress are saved to an SQLite database
- **No Authentication**: Simple to use - just share the room URL!

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Add Challenges**: Use the form on the home page to add speedrun challenges
2. **Create Bingo Run**: Once you have at least 25 challenges, click "Create New Bingo Run"
3. **Share Room**: Copy the generated URL and share it with friends
4. **Play Together**: Click on challenges to mark them complete - all players will see updates instantly

## Technical Details

### Architecture

- **Frontend**: Next.js 14 with TypeScript and React
- **Backend**: Next.js API routes
- **Database**: SQLite with custom database layer
- **Real-time**: Socket.IO for live synchronization
- **Styling**: Custom CSS with modern design

### Key Components

- `ChallengeForm`: Add new challenges to the database
- `ChallengesList`: Display all available challenges
- `BingoBoard`: Interactive 5x5 grid with real-time updates
- `Database`: SQLite wrapper for challenges and runs

### API Endpoints

- `GET /api/challenges` - Fetch all challenges
- `POST /api/challenges` - Add new challenge
- `POST /api/runs` - Create new bingo run
- `GET /api/runs/[id]` - Get bingo run data
- `PATCH /api/runs/[id]` - Update progress
- `WS /api/socket` - Socket.IO endpoint for real-time sync

## Development

The app uses:
- SQLite database stored as `bingo.db` in the project root
- Socket.IO for real-time communication between players
- Seeded randomization ensures the same UUID always generates the same bingo board
- Responsive design works on desktop and mobile

## Example Challenges

Here are some example Pokémon Gen 1 speedrun challenges you can add:

- Catch a Pikachu in Viridian Forest
- Defeat Brock without using Water/Grass moves
- Obtain the Bicycle
- Catch 5 different Pokémon species
- Defeat a Team Rocket Grunt
- Use a Super Potion
- Enter Cerulean Cave
- Catch an Abra
- Defeat Misty with an Electric-type move
- Find a Moon Stone

Have fun with your speedrun bingo sessions!
