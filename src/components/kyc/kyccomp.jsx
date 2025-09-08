import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield } from 'lucide-react';

const KYCPendingComponent = ({ kycData, onCompleteKYC }) => {
  const { kycDetails } = kycData;
  const { currentStep, totalSteps, checklistStatus } = kycDetails;

  const getStatusBadge = (status) => {
    if (status === 'PENDING') {
      return <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
    } else if (status === 'COMPLETED') {
      return <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>;
    }
    return <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Not Started</span>;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">KYC Verification Required</h3>
        <p className="text-gray-600 mb-6">
          Complete your Know Your Customer (KYC) verification to proceed with your SIP investment.
        </p>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onCompleteKYC}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-12 py-6 rounded-full text-base font-medium"
        >
          Complete KYC Verification
        </Button>
      </div>
    </div>
  );
};

export default KYCPendingComponent;