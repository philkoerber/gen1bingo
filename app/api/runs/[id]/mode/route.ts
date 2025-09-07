import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { twoPlayerMode } = await request.json();

        if (typeof twoPlayerMode !== 'boolean') {
            return NextResponse.json({ error: 'twoPlayerMode must be a boolean' }, { status: 400 });
        }

        await database.updateBingoRunTwoPlayerMode(params.id, twoPlayerMode);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating two-player mode:', error);
        return NextResponse.json({ error: 'Failed to update two-player mode' }, { status: 500 });
    }
}
