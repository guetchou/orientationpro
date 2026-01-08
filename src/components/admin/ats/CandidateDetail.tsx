
import React, { useState } from 'react';
import { Candidate } from '@/types/candidates';

interface CandidateDetailProps {
  candidate: Candidate;
  onUpdateStatus: (id: string, status: Candidate['status']) => void;
  onUpdateRating: (id: string, rating: number) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onClose: () => void;
}

const CandidateDetail: React.FC<CandidateDetailProps> = ({
  candidate,
  onUpdateStatus,
  onUpdateRating,
  onUpdateNotes,
  onClose
}) => {
  const [notes, setNotes] = useState(candidate.notes || '');
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateStatus(candidate.id, e.target.value as Candidate['status']);
  };
  
  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateRating(candidate.id, parseInt(e.target.value));
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  const handleNotesSave = () => {
    onUpdateNotes(candidate.id, notes);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold">{candidate.full_name}</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <p className="mt-1">{candidate.email}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
          <p className="mt-1">{candidate.phone}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position Applied For</label>
          <p className="mt-1">{candidate.position}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applied On</label>
          <p className="mt-1">{new Date(candidate.created_at).toLocaleDateString()}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select
            value={candidate.status}
            onChange={handleStatusChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
          <select
            value={candidate.rating}
            onChange={handleRatingChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="1">1 - Poor</option>
            <option value="2">2 - Below Average</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleNotesSave}
            className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Notes
          </button>
        </div>
        
        {candidate.resume_url && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resume</label>
            <a
              href={candidate.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >
              View Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetail;
