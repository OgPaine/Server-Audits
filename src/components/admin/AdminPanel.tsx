import React, { useEffect, useState } from 'react'
import { useSubmissionStore } from '../../store/submissionStore'
import { useAuthStore } from '../../store/authStore'
import { ServerSubmission } from '../../api/supabase'
import { AdminTable } from './AdminTable'
import { AdminSelectedSubmission } from './AdminSelectedSubmission'

export const AdminPanel: React.FC = () => {
  const { submissions, isLoading, error, fetchSubmissions } = useSubmissionStore()
  const { isAuthenticated } = useAuthStore()
  const [selectedSubmission, setSelectedSubmission] = useState<ServerSubmission | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions()
    }
  }, [isAuthenticated, fetchSubmissions])

  const handleRandomServer = () => {
    const unrankedSubmissions = submissions.filter(s => !s.rating)
    if (unrankedSubmissions.length > 0) {
      const randomSubmission = unrankedSubmissions[Math.floor(Math.random() * unrankedSubmissions.length)]
      setSelectedSubmission(randomSubmission)
    } else {
      alert('No unranked servers available.')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {error && (
        <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-[2fr,1fr] gap-6">
        <AdminTable
          submissions={submissions}
          selectedSubmissionId={selectedSubmission?.id || null}
          onSelectSubmission={setSelectedSubmission}
          isLoading={isLoading}
        />
        <AdminSelectedSubmission
          selectedSubmission={selectedSubmission}
          onClearSelection={() => setSelectedSubmission(null)}
          onRandomize={handleRandomServer}
          fetchSubmissions={fetchSubmissions}
        />
      </div>
    </div>
  )
}
