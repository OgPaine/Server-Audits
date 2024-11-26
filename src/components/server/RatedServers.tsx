import React, { useEffect, useState } from 'react';
import { useSubmissionStore } from '../../store/submissionStore';
import { Icon } from '@iconify/react';
import { ServerSubmission } from '../../api/supabase';

const RatedServers: React.FC = () => {
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

  const serverTypeStyles: Record<string, string> = {
    vanilla: 'bg-blue-600',
    modded: 'bg-green-600',
  };

  const getServerTypeStyle = (serverType: string): string =>
    serverTypeStyles[serverType.toLowerCase()] || 'bg-gray-600';

  const TableHeader = () => (
    <thead className="bg-[#374151] text-[#C2D5DB]">
      <tr>
        {['Server', 'Type', 'Rating', 'Links'].map((heading) => (
          <th
            key={heading}
            className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase"
          >
            {heading}
          </th>
        ))}
      </tr>
    </thead>
  );

  const TableRow = ({ submission }: { submission: ServerSubmission }) => (
    <tr key={submission.id} className="cursor-pointer text-gray-300 hover:bg-[#2D3748]">
      <td className="px-6 py-4">
        <div>
          <div className="font-medium">{submission.name}</div>
          <div className="text-xs text-gray-400">{submission.server_ip}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 text-xs text-white rounded ${getServerTypeStyle(
            submission.server_type
          )}`}
        >
          {submission.server_type}
        </span>
      </td>
      <td className="px-6 py-4">{submission.rating || 'N/A'}</td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          {submission.website && (
            <a
              href={submission.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              <Icon icon="ant-design:link-outlined" className="w-6 h-6" />
            </a>
          )}
          {submission.discord && (
            <a
              href={submission.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              <Icon icon="cib:discord" className="w-6 h-6" />
            </a>
          )}
        </div>
      </td>
    </tr>
  );

  const renderContent = () => {
    if (isLoading) return <div className="text-white">Loading ranked submissions...</div>;
    if (rankedSubmissions.length === 0)
      return <div className="text-white">No ranked servers available.</div>;

    return (
      <table className="w-full text-sm bg-[#1E293B] rounded-lg overflow-hidden">
        <TableHeader />
        <tbody className="divide-y divide-gray-700">
          {rankedSubmissions.map((submission) => (
            <TableRow key={submission.id} submission={submission} />
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
      <div className="overflow-x-auto rounded-lg">{renderContent()}</div>
      
    </div>
  );
};

export default RatedServers;
