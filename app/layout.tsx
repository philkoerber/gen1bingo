import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Pokémon Gen 1 Speedrun Bingo',
    description: 'A bingo board for Pokémon Generation 1 speedrun challenges',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
