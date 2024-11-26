import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../../api/supabase';
import type { User } from '@supabase/auth-js';

export const ServerForm: React.FC = () => {
  const [formData, setFormData] = useState({
    serverType: 'Vanilla',
    description: '',
    name: '',
    serverIP: '',
    website: '',
    discord: '',
    contentWarning: 'No',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

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

  const sanitizeInput = (input: string) => {
    return input.replace(/[?<>|'"$^&{}]/g, '');
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: sanitizeInput(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const submissionData = {
        server_type: formData.serverType,
        description: formData.description,
        name: formData.name,
        server_ip: formData.serverIP,
        website: formData.website || null,
        discord: formData.discord || null,
        content_warning: formData.contentWarning,
        uid: user?.id || null,
        created_at: new Date().toISOString(),
        rating: '',
        notes: '',
        rank: 'Unranked',
      };

      const { error: supabaseError } = await supabase
        .from('server_submissions')
        .insert([submissionData]);

      if (supabaseError) throw new Error(supabaseError.message);

      setSuccess(true);
      setFormData({
        serverType: 'Vanilla',
        description: '',
        name: '',
        serverIP: '',
        website: '',
        discord: '',
        contentWarning: 'No',
      });
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div >
      <div className="items-center justify-center max-w-2xl p-6 mx-auto mb-4 font-bold text-gray-300 bg-gray-800 rounded-sm shadow-xl text-wrap">
        If you want to add me as an admin on your server so I can really dive into things, feel free to add my steam64id to your ownerid list (Don't forget to writecfg) <span className='items-center justify-center pt-4 text-center'>76561198040218052</span>
      </div>

      <div className="items-center justify-center max-w-2xl p-6 mx-auto bg-gray-800 rounded-sm shadow-xl">
        <h2 className="mb-6 text-3xl font-bold text-white">Submit Your Rust Server</h2>

        {success && (
          <div className="p-4 mb-6 text-green-700 bg-green-200 rounded-sm shadow-md">
            Thank you for your submission! We will review your server soon.
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-200 rounded-sm shadow-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <label className="block text-sm font-medium text-red-500">
            * Indicates required question
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Is your Rust Server Vanilla or Modded? *
            </label>
            <div className="mt-2 space-x-6">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="Vanilla"
                  checked={formData.serverType === 'Vanilla'}
                  onChange={(e) => handleInputChange('serverType', e.target.value)}
                  className="text-indigo-600 transition-colors duration-300 shadow-sm form-radio"
                />
                <span className="ml-2 text-gray-300">Vanilla</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="Modded"
                  checked={formData.serverType === 'Modded'}
                  onChange={(e) => handleInputChange('serverType', e.target.value)}
                  className="text-indigo-600 transition-colors duration-300 shadow-sm form-radio"
                />
                <span className="ml-2 text-gray-300">Modded</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What would you like me to check out first? What sets your server apart from the others? <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="block w-full p-2 mt-2 text-white transition duration-300 ease-in-out bg-gray-700 border-gray-600 rounded-sm shadow-md focus:ring-indigo-500 focus:border-indigo-500 focus:shadow-lg"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What is your server name? How can it be searched in the Rust Server Directory? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="block w-full p-2 mt-2 text-white transition duration-300 ease-in-out bg-gray-700 border-gray-600 rounded-sm shadow-md focus:ring-indigo-500 focus:border-indigo-500 focus:shadow-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What is your Server's IP Address and Port? If I can't connect, I can't audit (example, 192.168.172.42:28015) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              pattern="^[\d.]+:\d+$"
              placeholder="192.168.172.42:28015"
              value={formData.serverIP}
              onChange={(e) => handleInputChange('serverIP', e.target.value)}
              className="block w-full p-2 mt-2 text-white transition duration-300 ease-in-out bg-gray-700 border-gray-600 rounded-sm shadow-md focus:ring-indigo-500 focus:border-indigo-500 focus:shadow-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              If you have a website for your community, leave the address below
            </label>
            <input
              type="url"
              pattern="https?://.*"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="block w-full p-2 mt-2 text-white transition duration-300 ease-in-out bg-gray-700 border-gray-600 rounded-sm shadow-md focus:ring-indigo-500 focus:border-indigo-500 focus:shadow-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What is your Discord Invite link
            </label>
            <input
              type="url"
              pattern="https?://.*"
              value={formData.discord}
              onChange={(e) => handleInputChange('discord', e.target.value)}
              className="block w-full p-2 mt-2 text-white transition duration-300 ease-in-out bg-gray-700 border-gray-600 rounded-sm shadow-md focus:ring-indigo-500 focus:border-indigo-500 focus:shadow-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Does your server have content that might upset the YouTube Community? <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 space-x-6">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="Yes"
                  checked={formData.contentWarning === 'Yes'}
                  onChange={(e) => handleInputChange('contentWarning', e.target.value)}
                  className="text-indigo-600 transition-colors duration-300 shadow-sm form-radio"
                />
                <span className="ml-2 text-gray-300">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="No"
                  checked={formData.contentWarning === 'No'}
                  onChange={(e) => handleInputChange('contentWarning', e.target.value)}
                  className="text-indigo-600 transition-colors duration-300 shadow-sm form-radio"
                />
                <span className="ml-2 text-gray-300">No</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-5 text-white font-semibold rounded-sm flex items-center justify-center shadow-md hover:shadow-lg transition-shadow ${isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out'
              }`}
          >
            {isSubmitting ? 'Submitting...' : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Server
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
