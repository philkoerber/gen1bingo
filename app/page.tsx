'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChallengeForm from '@/components/ChallengeForm';
import ChallengesList from '@/components/ChallengesList';

export default function Home() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isCreatingRun, setIsCreatingRun] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleChallengeAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const createBingoRun = async () => {
        setIsCreatingRun(true);
        setError(null);

        try {
            const response = await fetch('/api/runs', {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/run/${data.id}`);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to create bingo run');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsCreatingRun(false);
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h1>Pokémon Gen 1 Speedrun Bingo</h1>
                <p>Create challenges and generate randomized bingo boards for your speedruns!</p>
            </div>

            <div className="forms-row">
                <ChallengeForm onChallengeAdded={handleChallengeAdded} />

                <div className="card" style={{ textAlign: 'center' }}>
                    <h2>Start a Bingo Run</h2>

                    {error && (
                        <div className="error">{error}</div>
                    )}

                    <p style={{ marginBottom: '12px' }}>
                        Create a new bingo board with 25 random challenges.
                        The generated room can be shared with friends!
                    </p>

                    <button
                        onClick={createBingoRun}
                        className="btn"
                        disabled={isCreatingRun}
                    >
                        {isCreatingRun ? 'Creating Run...' : 'Create New Bingo Run'}
                    </button>
                </div>
            </div>

            <div className="full-width">
                <ChallengesList refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
}
