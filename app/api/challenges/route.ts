import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';

export async function GET() {
    try {
        const challenges = await database.getAllChallenges();
        return NextResponse.json(challenges);
    } catch (error) {
        console.error('Error fetching challenges:', error);
        return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { title, description } = await request.json();

        if (!title || title.trim().length === 0) {
            return NextResponse.json({ error: 'Challenge title is required' }, { status: 400 });
        }

        if (!description || description.trim().length === 0) {
            return NextResponse.json({ error: 'Challenge description is required' }, { status: 400 });
        }

        const challenge = await database.addChallenge(title.trim(), description.trim());
        return NextResponse.json(challenge, { status: 201 });
    } catch (error) {
        console.error('Error adding challenge:', error);
        return NextResponse.json({ error: 'Failed to add challenge' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
        }

        const challengeId = parseInt(id);
        if (isNaN(challengeId)) {
            return NextResponse.json({ error: 'Invalid challenge ID' }, { status: 400 });
        }

        await database.deleteChallenge(challengeId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting challenge:', error);
        return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 });
    }
}
