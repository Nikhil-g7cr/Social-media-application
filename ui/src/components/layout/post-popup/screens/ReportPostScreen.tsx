import React, { useState } from 'react';
import type { PopupPayload } from '../types';
import { useReportPost } from '../hooks/useReportPost';

interface ReportPostScreenProps {
  payload?: PopupPayload;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Spam or misleading",
  "Harassment or bullying",
  "Hate speech or symbols",
  "Violence or dangerous organizations",
  "Nudity or sexual activity",
  "Intellectual property violation",
  "Other"
];

const ReportPostScreen: React.FC<ReportPostScreenProps> = ({ payload, onClose }) => {
  const { submitReport, isLoading, error, success } = useReportPost(payload?.postId);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const handleSubmit = () => {
    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
    if (finalReason) {
      submitReport(finalReason);
    }
  };

  if (success) {
    return (
      <div className="p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Report Submitted</h3>
        <p className="text-gray-600 mb-6">Thank you for letting us know. We will review this post shortly.</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Report Post</h2>
      <p className="text-gray-600 mb-6">Why are you reporting this post?</p>
      
      {!!error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          Failed to submit report. Please try again.
        </div>
      )}

      <div className="space-y-3 mb-6">
        {REPORT_REASONS.map((reason) => (
          <label key={reason} className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="reportReason"
              value={reason}
              checked={selectedReason === reason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <span className="ml-3 font-medium text-gray-700">{reason}</span>
          </label>
        ))}
      </div>

      {selectedReason === 'Other' && (
        <div className="mb-6">
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Please provide more details..."
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
            maxLength={500}
          />
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-5 py-2 font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedReason || (selectedReason === 'Other' && !customReason) || isLoading}
          className="px-5 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Submit Report'
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportPostScreen;
