'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Challenge {
    id: number;
    title: string;
    description: string;
}

interface BingoBoardProps {
    runId: string;
    challenges: Challenge[];
    player1Progress?: number[];
    player2Progress?: number[];
}

export default function BingoBoard({
    runId,
    challenges,
    player1Progress = [],
    player2Progress = []
}: BingoBoardProps) {
    const [p1Progress, setP1Progress] = useState<number[]>(player1Progress);
    const [p2Progress, setP2Progress] = useState<number[]>(player2Progress);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        const socketInstance = io();

        socketInstance.on('connect', () => {
            console.log('Connected to server');
            socketInstance.emit('join-room', runId);
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        socketInstance.on('player-progress-updated', (data: { player: 1 | 2; progress: number[] }) => {
            if (data.player === 1) {
                setP1Progress(data.progress);
            } else {
                setP2Progress(data.progress);
            }
        });

        socketInstance.on('error', (error: string) => {
            console.error('Socket error:', error);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.emit('leave-room', runId);
            socketInstance.close();
        };
    }, [runId]);

    const handleCellClick = (event: React.MouseEvent, index: number) => {
        // Only respond to clicks on the left or right halves
        // Get click position relative to the cell
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const cellWidth = rect.width;

        // Define clickable areas - only the outer portions of each half
        const leftClickableEnd = cellWidth * 0.45; // Left 45% is clickable for player 1
        const rightClickableStart = cellWidth * 0.55; // Right 45% is clickable for player 2

        if (clickX <= leftClickableEnd) {
            // Clicked in left clickable area
            togglePlayerChallenge(index, 1);
        } else if (clickX >= rightClickableStart) {
            // Clicked in right clickable area  
            togglePlayerChallenge(index, 2);
        }
        // If clicked in the middle 10% area, do nothing
    };

    const togglePlayerChallenge = async (index: number, player: 1 | 2) => {
        const currentProgress = player === 1 ? p1Progress : p2Progress;
        const newProgress = currentProgress.includes(index)
            ? currentProgress.filter(i => i !== index)
            : [...currentProgress, index];

        // Optimistic update
        if (player === 1) {
            setP1Progress(newProgress);
        } else {
            setP2Progress(newProgress);
        }

        try {
            const response = await fetch(`/api/runs/${runId}/player`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ player, progress: newProgress }),
            });

            if (response.ok && socket) {
                socket.emit('update-player-progress', { roomId: runId, player, progress: newProgress });
            } else {
                // Revert on failure
                if (player === 1) {
                    setP1Progress(p1Progress);
                } else {
                    setP2Progress(p2Progress);
                }
            }
        } catch (error) {
            console.error('Failed to update player progress:', error);
            // Revert on failure
            if (player === 1) {
                setP1Progress(p1Progress);
            } else {
                setP2Progress(p2Progress);
            }
        }
    };


    const p1CompletedCount = p1Progress.length;
    const p2CompletedCount = p2Progress.length;
    const totalCompletedCount = new Set([...p1Progress, ...p2Progress]).size;
    const completionPercentage = Math.round((totalCompletedCount / 25) * 100);

    return (
        <div>
            <div className="room-info">
                <h3>Bingo Room</h3>
                <p style={{ marginTop: '4px' }}>
                    Player 1: {p1CompletedCount}/25 | Player 2: {p2CompletedCount}/25 |
                    Total: {totalCompletedCount}/25 ({completionPercentage}%) |
                    Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </p>
            </div>

            <div className="card">
                <div className="bingo-board">
                    {challenges.map((challenge, index) => (
                        <div
                            key={index}
                            className="bingo-cell two-player"
                            onClick={(e) => handleCellClick(e, index)}
                        >
                            {/* Overlay effects for player progress */}
                            <div className={`bingo-cell-overlay left ${p1Progress.includes(index) ? 'active' : ''}`} />
                            <div className={`bingo-cell-overlay right ${p2Progress.includes(index) ? 'active' : ''}`} />

                            <div className="bingo-cell-title">
                                {challenge.title}
                            </div>
                            <div className="bingo-cell-description">
                                {challenge.description}
                            </div>
                        </div>
                    ))}
                </div>



            </div>
        </div>
    );
}
