import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import database from './database';

export type NextApiResponseServerIO = NextApiResponse & {
    socket: {
        server: NetServer & {
            io: ServerIO;
        };
    };
};

export const config = {
    api: {
        bodyParser: false,
    },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (res.socket.server.io) {
        console.log('Socket is already running');
    } else {
        console.log('Socket is initializing');
        const io = new ServerIO(res.socket.server);
        res.socket.server.io = io;

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('join-room', (roomId: string) => {
                socket.join(roomId);
                console.log(`Client ${socket.id} joined room ${roomId}`);
            });

            socket.on('leave-room', (roomId: string) => {
                socket.leave(roomId);
                console.log(`Client ${socket.id} left room ${roomId}`);
            });

            socket.on('update-progress', async (data: { roomId: string; progress: number[] }) => {
                try {
                    await database.updateBingoRunProgress(data.roomId, data.progress);

                    // Broadcast to all clients in the room
                    socket.to(data.roomId).emit('progress-updated', data.progress);
                } catch (error) {
                    console.error('Error updating progress:', error);
                    socket.emit('error', 'Failed to update progress');
                }
            });

            socket.on('update-player-progress', async (data: { roomId: string; player: 1 | 2; progress: number[] }) => {
                try {
                    await database.updatePlayerProgress(data.roomId, data.player, data.progress);

                    // Broadcast to all clients in the room
                    socket.to(data.roomId).emit('player-progress-updated', { player: data.player, progress: data.progress });
                } catch (error) {
                    console.error('Error updating player progress:', error);
                    socket.emit('error', 'Failed to update player progress');
                }
            });

            socket.on('update-mode', async (data: { roomId: string; twoPlayerMode: boolean }) => {
                try {
                    await database.updateBingoRunTwoPlayerMode(data.roomId, data.twoPlayerMode);

                    // Broadcast to all clients in the room
                    socket.to(data.roomId).emit('mode-updated', data.twoPlayerMode);
                } catch (error) {
                    console.error('Error updating mode:', error);
                    socket.emit('error', 'Failed to update mode');
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }
    res.end();
};

export default SocketHandler;
