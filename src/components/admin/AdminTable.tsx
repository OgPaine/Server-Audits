import React from 'react'
import { Icon } from '@iconify/react'
import { ServerSubmission } from '../../api/supabase'

interface AdminTableProps {
  submissions: ServerSubmission[]
  selectedSubmissionId: string | null
  onSelectSubmission: (submission: ServerSubmission) => void
  isLoading: boolean
}

export const AdminTable: React.FC<AdminTableProps> = ({ submissions, selectedSubmissionId, onSelectSubmission, isLoading }) => {
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

  const getRatingStyle = (rating: string | null) => {
    const numericRating = rating !== null ? parseFloat(rating) : null;
    
    if (numericRating === null) return 'text-gray-500';
    if (numericRating >= 8) return 'text-green-500';
    if (numericRating >= 5) return 'text-yellow-500';
    if (numericRating >= 3) return 'text-orange-500';
    if (numericRating >= 0) return 'text-red-500';

    
    return 'text-gray-400';
  };

  return (
    <div className="overflow-x-auto rounded-lg">
      {isLoading ? (
        <div className="text-white">Loading submissions...</div>
      ) : (
        <table className="w-full text-sm bg-[#1E293B] rounded-lg overflow-hidden">
          <thead className="bg-[#374151] text-[#C2D5DB]">
            <tr>
              <th className="px-6 py-3 text-sm font-bold tracking-wider text-left uppercase">Server</th>
              <th className="px-6 py-3 text-sm font-bold tracking-wider text-left uppercase">Type</th>
              <th className="px-6 py-3 text-sm font-bold tracking-wider text-left uppercase">Status</th>
              <th className="px-6 py-3 text-sm font-bold tracking-wider text-left uppercase">Rating</th>
              <th className="px-6 py-3 text-sm font-bold tracking-wider text-left uppercase">Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {submissions.map((submission) => (
              <tr
                key={submission.id}
                onClick={() => onSelectSubmission(submission)}
                className={`cursor-pointer text-gray-300 hover:bg-[#2D3748] ${
                  submission.id === selectedSubmissionId ? 'bg-[#2D3748]' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="font-bold">{submission.name}</div>
                    <div className="text-xs font-bold text-gray-400">{submission.server_ip}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs text-white rounded font-bold ${getServerTypeStyle(submission.server_type)}`}>
                    {submission.server_type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 mr-2 rounded-full ${
                        submission.rating ? 'bg-green-400' : 'bg-yellow-400'
                      }`}
                    ></div>
                    <span className="font-bold">{submission.rank}</span>
                  </div>
                </td>
                <td className={`px-6 py-4 font-bold ${getRatingStyle(submission.rating)}`}>
                  {submission.rating || 'N/A'}
                </td>

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
  )
}
