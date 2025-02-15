import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'default' | 'pill';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default' }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rejected':
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 ${type === 'pill' ? 'rounded-full' : 'rounded'} text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;