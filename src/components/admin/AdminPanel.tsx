import React, { useEffect, useState } from 'react'
import { useSubmissionStore } from '../../store/submissionStore'
import { useAuthStore } from '../../store/authStore'
import { Icon } from '@iconify/react'
import { ServerSubmission, supabase } from '../../api/supabase'

export const AdminPanel: React.FC = () => {
  const { submissions, isLoading, error, fetchSubmissions } = useSubmissionStore()
  const { isAuthenticated } = useAuthStore()
  const [selectedSubmission, setSelectedSubmission] = useState<ServerSubmission | null>(null)
  const [rating, setRating] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions()
    }
  }, [isAuthenticated, fetchSubmissions])

  useEffect(() => {
    if (selectedSubmission) {
      setRating(selectedSubmission.rating || '')
      setNotes(selectedSubmission.notes || '')
      setShowNotes(false) 
    }
  }, [selectedSubmission])

  if (!isAuthenticated) {
    return null
  }

  const handleSave = async () => {
    if (!selectedSubmission) return
  
    setIsSaving(true)
    try {
      const { error: updateError } = await supabase
        .from('server_submissions')
        .update({
          rating,
          notes,
          reviewed_at: new Date().toISOString(),
          rank: rating ? 'Ranked' : 'Unranked'
        })
        .eq('id', selectedSubmission.id)
  
      if (updateError) throw updateError
  
      setSelectedSubmission({
        ...selectedSubmission,
        rating,
        notes,
        rank: rating ? 'Ranked' : 'Unranked',
        reviewed_at: new Date().toISOString() 
      })
  
      await fetchSubmissions()
  
    } catch (err) {
      console.error('Error updating submission:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRandomServer = () => {
    const unrankedSubmissions = submissions.filter(s => !s.rating)
    if (unrankedSubmissions.length > 0) {
      const randomSubmission = unrankedSubmissions[Math.floor(Math.random() * unrankedSubmissions.length)]
      setSelectedSubmission(randomSubmission)
      setShowNotes(false)
    } else {
      alert('No unranked servers available.')
    }
  }

  const handleDeleteSubmission = async () => {
    if (!selectedSubmission || !window.confirm('Are you sure you want to delete this submission?')) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('server_submissions')
        .delete()
        .eq('id', selectedSubmission.id)

      if (deleteError) throw deleteError

      await fetchSubmissions()
      setSelectedSubmission(null)
    } catch (err) {
      console.error('Error deleting submission:', err)
    }
  }

  const getServerTypeStyle = (serverType: string) => {
    switch (serverType.toLowerCase()) {
      case 'vanilla':
        return 'bg-blue-600'
      case 'modded':
        return 'bg-green-600'
      default:
        return 'bg-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <div className="p-6 mx-auto max-w-7xl">
        {error && (
          <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-[2fr,1fr] gap-6">
          <div className="overflow-x-auto rounded-lg">
            {isLoading ? (
              <div className="text-white">Loading submissions..</div>
            ) : (
              <table className="w-full text-sm bg-[#1E293B] rounded-lg overflow-hidden">
                <thead className="bg-[#374151] text-[#C2D5DB]">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase">Server</th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase">Type</th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase">Rating</th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      onClick={() => setSelectedSubmission(submission)}
                      className={`cursor-pointer text-gray-300 hover:bg-[#2D3748] ${
                        submission.id === selectedSubmission?.id ? 'bg-[#2D3748]' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{submission.name}</div>
                          <div className="text-xs text-gray-400">{submission.server_ip}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs text-white rounded ${getServerTypeStyle(submission.server_type)}`}>
                          {submission.server_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 mr-2 rounded-full ${submission.rating ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                          <span>{submission.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{submission.rating || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {submission.website && (
                            <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              <Icon icon="ant-design:link-outlined" className="w-6 h-6" />
                            </a>
                          )}
                          {submission.discord && (
                            <a href={submission.discord} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              <Icon icon="cib:discord" className="w-6 h-6" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="relative">
            <div className="sticky top-6">
              {!selectedSubmission ? (
                <div className="p-6 bg-[#1E293B] rounded-lg text-center text-gray-400">
                  <p>Select a server or click the <span className="font-semibold text-white">Random Server</span> button to start.</p>
                  <button
                    onClick={handleRandomServer}
                    className="flex gap-2 px-4 py-2 mx-auto mt-4 text-white bg-gray-700 rounded hover:bg-gray-600"
                  >
                    <Icon icon="mdi:dice-6-outline" className="w-6 h-6" />
                    <span>Random Server</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-[#1E293B] rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{selectedSubmission.name}</h2>
                    <button 
                      onClick={handleDeleteSubmission}
                      className="p-2 text-gray-400 rounded hover:bg-gray-700"
                    >
                      <Icon icon="mdi:trash-can-outline" className="w-6 h-6 text-red-500" />
                    </button>
                  </div>

                  {/* Server Information */}
                  <div className="mb-6 space-y-2 text-gray-400">
                    <p><span className="font-medium text-gray-300">Server IP:</span> {selectedSubmission.server_ip}</p>
                    <p><span className="font-medium text-gray-300">Description:</span> {selectedSubmission.description || 'No description provided'}</p>
                    <p><span className="font-medium text-gray-300">Content Warning:</span> {selectedSubmission.content_warning || 'None'}</p>
                    <p><span className="font-medium text-gray-300">Subbmited on:</span> {formatDate(selectedSubmission.created_at)}</p>
                    {selectedSubmission.reviewed_at && (
                      <p><span className="font-medium text-gray-300">Reviewed on:</span> {formatDate(selectedSubmission.reviewed_at)}</p>
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
                        onClick={handleRandomServer}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}