import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

// Seeded random number generator
function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    return function () {
        hash = (hash * 16807) % 2147483647;
        return (hash - 1) / 2147483646;
    };
}

// Fisher-Yates shuffle with seeded random
function shuffleArray<T>(array: T[], seed: string): T[] {
    const shuffled = [...array];
    const random = seededRandom(seed);

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

export async function POST() {
    try {
        const allChallenges = await database.getAllChallenges();

        // Filter out any null/undefined challenges
        const validChallenges = allChallenges.filter(challenge =>
            challenge && challenge.id && challenge.title && challenge.description
        );

        if (validChallenges.length < 25) {
            return NextResponse.json({
                error: `Need at least 25 challenges to create a bingo board. Currently have ${validChallenges.length} valid challenges.`
            }, { status: 400 });
        }

        const runId = uuidv4();

        // Use the UUID as seed for consistent randomization
        const shuffledChallenges = shuffleArray(validChallenges, runId);
        const selectedChallenges = shuffledChallenges.slice(0, 25);
        const challengeIds = selectedChallenges.map(c => c.id);

        const bingoRun = await database.createBingoRun(runId, challengeIds);

        return NextResponse.json({
            id: runId,
            challenges: selectedChallenges,
            progress: []
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating bingo run:', error);
        return NextResponse.json({ error: 'Failed to create bingo run' }, { status: 500 });
    }
}
