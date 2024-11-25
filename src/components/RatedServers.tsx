import React, { useEffect, useState } from 'react';
import { useSubmissionStore } from '../store/submissionStore';
import { Icon } from '@iconify/react';
import { ServerSubmission } from '../api/supabase';

export const RatedServers: React.FC = () => {
  const { submissions, isLoading, error, fetchSubmissions } = useSubmissionStore();
  
  const [rankedSubmissions, setRankedSubmissions] = useState<ServerSubmission[]>([]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    if (submissions) {
      const ranked = submissions.filter((submission) => submission.rank === 'Ranked');
      setRankedSubmissions(ranked);
    }
  }, [submissions]);

  const getServerTypeStyle = (serverType: string): string => {
    const styles: Record<string, string> = {
      vanilla: 'bg-blue-600',
      modded: 'bg-green-600',
    };
    return styles[serverType.toLowerCase()] || styles.default;
  };

  const renderRankedServers = () => {
    if (isLoading) {
      return <div className="text-white">Loading ranked submissions...</div>;
    }

    if (rankedSubmissions.length === 0) {
      return <div className="text-white">No ranked servers available.</div>;
    }

    return (
      <table className="w-full text-sm bg-[#1E293B] rounded-lg overflow-hidden">
        <thead className="bg-[#374151] text-[#C2D5DB]">
          <tr>
            <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase">Server</th>
            <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase">Type</th>
            <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase">Rating</th>
            <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase">Links</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {rankedSubmissions.map((submission) => (
            <tr key={submission.id} className="cursor-pointer text-gray-300 hover:bg-[#2D3748]">
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
    );
  };

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {error && (
        <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg">
        {renderRankedServers()}
      </div>
    </div>
  );
};
export default RatedServers;
