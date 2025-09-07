'use client';

import { useState } from 'react';

interface ChallengeFormProps {
    onChallengeAdded: () => void;
}

export default function ChallengeForm({ onChallengeAdded }: ChallengeFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setMessage({ type: 'error', text: 'Please enter a challenge title' });
            return;
        }

        if (!description.trim()) {
            setMessage({ type: 'error', text: 'Please enter a challenge description' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const response = await fetch('/api/challenges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: title.trim(), description: description.trim() }),
            });

            if (response.ok) {
                setTitle('');
                setDescription('');
                setMessage({ type: 'success', text: 'Challenge added successfully!' });
                onChallengeAdded();
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Failed to add challenge' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card">
            {message && (
                <div className={message.type === 'success' ? 'success' : 'error'}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="challenge-title">Challenge Title</label>
                    <input
                        id="challenge-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Catch Pikachu"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="challenge-description">Challenge Description</label>
                    <textarea
                        id="challenge-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Catch a Pikachu in Viridian Forest before fighting any trainers"
                        rows={3}
                        disabled={isSubmitting}
                    />
                </div>

                <button type="submit" className="btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Challenge'}
                </button>
            </form>
        </div>
    );
}
