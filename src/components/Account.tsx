import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { User } from '@supabase/auth-js';

interface ServerSubmission {
    id: string;
    server_type: string;
    description: string;
    name: string;
    server_ip: string;
    website: string | null;
    discord: string | null;
    content_warning: string;
    created_at: string;
}

export const Account: React.FC = () => {
    const [submissions, setSubmissions] = useState<ServerSubmission[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [editing, setEditing] = useState<ServerSubmission | null>(null);
    const [formData, setFormData] = useState<ServerSubmission>({
        id: '',
        server_type: 'Vanilla',
        description: '',
        name: '',
        server_ip: '',
        website: '',
        discord: '',
        content_warning: 'No',
        created_at: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchSubmissions(user.id);
        }
    }, [user]);

    const fetchSubmissions = async (uid: string) => {
        const { data, error } = await supabase
            .from('server_submissions')
            .select('*')
            .eq('uid', uid);

        if (error) {
            console.error('Error fetching submissions:', error);
        } else {
            setSubmissions(data || []);
        }
    };

    const handleInputChange = (field: keyof ServerSubmission, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleEditClick = (submission: ServerSubmission) => {
        setEditing(submission);
        setFormData(submission);
    };

    const handleCancelEdit = () => {
        setEditing(null);
        setFormData({
            id: '',
            server_type: 'Vanilla',
            description: '',
            name: '',
            server_ip: '',
            website: '',
            discord: '',
            content_warning: 'No',
            created_at: '',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess(false);

        try {
            const { error: supabaseError } = await supabase
                .from('server_submissions')
                .update(formData)
                .eq('id', formData.id);

            if (supabaseError) throw new Error(supabaseError.message);

            setSuccess(true);
            fetchSubmissions(user?.id || '');
            setEditing(null);
            setFormData({
                id: '',
                server_type: 'Vanilla',
                description: '',
                name: '',
                server_ip: '',
                website: '',
                discord: '',
                content_warning: 'No',
                created_at: '',
            });
        } catch (err) {
            console.error('Submission error:', err);
            setError(err instanceof Error ? err.message : 'Failed to update server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl p-6 mx-auto bg-gray-800 rounded-sm shadow-xl">
            <h2 className="mb-6 text-3xl font-bold text-white">Your Submissions</h2>

            {success && (
                <div className="p-4 mb-6 text-green-700 bg-green-200 rounded-sm shadow-md">
                    Your submission was updated successfully!
                </div>
            )}

            {error && (
                <div className="p-4 mb-6 text-red-700 bg-red-200 rounded-sm shadow-md">
                    {error}
                </div>
            )}

            <div>
                {submissions.length === 0 ? (
                    <p className="text-gray-300">No submissions found.</p>
                ) : (
                    <ul className="space-y-4">
                        {submissions.map((submission) => (
                            <li key={submission.id} className="p-4 bg-gray-700 rounded-md shadow-md">
                                <h3 className="text-xl font-semibold text-white">{submission.name}</h3>
                                <p className="text-gray-300">{submission.description}</p>
                                <button
                                    onClick={() => handleEditClick(submission)}
                                    className="px-4 py-2 mt-2 text-white bg-indigo-600 rounded-md"
                                >
                                    Edit
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {editing && (
                <form onSubmit={handleSubmit} className="mt-6 space-y-8">
                    <h3 className="text-2xl font-bold text-white">Edit Submission</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Server Type</label>
                        <div className="flex mt-2 space-x-4">
                            <label className="inline-flex items-center text-white">
                                <input
                                    type="radio"
                                    value="Vanilla"
                                    checked={formData.server_type === 'Vanilla'}
                                    onChange={(e) => handleInputChange('server_type', e.target.value)}
                                    className="form-radio"
                                />
                                <span className="ml-2">Vanilla</span>
                            </label>
                            <label className="inline-flex items-center text-white">
                                <input
                                    type="radio"
                                    value="Moded"
                                    checked={formData.server_type === 'Moded'}
                                    onChange={(e) => handleInputChange('server_type', e.target.value)}
                                    className="form-radio"
                                />
                                <span className="ml-2">Moded</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="block w-full p-2 mt-2 text-white bg-gray-700 border-gray-600 rounded-sm"
                            rows={5}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Server Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="block w-full p-2 mt-2 text-white bg-gray-700 border-gray-600 rounded-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Server IP</label>
                        <input
                            type="text"
                            required
                            value={formData.server_ip}
                            onChange={(e) => handleInputChange('server_ip', e.target.value)}
                            className="block w-full p-2 mt-2 text-white bg-gray-700 border-gray-600 rounded-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Website</label>
                        <input
                            type="url"
                            value={formData.website || ''}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            className="block w-full p-2 mt-2 text-white bg-gray-700 border-gray-600 rounded-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Discord</label>
                        <input
                            type="url"
                            value={formData.discord || ''}
                            onChange={(e) => handleInputChange('discord', e.target.value)}
                            className="block w-full p-2 mt-2 text-white bg-gray-700 border-gray-600 rounded-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Content Warning</label>
                        <div className="flex mt-2 space-x-4">
                            <label className="inline-flex items-center text-white">
                                <input
                                    type="radio"
                                    value="Yes"
                                    checked={formData.content_warning === 'Yes'}
                                    onChange={(e) => handleInputChange('content_warning', e.target.value)}
                                    className="form-radio"
                                />
                                <span className="ml-2">Yes</span>
                            </label>
                            <label className="inline-flex items-center text-white">
                                <input
                                    type="radio"
                                    value="No"
                                    checked={formData.content_warning === 'No'}
                                    onChange={(e) => handleInputChange('content_warning', e.target.value)}
                                    className="form-radio"
                                />
                                <span className="ml-2">No</span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-5 py-3 mt-4 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Submission'}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="w-full px-5 py-3 mt-2 text-gray-700 bg-gray-300 rounded-md"
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
};
export default Account;