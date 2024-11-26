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

const defaultFormData: ServerSubmission = {
  id: '',
  server_type: 'Vanilla',
  description: '',
  name: '',
  server_ip: '',
  website: '',
  discord: '',
  content_warning: 'No',
  created_at: '',
};

export const Account: React.FC = () => {
  const [submissions, setSubmissions] = useState<ServerSubmission[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState<ServerSubmission | null>(null);
  const [formData, setFormData] = useState<ServerSubmission>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchSubmissions(user.id);
    }
  }, [user]);

  const fetchSubmissions = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('server_submissions')
        .select('*')
        .eq('uid', uid);

      if (error) throw new Error(error.message);
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const handleInputChange = (field: keyof ServerSubmission, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditing(null);
    setFormData(defaultFormData);
  };

  const handleEditClick = (submission: ServerSubmission) => {
    setEditing(submission);
    setFormData(submission);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      const { error } = await supabase
        .from('server_submissions')
        .update(formData)
        .eq('id', formData.id);

      if (error) throw new Error(error.message);

      setNotification({ type: 'success', message: 'Submission updated successfully!' });
      fetchSubmissions(user?.id || '');
      resetForm();
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Update failed. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto bg-gray-800 rounded shadow-xl">
      <h2 className="mb-6 text-3xl font-bold text-white">Your Submissions</h2>

      {notification && (
        <div
          className={`p-4 mb-6 rounded shadow-md ${
            notification.type === 'success' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
          }`}
        >
          {notification.message}
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

          <InputField
            label="Server Type"
            type="radio"
            options={['Vanilla', 'Modded']}
            value={formData.server_type}
            onChange={(value) => handleInputChange('server_type', value)}
          />

          <TextAreaField
            label="Description"
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
          />

          <InputField
            label="Server Name"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
          />

          <InputField
            label="Server IP"
            value={formData.server_ip}
            onChange={(value) => handleInputChange('server_ip', value)}
          />

          <InputField
            label="Website"
            type="url"
            value={formData.website || ''}
            onChange={(value) => handleInputChange('website', value)}
          />

          <InputField
            label="Discord"
            type="url"
            value={formData.discord || ''}
            onChange={(value) => handleInputChange('discord', value)}
          />

          <InputField
            label="Content Warning"
            type="radio"
            options={['Yes', 'No']}
            value={formData.content_warning}
            onChange={(value) => handleInputChange('content_warning', value)}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-5 py-3 mt-4 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
          >
            {isSubmitting ? 'Updating...' : 'Update Submission'}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="w-full px-5 py-3 mt-2 text-gray-700 bg-gray-300 rounded-md"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

interface InputFieldProps {
  label: string;
  type?: 'text' | 'url' | 'radio';
  options?: string[];
  value: string;
  onChange: (value: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', options, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    {type === 'radio' && options ? (
      <div className="flex mt-2 space-x-4">
        {options.map((option) => (
          <label key={option} className="inline-flex items-center text-white">
            <input
              type="radio"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="form-radio"
            />
            <span className="ml-2">{option}</span>
          </label>
        ))}
      </div>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full p-2 mt-2 text-white bg-gray-700 border-gray-600 rounded-sm"
      />
    )}
  </div>
);

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full p-2 mt-2 text-white bg-gray-700 border-gray-600 rounded-sm"
      rows={5}
    />
  </div>
);

export default Account;
