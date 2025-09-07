'use client';

import { useEffect, useState } from 'react';

interface Challenge {
    id: number;
    title: string;
    description: string;
    created_at: string;
}

interface ChallengesListProps {
    refreshTrigger: number;
}

export default function ChallengesList({ refreshTrigger }: ChallengesListProps) {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchChallenges = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/challenges');

            if (response.ok) {
                const data = await response.json();
                setChallenges(data);
                setError(null);
            } else {
                setError('Failed to fetch challenges');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteChallenge = async (id: number) => {
        if (!confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingId(id);
            const response = await fetch(`/api/challenges?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove the challenge from the local state
                setChallenges(prev => prev.filter(challenge => challenge.id !== id));
                setError(null);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to delete challenge');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, [refreshTrigger]);

    if (isLoading) {
        return (
            <div className="card">
                <div className="loading">Loading challenges...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card">
                <div className="error">{error}</div>
                <button onClick={fetchChallenges} className="btn">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="card">
            <h2>Current Challenges ({challenges.length})</h2>

            {challenges.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '16px' }}>
                    No challenges yet. Add some challenges above to get started!
                </p>
            ) : (
                <div className="challenges-list">
                    {challenges.map((challenge) => (
                        <div key={challenge.id} className="challenge-item">
                            <div className="challenge-header">
                                <div className="challenge-content">
                                    <h4>{challenge.title}</h4>
                                    <p>{challenge.description}</p>
                                    <small>
                                        Added: {new Date(challenge.created_at).toLocaleDateString()}
                                    </small>
                                </div>
                                <button
                                    onClick={() => deleteChallenge(challenge.id)}
                                    className="delete-btn"
                                    disabled={deletingId === challenge.id}
                                    title="Delete challenge"
                                >
                                    {deletingId === challenge.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {challenges.length >= 25 && (
                <p style={{ marginTop: '8px' }}>
                    ✓ You have enough challenges to create a bingo board!
                </p>
            )}

            {challenges.length < 25 && challenges.length > 0 && (
                <p style={{ marginTop: '8px' }}>
                    Need {25 - challenges.length} more challenges to create a bingo board.
                </p>
            )}
        </div>
    );
}
