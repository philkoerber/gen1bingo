import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { player, progress } = await request.json();

        if (player !== 1 && player !== 2) {
            return NextResponse.json({ error: 'Player must be 1 or 2' }, { status: 400 });
        }

        if (!Array.isArray(progress)) {
            return NextResponse.json({ error: 'Progress must be an array' }, { status: 400 });
        }

        await database.updatePlayerProgress(params.id, player, progress);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating player progress:', error);
        return NextResponse.json({ error: 'Failed to update player progress' }, { status: 500 });
    }
}
