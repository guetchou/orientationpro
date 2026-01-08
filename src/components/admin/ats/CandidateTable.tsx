
import React from 'react';
import { Candidate } from '@/types/candidates';

interface CandidateTableProps {
  candidates: Candidate[];
  loading: boolean;
  onSelectCandidate: (candidate: Candidate) => void;
  onUpdateStatus: (id: string, status: Candidate['status']) => void;
  onUpdateRating: (id: string, rating: number) => void;
  onDeleteCandidate: (id: string) => void;
  selectedCandidateId?: string;
}

const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  loading,
  onSelectCandidate,
  onUpdateStatus,
  onUpdateRating,
  onDeleteCandidate,
  selectedCandidateId
}) => {
  if (loading) {
    return <div>Loading candidates...</div>;
  }

  if (candidates.length === 0) {
    return <div>No candidates found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {candidates.map((candidate) => (
            <tr 
              key={candidate.id} 
              className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                candidate.id === selectedCandidateId ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
              onClick={() => onSelectCandidate(candidate)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{candidate.full_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{candidate.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{candidate.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{candidate.rating}/5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCandidate(candidate.id);
                  }}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateTable;
