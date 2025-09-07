import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'bingo.db');

export interface Challenge {
    id: number;
    title: string;
    description: string;
    created_at: string;
}

export interface BingoRun {
    id: string;
    challenges: string; // JSON string of challenge IDs
    progress: string; // JSON string of completed challenge indices
    two_player_mode: boolean; // Whether two-player mode is enabled
    player1_progress: string; // JSON string of player 1 completed challenges
    player2_progress: string; // JSON string of player 2 completed challenges
    created_at: string;
}

class Database {
    private db: sqlite3.Database;

    constructor() {
        this.db = new sqlite3.Database(dbPath);
        this.init();
    }

    private init() {
        this.db.serialize(() => {
            // Create challenges table with new schema
            this.db.run(`
        CREATE TABLE IF NOT EXISTS challenges (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
                if (err) {
                    console.error('Error creating challenges table:', err);
                }
            });

            // Create bingo_runs table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS bingo_runs (
          id TEXT PRIMARY KEY,
          challenges TEXT NOT NULL,
          progress TEXT DEFAULT '[]',
          two_player_mode BOOLEAN DEFAULT 0,
          player1_progress TEXT DEFAULT '[]',
          player2_progress TEXT DEFAULT '[]',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
                if (err) {
                    console.error('Error creating bingo_runs table:', err);
                }
            });
        });
    }

    // Challenge methods
    addChallenge(title: string, description: string): Promise<Challenge> {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('INSERT INTO challenges (title, description) VALUES (?, ?)');
            stmt.run([title, description], function (err) {
                if (err) reject(err);
                else {
                    database.getChallenge(this.lastID).then(resolve).catch(reject);
                }
            });
            stmt.finalize();
        });
    }

    getChallenge(id: number): Promise<Challenge> {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM challenges WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row as Challenge);
            });
        });
    }

    getAllChallenges(): Promise<Challenge[]> {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM challenges ORDER BY created_at DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows as Challenge[]);
            });
        });
    }

    deleteChallenge(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('DELETE FROM challenges WHERE id = ?');
            stmt.run([id], function (err) {
                if (err) reject(err);
                else resolve();
            });
            stmt.finalize();
        });
    }

    // Bingo run methods
    createBingoRun(id: string, challengeIds: number[]): Promise<BingoRun> {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('INSERT INTO bingo_runs (id, challenges) VALUES (?, ?)');
            stmt.run([id, JSON.stringify(challengeIds)], function (err) {
                if (err) reject(err);
                else {
                    database.getBingoRun(id).then(run => {
                        if (run) resolve(run);
                        else reject(new Error('Failed to retrieve created bingo run'));
                    }).catch(reject);
                }
            });
            stmt.finalize();
        });
    }

    getBingoRun(id: string): Promise<BingoRun | null> {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM bingo_runs WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row ? (row as BingoRun) : null);
            });
        });
    }

    updateBingoRunProgress(id: string, progress: number[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('UPDATE bingo_runs SET progress = ? WHERE id = ?');
            stmt.run([JSON.stringify(progress), id], function (err) {
                if (err) reject(err);
                else resolve();
            });
            stmt.finalize();
        });
    }

    updateBingoRunTwoPlayerMode(id: string, twoPlayerMode: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('UPDATE bingo_runs SET two_player_mode = ? WHERE id = ?');
            stmt.run([twoPlayerMode ? 1 : 0, id], function (err) {
                if (err) reject(err);
                else resolve();
            });
            stmt.finalize();
        });
    }

    updatePlayerProgress(id: string, player: 1 | 2, progress: number[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const column = player === 1 ? 'player1_progress' : 'player2_progress';
            const stmt = this.db.prepare(`UPDATE bingo_runs SET ${column} = ? WHERE id = ?`);
            stmt.run([JSON.stringify(progress), id], function (err) {
                if (err) reject(err);
                else resolve();
            });
            stmt.finalize();
        });
    }
}

const database = new Database();
export default database;
