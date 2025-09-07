'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BingoBoard from '@/components/BingoBoard';
import Link from 'next/link';

interface Challenge {
    id: number;
    title: string;
    description: string;
}

interface BingoRun {
    id: string;
    challenges: Challenge[];
    progress: number[];
    two_player_mode: boolean;
    player1_progress: number[];
    player2_progress: number[];
    created_at: string;
}

export default function RunPage() {
    const params = useParams();
    const router = useRouter();
    const runId = params?.id as string;

    const [bingoRun, setBingoRun] = useState<BingoRun | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBingoRun = async () => {
            try {
                const response = await fetch(`/api/runs/${runId}`);

                if (response.ok) {
                    const data = await response.json();
                    setBingoRun(data);
                } else if (response.status === 404) {
                    setError('Bingo run not found. It may have been deleted or the ID is incorrect.');
                } else {
                    setError('Failed to load bingo run. Please try again.');
                }
            } catch (error) {
                setError('Network error. Please check your connection and try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (runId) {
            fetchBingoRun();
        }
    }, [runId]);

    if (isLoading) {
        return (
            <div className="container">
                <div className="loading">Loading bingo run...</div>
            </div>
        );
    }

    if (error || !bingoRun) {
        return (
            <div className="container">
                <div className="header">
                    <h1>Pokémon Gen 1 Speedrun Bingo</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="header">
                <h1>Pokémon Gen 1 Speedrun Bingo</h1>
                <p>Click left half (blue) or right half (red) to mark challenges!</p>
            </div>



            <BingoBoard
                runId={bingoRun.id}
                challenges={bingoRun.challenges}
                player1Progress={bingoRun.player1_progress}
                player2Progress={bingoRun.player2_progress}
            />

            <div className="card" style={{ textAlign: 'center', marginTop: '16px' }}>
                <h3>Share this room</h3>
                <p style={{ marginBottom: '12px' }}>
                    Share this room with your friends so they can join and see your progress in real-time!
                </p>
                <button
                    onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    className="btn"
                >
                    Copy Room URL
                </button>
            </div>
        </div>
    );
}
