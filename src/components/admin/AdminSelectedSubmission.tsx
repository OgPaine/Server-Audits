import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { ServerSubmission, supabase } from '../../api/supabase'

interface AdminSelectedSubmissionProps {
  selectedSubmission: ServerSubmission | null
  onClearSelection: () => void
  onRandomize: () => void
  fetchSubmissions: () => void
}

export const AdminSelectedSubmission: React.FC<AdminSelectedSubmissionProps> = ({
  selectedSubmission,
  onRandomize,
  fetchSubmissions,
}) => {
  const [rating, setRating] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  useEffect(() => {
    if (selectedSubmission) {
      setRating(selectedSubmission.rating || '')
      setNotes(selectedSubmission.notes || '')
      setShowNotes(false)
    }
  }, [selectedSubmission])

  const handleSave = async () => {
    if (!selectedSubmission) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('server_submissions')
        .update({
          rating,
          notes,
          reviewed_at: new Date().toISOString(),
          rank: rating ? 'Ranked' : 'Unranked',
        })
        .eq('id', selectedSubmission.id)

      if (error) throw error

      await fetchSubmissions()
    } catch (err) {
      console.error('Error saving submission:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (!selectedSubmission) {
    return (
    <div className="flex items-start justify-center min-h-screen">
      <div className="p-6 bg-[#1E293B] rounded-lg text-center text-gray-400">
        <p>Select a server or click the <span className="font-semibold text-white">Random Server</span> button to start.</p>
        <button
          onClick={onRandomize}
          className="flex gap-2 px-4 py-2 mx-auto mt-4 text-white bg-gray-700 rounded hover:bg-gray-600">
          <Icon icon="mdi:dice-6-outline" className="w-6 h-6" />
          <span>Random Server</span>
        </button>
      </div>
    </div>
    )
  }

  return (
    <div className="flex items-start justify-center min-h-screen">
      <div className="p-6 bg-[#1E293B] rounded-lg max-w-md w-full shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{selectedSubmission.name}</h2>
        </div>
        <div className="mb-6 space-y-2 text-gray-400">
          <p><span className="font-medium text-gray-300">Server IP:</span> {selectedSubmission.server_ip}</p>
          <p><span className="font-medium text-gray-300">Description:</span> {selectedSubmission.description || 'No description provided'}</p>
          <p><span className="font-medium text-gray-300">Content Warning:</span> {selectedSubmission.content_warning || 'None'}</p>
          <p><span className="font-medium text-gray-300">Submitted on:</span> {new Date(selectedSubmission.created_at).toLocaleString()}</p>
          {selectedSubmission.reviewed_at && (
            <p><span className="font-medium text-gray-300">Reviewed on:</span> {new Date(selectedSubmission.reviewed_at).toLocaleString()}</p>
          )}
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 text-sm font-medium text-gray-300">Rating (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full p-2 text-white bg-[#2D3748] border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {showNotes && (
            <div>
              <label className="mb-2 text-sm font-medium text-gray-300">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 text-white bg-[#2D3748] border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-4 mt-4">
            <button
              onClick={onRandomize}
              className="flex items-center gap-2 px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600"
            >
              <Icon icon="mdi:dice-6-outline" className="w-6 h-6" />
              <span>Random Server</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-500 disabled:bg-gray-600"
            >
              <Icon icon="mdi:content-save-outline" className="w-6 h-6" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600"
            >
              <Icon icon="mdi:note-outline" className="w-6 h-6" />
              <span>{showNotes ? 'Hide Notes' : 'Show Notes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
