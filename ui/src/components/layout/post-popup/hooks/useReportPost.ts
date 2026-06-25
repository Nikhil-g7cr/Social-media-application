import { useState } from 'react';
import { useCreateReportMutation } from '../../../../redux/features/report/reportApiSlice';

export const useReportPost = (postId?: string) => {
  const [createReport, { isLoading, error }] = useCreateReportMutation();
  const [success, setSuccess] = useState(false);

  const submitReport = async (reason: string) => {
    if (!postId || !reason) return;

    try {
      await createReport({
        targetType: 'POST',
        targetId: postId,
        reason,
      }).unwrap();
      setSuccess(true);
    } catch (err) {
      console.error('Failed to submit report', err);
    }
  };

  return { submitReport, isLoading, error, success };
};
