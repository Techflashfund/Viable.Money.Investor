import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/auth';
import Loader from '@/components/Loader'; // Custom 3D loader
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileText,
  X,
  IndianRupee,
  Mail,
  Shield
} from 'lucide-react';

// Fund Icon Component
const FundIcon = ({ fund, size = "w-12 h-12" }) => {
  const getGradientColors = (name) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-red-500 to-pink-600',
      'from-teal-500 to-green-600'
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  return (
    <div className={`${size} bg-gradient-to-br ${getGradientColors(fund?.name)} rounded-full flex items-center justify-center flex-shrink-0`}>
      <div className="w-1/2 h-1/2 bg-white rounded-full opacity-80"></div>
    </div>
  );
};

// Utility function to generate UUID v4
const generateTransactionId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 1. Lumpsum Configuration Component
const LumpsumFormComponent = ({ fundData, lumpsumFulfillments, onSubmit, loading, errors }) => {
  const [formData, setFormData] = useState({
    amount: '',
    selectedLumpsumFulfillment: lumpsumFulfillments?.[0] || null
  });

  const currentFulfillment = formData.selectedLumpsumFulfillment;
  const thresholds = currentFulfillment?.thresholds || {};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLumpsumFulfillmentChange = (fulfillmentId) => {
    const selectedFulfillment = lumpsumFulfillments.find(f => f.fulfillmentId === fulfillmentId);
    setFormData(prev => ({ 
      ...prev, 
      selectedLumpsumFulfillment: selectedFulfillment
    }));
  };

  const handleSubmit = () => {
    // Validate form
    const newErrors = {};
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseInt(formData.amount);
      if (thresholds.amountMin && amount < thresholds.amountMin) {
        newErrors.amount = `Minimum amount is ₹${thresholds.amountMin}`;
      } else if (thresholds.amountMax && amount > thresholds.amountMax) {
        newErrors.amount = `Maximum amount is ₹${thresholds.amountMax}`;
      } else if (thresholds.amountMultiples && amount % thresholds.amountMultiples !== 0) {
        newErrors.amount = `Amount must be in multiples of ₹${thresholds.amountMultiples}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      // Pass errors to parent
      onSubmit({ ...formData, errors: newErrors });
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      {/* Lumpsum Fulfillment Selection (if multiple options available) */}
      {lumpsumFulfillments.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Plan <span className="text-red-500">*</span>
          </label>
          <select
            value={currentFulfillment?.fulfillmentId || ''}
            onChange={(e) => handleLumpsumFulfillmentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {lumpsumFulfillments.map(fulfillment => (
              <option key={fulfillment.fulfillmentId} value={fulfillment.fulfillmentId}>
                Lumpsum Investment
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lumpsum Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Investment Amount (₹) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <IndianRupee className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="Enter investment amount"
            min={thresholds.amountMin}
            max={thresholds.amountMax}
            step={thresholds.amountMultiples || 1}
            className={`w-full pl-10 pr-4 py-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.amount ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        {thresholds.amountMin && (
          <p className="mt-1 text-xs text-gray-500">
            Minimum amount: ₹{thresholds.amountMin?.toLocaleString()}
            {thresholds.amountMultiples && thresholds.amountMultiples > 1 && ` (in multiples of ₹${thresholds.amountMultiples})`}
          </p>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-12 py-6 rounded-full text-base font-medium"
        >
          Invest Now
        </Button>
      </div>
    </div>
  );
};

// 2. Folio Selection Component
const FolioSelectionComponent = ({ lumpsumResponse, onCreateFolio, onSelectExistingFolio, loading, errors }) => {
  const hasExistingFolios = lumpsumResponse?.existingFolios && lumpsumResponse.existingFolios.length > 0;
  const hasNewFolioOption = lumpsumResponse?.newFolio;

  if (!hasExistingFolios && hasNewFolioOption) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Create New Folio
          </h3>
          <p className="text-gray-600 mb-6">
            No existing folio found. A new folio will be created for your lumpsum investment.
          </p>
        </div>
         <div className='flex justify-center pt-4'>
        <Button
          onClick={onCreateFolio}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-12 py-6 rounded-full text-base font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Folio...
            </>
          ) : (
            <>
              
              Create New Folio
            </>
          )}
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Select Folio Option
        </h3>
        <p className="text-gray-600 mb-6">
          Choose to use an existing folio or create a new one for your lumpsum investment.
        </p>
      </div>

      {hasExistingFolios && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Use Existing Folio</h4>
          {lumpsumResponse.existingFolios.map((folio, index) => (
            <div
              key={index}
              onClick={() => onSelectExistingFolio(folio)}
              className="border-2 border-gray-200 rounded p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Folio: {folio.folioNumber}</p>
                  <p className="text-sm text-gray-600">Holder: {folio.holderName}</p>
                  <p className="text-xs text-gray-500">Created: {folio.createdOn}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Email: {folio.maskedEmail}</p>
                  <p className="text-xs text-gray-500">Mobile: {folio.maskedMobile}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {folio.holdingPattern}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasNewFolioOption && (
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <Button
            onClick={onCreateFolio}
            disabled={loading}
            variant="outline"
            className="w-full border-blue-200 hover:bg-blue-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating New Folio...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create New Folio
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// 3. Payment Method Selection Component
const PaymentInitiationComponent = ({ 
  paymentMethodsData, 
  onPaymentMethodSelect,
  loading,
  errors 
}) => {
  // Filter out payment methods with null auth
  const filteredPaymentMethods = paymentMethodsData?.paymentMethods?.filter(paymentMethod => 
    paymentMethod.methods?.[0]?.auth !== null && paymentMethod.methods?.[0]?.auth !== undefined
  ) || [];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Payment Method</h3>
        <p className="text-gray-600 mb-6">
          Choose your preferred payment method for the lumpsum investment
        </p>
      </div>
      
      <div className="space-y-3">
        {filteredPaymentMethods.length > 0 ? (
          filteredPaymentMethods.map((paymentMethod, index) => {
            const method = paymentMethod.methods?.[0] || {};
            const methodKey = paymentMethod.paymentId || paymentMethod._id || `method-${index}`;
            
            return (
              <div
                key={methodKey}
                onClick={() => onPaymentMethodSelect(paymentMethod)}
                className="border-2 border-gray-200 rounded p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">
                      {method.mode?.replace(/_/g, ' ') || 'Payment Method'}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Auth: {method.auth || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Type: {paymentMethod.type} | Collected by: {paymentMethod.collectedBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      Available
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No payment methods available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. OTP Sent Component (with input field)
const OTPSentComponent = ({ otpData, onVerifyOTP, onResendOTP, loading, errors }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = () => {
    if (!otp.trim()) {
      return;
    }
    onVerifyOTP(otp);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">OTP Sent Successfully</h3>
        <p className="text-gray-600 mb-6">
          We've sent a verification code to your email address
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Email sent to:</p>
            <p className="text-blue-700">{otpData?.email}</p>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Code expires in {otpData?.expiresIn}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OTP Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono ${
            errors.otp ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={loading || otp.length !== 6}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </Button>

        <div className="text-center">
          <Button
            onClick={onResendOTP}
            disabled={loading}
            variant="outline"
            className="text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resending...
              </>
            ) : (
              'Resend OTP'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// 5. Payment URL Component
const PaymentURLComponent = ({ paymentData, onOpenPayment, loading }) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <IndianRupee className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Ready</h3>
        <p className="text-gray-600 mb-6">
          Your payment link has been generated. Click the button below to complete your payment.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm text-green-700">
            <span className="font-medium">Transaction ID:</span> {paymentData?.transactionId}
          </p>
          <p className="text-sm text-green-700">
            <span className="font-medium">Order ID:</span> {paymentData?.orderId}
          </p>
          <p className="text-sm text-green-700">
            <span className="font-medium">Status:</span> {paymentData?.orderStatus}
          </p>
        </div>
      </div>

      <Button
        onClick={onOpenPayment}
        className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
      >
        Complete Payment
      </Button>
    </div>
  );
};

// 6. Payment Status Component
const PaymentStatusComponent = ({ loading, status, onRetry }) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          loading ? 'bg-blue-100' : 
          status === 'PAID' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {loading ? (
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          ) : status === 'PAID' ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {loading ? 'Checking Payment Status...' : 
           status === 'PAID' ? 'Payment Successful!' :
           'Payment Status'}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {loading ? 'Please wait while we verify your payment' :
           status === 'PAID' ? 'Your lumpsum investment has been successfully completed!' :
           'Waiting for payment confirmation'}
        </p>
      </div>

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm text-center">
            This may take a few moments. Please do not close this window.
          </p>
        </div>
      )}

      {status === 'PAID' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Investment Complete</p>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Your lumpsum investment has been successfully processed.
          </p>
        </div>
      )}

      {!loading && status !== 'PAID' && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="w-full"
        >
          Check Payment Status Again
        </Button>
      )}
    </div>
  );
};

// 7. Onboarding Incomplete Component
const OnboardingIncompleteComponent = ({ onCompleteOnboarding }) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Onboarding</h3>
        <p className="text-gray-600 mb-6">
          To proceed with lumpsum investment, you need to complete your onboarding process first.
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <p className="text-orange-800 font-medium">Onboarding Required</p>
        </div>
        <p className="text-orange-700 text-sm">
          Please complete your KYC and profile information to start investing.
        </p>
      </div>

      <Button
        onClick={onCompleteOnboarding}
        className="w-full bg-orange-600 hover:bg-orange-700"
      >
        Complete Onboarding
      </Button>
    </div>
  );
};

// Main Lumpsum Transaction Component
const LumpsumTransaction = ({ 
  clientData, 
  fundData, 
  transactionData, // { providerId, itemId, fulfillmentId, fulfillmentDetails }
  onBack, 
  onFolioSelection,
  isOpen = true 
}) => {
  // Auth store
  const { user, transactionId: userTransactionId } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState('form');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [lumpsumResponse, setLumpsumResponse] = useState(null);
  const [transactionId] = useState(generateTransactionId());

  // Payment related states
  const [paymentMethodsData, setPaymentMethodsData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  
  // OTP related states
  const [otpData, setOtpData] = useState(null);
  
  // Payment initiation states
  const [paymentInitiationData, setPaymentInitiationData] = useState(null);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [paymentStatusResponse, setPaymentStatusResponse] = useState(null);
  const [finalPaymentStatus, setFinalPaymentStatus] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Onboarding related states
  const [onboardingData, setOnboardingData] = useState(null);
  const [panNumber, setPanNumber] = useState(null);
  const [onboardingIncomplete, setOnboardingIncomplete] = useState(false);

  // Extract Lumpsum fulfillments from fund data
  const getLumpsumFulfillments = () => {
    if (!fundData?.fulfillments) return [];
    return fundData.fulfillments.filter(f => f.type === 'LUMPSUM');
  };

  const lumpsumFulfillments = getLumpsumFulfillments();

  // Fetch onboarding data when popup opens
  useEffect(() => {
    const initializeOnboardingData = async () => {
      if (isOpen && userTransactionId && !panNumber && !onboardingIncomplete) {
        setLoading(true);
        await fetchOnboardingData();
        setLoading(false);
      }
    };

    initializeOnboardingData();
  }, [isOpen, userTransactionId, panNumber, onboardingIncomplete]);

  // Handle modal close
  const handleModalClose = () => {
    if (onBack) onBack();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleModalClose();
    }
  };

  // Fetch Onboarding Data to get PAN
  const fetchOnboardingData = async () => {
    if (!userTransactionId) {
      setOnboardingIncomplete(true);
      return false;
    }

    try {
      const response = await fetch(`https://viable-money-be.onrender.com/api/onboarding/data/${userTransactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data?.basicInfo?.pan) {
          setOnboardingData(data.data);
          setPanNumber(data.data.basicInfo.pan);
          return true;
        } else {
          setOnboardingIncomplete(true);
          return false;
        }
      } else if (response.status === 404) {
        setOnboardingIncomplete(true);
        return false;
      } else {
        throw new Error('Failed to fetch onboarding data');
      }
    } catch (error) {
      setOnboardingIncomplete(true);
      return false;
    }
  };

  // Handle Complete Onboarding Navigation
  const handleCompleteOnboarding = () => {
    window.location.href = '/onboarding';
  };

  // Step 1: Handle Lumpsum Form Submission
  const handleLumpsumSubmit = async (formData) => {
    // Handle validation errors
    if (formData.errors) {
      setErrors(formData.errors);
      return;
    }

    // Check if onboarding is incomplete or PAN is not available
    if (onboardingIncomplete || !panNumber) {
      if (!panNumber && userTransactionId) {
        setErrors({ api: 'Loading user data. Please wait a moment and try again.' });
        return;
      }
      setCurrentStep('onboarding-incomplete');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const selectedFulfillment = formData.selectedLumpsumFulfillment;
      
      const requestBody = {
        type: "LUMPSUM",
        transactionId: transactionId,
        userId: user?.userId,
        providerId: transactionData.providerId,
        itemId: transactionData.itemId,
        fulfillmentId: selectedFulfillment.fulfillmentId,
        lumpsum: {
          value: parseInt(formData.amount)
        },
        distributor: {
          arn: "ARN-310537",
          euin: "E588669"
        },
        customer: {
          pan: panNumber // Use fetched PAN
        }
      };

      const response = await fetch('https://viable-money-be.onrender.com/api/transaction/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLumpsumResponse(data.data);
        
        if (data.data.type === 'LUMPSUM_NEW' || (data.data.existingFolios && data.data.existingFolios.length === 0)) {
          setCurrentStep('folio');
        } else if (data.data.type === 'LUMPSUM_NEW&EXISTING' || data.data.folioStatus === 'NEW_AND_EXISTING') {
          setCurrentStep('folio');
        } else if (data.data.existingFolios && data.data.existingFolios.length > 0) {
          setCurrentStep('folio');
        } else {
          if (onFolioSelection) {
            onFolioSelection(data.data, 'existing');
          }
        }
      } else {
        throw new Error(data.message || 'Failed to submit lumpsum investment');
      }
      
    } catch (error) {
      setErrors({ api: 'Failed to submit lumpsum investment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Folio Creation
  const handleFolioCreation = async () => {
    if (!lumpsumResponse?.newFolio) return;

    setLoading(true);
    setErrors({});

    try {
      // Step 1: Submit folio form
      const folioFormBody = {
        formUrl: lumpsumResponse.newFolio.formUrl,
        userTransactionId: userTransactionId, // Hardcoded as requested
        transactionId: transactionId
      };

      const folioFormResponse = await fetch('https://investment.flashfund.in/api/test/folioform/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folioFormBody)
      });

      const folioFormData = await folioFormResponse.json();

      if (!folioFormResponse.ok || !folioFormData.success) {
        throw new Error(folioFormData.message || 'Failed to submit folio form');
      }

      // Extract submissionId and transactionId from response
      const submissionId = folioFormData.data?.submissionId || folioFormData.data?.response?.submissionId;
      const externalTransactionId = folioFormData.data?.externalTransactionId;

      if (!submissionId) {
        throw new Error('Submission ID not found in response');
      }

      // Step 2: Get payment methods
      const paymentMethodsBody = {
        transactionId: externalTransactionId || transactionId,
        submissionId: submissionId
      };

      const paymentMethodsResponse = await fetch('https://viable-money-be.onrender.com/api/transaction/newfolio-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentMethodsBody)
      });

      const paymentMethodsData = await paymentMethodsResponse.json();

      if (!paymentMethodsResponse.ok || !paymentMethodsData.success) {
        throw new Error(paymentMethodsData.message || 'Failed to get payment methods');
      }

      // Check if payment methods are available
      if (paymentMethodsData.data?.status === 'PAYMENT_SELECTION_AVAILABLE' && 
          paymentMethodsData.data?.paymentMethods && 
          paymentMethodsData.data.paymentMethods.length > 0) {
        
        setPaymentMethodsData({
          transactionId: paymentMethodsData.data.transactionId,
          paymentMethods: paymentMethodsData.data.paymentMethods,
          submissionId: submissionId
        });
        
        setCurrentStep('payment');
      } else {
        throw new Error('Payment methods not available');
      }
      
    } catch (error) {
      setErrors({ api: error.message || 'Failed to create new folio. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle Payment Method Selection
  const handlePaymentMethodSelect = async (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setLoading(true);
    setErrors({});

    try {
      // Send OTP
      const otpResponse = await fetch('https://viable-money-be.onrender.com/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.userId
        })
      });

      const otpData = await otpResponse.json();

      if (otpResponse.ok && otpData.success) {
        setOtpData(otpData.data);
        setCurrentStep('otp-sent');
      } else {
        throw new Error(otpData.message || 'Failed to send OTP');
      }
      
    } catch (error) {
      setErrors({ api: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Handle Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setErrors({});

    try {
      const otpResponse = await fetch('https://viable-money-be.onrender.com/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.userId
        })
      });

      const otpData = await otpResponse.json();

      if (otpResponse.ok && otpData.success) {
        setOtpData(otpData.data);
        // Stay on the same step (otp-sent)
      } else {
        throw new Error(otpData.message || 'Failed to send OTP');
      }
      
    } catch (error) {
      setErrors({ api: 'Failed to resend OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Handle OTP Verification
  const handleOTPVerify = async (otp) => {
    setLoading(true);
    setErrors({});

    try {
      const verifyResponse = await fetch('https://viable-money-be.onrender.com/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.userId,
          otp: otp
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.success) {
        // OTP verified successfully - now initiate payment
        await handlePaymentInitiation();
      } else {
        setErrors({ otp: verifyData.message || 'Invalid OTP. Please try again.' });
      }
      
    } catch (error) {
      setErrors({ otp: 'Failed to verify OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Handle Payment Initiation
  const handlePaymentInitiation = async () => {
    if (!selectedPaymentMethod || !paymentMethodsData) return;

    try {
      const paymentInitiationBody = {
        type: "SELECTEDPAYMENT",
        userId: user?.userId,
        transactionId: paymentMethodsData.transactionId,
        folioNumber: "1234567",
        paymentIp: "117.200.73.102",
        paymentMethod: {
          mode: selectedPaymentMethod.methods[0].mode || "UPI_AUTOPAY",
          auth: selectedPaymentMethod.methods[0].auth || "URI"
        }
      };

      const response = await fetch('https://viable-money-be.onrender.com/api/transaction/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentInitiationBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPaymentInitiationData(data.data);
        setCurrentStep('payment-url');
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
      
    } catch (error) {
      setErrors({ api: 'Failed to initiate payment. Please try again.' });
    }
  };

  // Step 7: Handle Payment URL Opening
  const handleOpenPayment = () => {
    if (paymentInitiationData?.paymentUrl) {
      window.open(paymentInitiationData.paymentUrl, '_blank');
      // Start checking payment status
      setCurrentStep('payment-status');
      startPaymentStatusCheck();
    }
  };

  // Step 8: Start Payment Status Check
  const startPaymentStatusCheck = async () => {
    setPaymentStatusLoading(true);
    await checkPaymentStatus();
  };

  // Step 9: Check Payment Status with Polling
  const checkPaymentStatus = async (attemptNumber = 1) => {
    if (!paymentInitiationData?.transactionId) return;

    try {
      const response = await fetch(`https://investment.flashfund.in/api/ondc/payment/status/${paymentInitiationData.transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentStatusResponse(data);
        
        if (data.success && data.data && data.data.paymentStatus === 'PAID') {
          setPaymentStatusLoading(false);
          setFinalPaymentStatus('PAID');
          setShowCompletionModal(true);
          return;
        } else if (data.success && data.data && data.data.paymentStatus === 'NOT-PAID') {
          setPaymentStatusLoading(false);
          setFinalPaymentStatus('NOT-PAID');
          setErrors({ api: 'Payment was not completed. Please try again.' });
          return;
        }
        
        // Continue polling if status is pending
        if (attemptNumber < 20) { // Max 20 attempts (about 2 minutes)
          setTimeout(() => {
            checkPaymentStatus(attemptNumber + 1);
          }, 6000); // Check every 6 seconds
        } else {
          setPaymentStatusLoading(false);
          setErrors({ api: 'Payment status check timed out. Please contact support.' });
        }
      } else {
        throw new Error('Failed to check payment status');
      }
      
    } catch (error) {
      if (attemptNumber < 5) { // Retry up to 5 times for errors
        setTimeout(() => {
          checkPaymentStatus(attemptNumber + 1);
        }, 3000);
      } else {
        setPaymentStatusLoading(false);
        setErrors({ api: 'Failed to check payment status. Please try again.' });
      }
    }
  };

  // Retry Payment Status Check
  const handleRetryPaymentStatus = () => {
    setErrors({});
    setFinalPaymentStatus(null);
    startPaymentStatusCheck();
  };

  if (!isOpen) return null;

  if (lumpsumFulfillments.length === 0) {
    return (
      <div 
        className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white shadow-2xl w-full max-w-md p-6 rounded-lg text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Lumpsum Not Available</h3>
          <p className="text-gray-600 mb-4">
            This fund does not support lumpsum investments at the moment.
          </p>
          <Button onClick={handleModalClose} className="w-full">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Fund Info */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4 flex-1">
            <FundIcon fund={fundData} />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900">{fundData?.name || fundData?.fundName}</h1>
              <p className="text-sm text-gray-600">
                {fundData?.creator} • {fundData?.category || 'Mixed'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Lumpsum investment available
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleModalClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <div className="mb-6">
                  <Loader />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentStep === 'form' ? '' : 
                   currentStep === 'payment' ? '' : 
                   ''}
                </h3>
                
              </div>
            </div>
          )}

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Error Messages */}
            {errors.api && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                  <p className="text-sm font-medium text-red-800">{errors.api}</p>
                </div>
              </div>
            )}

            {/* Step Components */}
            {currentStep === 'onboarding-incomplete' && (
              <OnboardingIncompleteComponent
                onCompleteOnboarding={handleCompleteOnboarding}
              />
            )}

            {currentStep === 'form' && (
              <LumpsumFormComponent
                fundData={fundData}
                lumpsumFulfillments={lumpsumFulfillments}
                onSubmit={handleLumpsumSubmit}
                loading={loading}
                errors={errors}
              />
            )}

            {currentStep === 'folio' && (
              <FolioSelectionComponent
                lumpsumResponse={lumpsumResponse}
                onCreateFolio={handleFolioCreation}
                onSelectExistingFolio={() => {}}
                loading={loading}
                errors={errors}
              />
            )}

            {currentStep === 'payment' && (
              <PaymentInitiationComponent
                paymentMethodsData={paymentMethodsData}
                onPaymentMethodSelect={handlePaymentMethodSelect}
                loading={loading}
                errors={errors}
              />
            )}

            {currentStep === 'otp-sent' && (
              <OTPSentComponent
                otpData={otpData}
                onVerifyOTP={handleOTPVerify}
                onResendOTP={handleResendOTP}
                loading={loading}
                errors={errors}
              />
            )}

            {currentStep === 'payment-url' && (
              <PaymentURLComponent
                paymentData={paymentInitiationData}
                onOpenPayment={handleOpenPayment}
                loading={loading}
              />
            )}

            {currentStep === 'payment-status' && (
              <PaymentStatusComponent
                loading={paymentStatusLoading}
                status={finalPaymentStatus}
                onRetry={handleRetryPaymentStatus}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LumpsumTransaction;