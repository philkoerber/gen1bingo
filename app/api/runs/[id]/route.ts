import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const bingoRun = await database.getBingoRun(params.id);

        if (!bingoRun) {
            return NextResponse.json({ error: 'Bingo run not found' }, { status: 404 });
        }

        // Get the challenge details
        const challengeIds = JSON.parse(bingoRun.challenges);
        const challenges = await Promise.all(
            challengeIds.map((id: number) => database.getChallenge(id))
        );

        const progress = JSON.parse(bingoRun.progress);

        return NextResponse.json({
            id: bingoRun.id,
            challenges,
            progress,
            created_at: bingoRun.created_at
        });
    } catch (error) {
        console.error('Error fetching bingo run:', error);
        return NextResponse.json({ error: 'Failed to fetch bingo run' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { progress } = await request.json();

        if (!Array.isArray(progress)) {
            return NextResponse.json({ error: 'Progress must be an array' }, { status: 400 });
        }

        await database.updateBingoRunProgress(params.id, progress);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating bingo run progress:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
}
