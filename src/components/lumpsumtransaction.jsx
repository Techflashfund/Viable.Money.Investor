import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileText,
  X,
  IndianRupee
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

// 1. Lumpsum Form Component
const LumpsumFormComponent = ({ fundData, onSubmit, loading, errors }) => {
  const [formData, setFormData] = useState({
    amount: ''
  });

  // Get Lumpsum constraints from fund data
  const getLumpsumConstraints = () => {
    if (!fundData?.fulfillments) return null;
    
    const lumpsumFulfillment = fundData.fulfillments.find(f => 
      f.type === 'LUMPSUM'
    );
    
    if (!lumpsumFulfillment?.thresholds) return null;
    
    return {
      minAmount: parseInt(lumpsumFulfillment.thresholds.AMOUNT_MIN || '0'),
      maxAmount: parseInt(lumpsumFulfillment.thresholds.AMOUNT_MAX || '0'),
      amountMultiples: parseInt(lumpsumFulfillment.thresholds.AMOUNT_MULTIPLES || '1')
    };
  };

  const constraints = getLumpsumConstraints();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      {/* Investment Amount */}
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
            className={`w-full pl-10 pr-4 py-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.amount ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        {constraints && (
          <p className="mt-1 text-xs text-gray-500">
            ₹{constraints.minAmount} - ₹{constraints.maxAmount}
            {constraints.amountMultiples > 1 && ` (multiples of ₹${constraints.amountMultiples})`}
          </p>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-12 py-3 rounded-full text-base font-medium"
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

  // If only new folio option (original scenario)
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

        <Button
          onClick={onCreateFolio}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Folio...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Create New Folio
            </>
          )}
        </Button>
      </div>
    );
  }

  // If both new and existing folios are available
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

      {/* Existing Folios */}
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

      {/* New Folio Option */}
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

// 3. KYC Component
const KYCComponent = ({ 
  kycData, 
  onCompleteKYC, 
  onCompleteESign, 
  onGetPaymentMethods,
  kycUrlClicked,
  eSignUrlClicked,
  kycStatusLoading,
  eSignStatusLoading,
  kycStatusAttempts,
  eSignStatusAttempts,
  currentKYCStep,
  errors 
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          KYC Verification Required
        </h3>
        <p className="text-gray-600 mb-6">
          Complete your KYC verification to proceed with the investment.
        </p>
      </div>

      {/* KYC Progress */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h4 className="font-medium text-blue-900 mb-3">KYC Progress</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Current Step:</span>
            <span className="font-medium text-blue-900">
              {kycData?.currentStep || 1} of {kycData?.totalSteps || 2}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className={`text-xs p-2 rounded ${
              kycData?.checklistStatus?.kyc === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
              kycData?.checklistStatus?.kyc && kycData?.checklistStatus?.kyc !== 'PENDING' ? 'bg-green-100 text-green-800' : 
              'bg-gray-100 text-gray-600'
            }`}>
              KYC: {kycData?.checklistStatus?.kyc || 'PENDING'}
            </div>
            <div className={`text-xs p-2 rounded ${
              kycData?.checklistStatus?.esign === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
              kycData?.checklistStatus?.esign === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 
              'bg-gray-100 text-gray-600'
            }`}>
              E-Sign: {kycData?.checklistStatus?.esign || 'PENDING'}
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: KYC */}
      {currentKYCStep === 'kyc' && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded p-4">
            <h4 className="font-medium text-orange-900 mb-3">Step 1: Complete KYC Form</h4>
            <p className="text-sm text-orange-800 mb-4">
              Click the button below to open the KYC form in a new tab and complete your verification.
            </p>
            
            <Button
              onClick={() => onCompleteKYC(kycData?.formUrl)}
              disabled={kycUrlClicked}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
            >
              {kycUrlClicked ? 'KYC Form Opened' : 'Complete KYC'}
            </Button>
          </div>

          {/* KYC Status Checking */}
          {kycStatusLoading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                <div className="text-center">
                  <p className="text-yellow-800 font-medium">Checking KYC Status...</p>
                  <p className="text-yellow-700 text-sm">
                    Attempt {kycStatusAttempts} of 30
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: E-Sign */}
      {currentKYCStep === 'esign' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <h4 className="font-medium text-green-900 mb-2">KYC Completed Successfully!</h4>
            <p className="text-sm text-green-800">Your KYC verification has been completed.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="font-medium text-blue-900 mb-3">Step 2: E-Sign Document</h4>
            <p className="text-sm text-blue-800 mb-4">
              Now complete the electronic signature to finalize your application.
            </p>
            
            <Button
              onClick={onCompleteESign}
              disabled={eSignUrlClicked}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {eSignUrlClicked ? 'E-Sign Form Opened' : 'Complete E-Sign'}
            </Button>
          </div>

          {/* E-Sign Status Checking */}
          {eSignStatusLoading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                <div className="text-center">
                  <p className="text-yellow-800 font-medium">Checking E-Sign Status...</p>
                  <p className="text-yellow-700 text-sm">
                    Attempt {eSignStatusAttempts} of 30
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Get Payment Methods */}
      {currentKYCStep === 'payment_methods' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <h4 className="font-medium text-green-900 mb-2">E-Sign Completed Successfully!</h4>
            <p className="text-sm text-green-800">Your application has been submitted successfully.</p>
          </div>

          <Button
            onClick={onGetPaymentMethods}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Proceed to Payment Methods
          </Button>
        </div>
      )}
    </div>
  );
};

// 4. Payment Initiation Component with improved payment method handling
const PaymentInitiationComponent = ({ 
  paymentMethodsData, 
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onInitiatePayment,
  loading,
  paymentResponse,
  onPaymentUrlClick,
  paymentUrlClicked,
  paymentStatusLoading,
  statusCheckAttempts,
  errors 
}) => {
  const PAYMENT_HARDCODED = {
    folioNumber: "4562132132/45",
    paymentIp: "192.168.1.100",
    phoneNumber: "9876543210",
    ifsc: "ICIC0001234",
    accountNumber: "123456789012",
    accountHolderName: "Satish K Perala"
  };

  // Debug: Log the payment methods data structure
  console.log('PaymentInitiationComponent - paymentMethodsData:', paymentMethodsData);

  return (
    <div className="space-y-4">
      {!selectedPaymentMethod ? (
        // Payment Method Selection
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Payment Method</h3>
          
          {/* Debug Information */}
          <div className="mb-4 p-3 bg-gray-50 border rounded text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Payment Methods Available: {paymentMethodsData?.paymentMethods?.length || 0}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">View Raw Data</summary>
              <pre className="mt-2 text-xs bg-white p-2 border rounded overflow-auto max-h-40">
                {JSON.stringify(paymentMethodsData, null, 2)}
              </pre>
            </details>
          </div>

          <div className="space-y-3">
            {paymentMethodsData?.paymentMethods?.length > 0 ? (
              paymentMethodsData.paymentMethods.map((paymentMethod, index) => {
                // Flexible key generation - try multiple possible ID fields
                const methodKey = paymentMethod.paymentId || paymentMethod.id || paymentMethod._id || `method-${index}`;
                
                // Flexible method access - check multiple possible structures
                const methods = paymentMethod.availableMethods || paymentMethod.methods || [];
                const hasValidMethods = Array.isArray(methods) && methods.length > 0;
                
                // Extract display information flexibly
                const displayInfo = {
                  mode: (hasValidMethods ? methods[0]?.mode : paymentMethod.mode) || 'Unknown Payment Method',
                  auth: (hasValidMethods ? methods[0]?.auth : paymentMethod.auth) || 'N/A',
                  type: paymentMethod.type || 'Unknown',
                  collectedBy: paymentMethod.collectedBy || 'Unknown',
                  mandateLimit: (hasValidMethods ? (methods[0]?.mandateLimit || methods[0]?.mandate_limit) : paymentMethod.mandateLimit) || null,
                  bankName: (hasValidMethods ? methods[0]?.bankName : paymentMethod.bankName) || null
                };

                return (
                  <div
                    key={methodKey}
                    onClick={() => onPaymentMethodSelect(paymentMethod)}
                    className="border-2 border-gray-200 rounded p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {displayInfo.mode.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {displayInfo.auth}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Type: {displayInfo.type.replace(/_/g, ' ')}</p>
                      <p>Collected by: {displayInfo.collectedBy}</p>
                      {displayInfo.mandateLimit && (
                        <p>Mandate Limit: ₹{displayInfo.mandateLimit}</p>
                      )}
                      {displayInfo.bankName && (
                        <p>Bank: {displayInfo.bankName}</p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${hasValidMethods ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {hasValidMethods ? '✓ Available' : 'Limited Info'}
                        </span>
                        <span className="text-xs text-gray-400">
                          ID: {methodKey}
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
                <p className="text-xs text-gray-400">
                  This might be due to data not being loaded yet or an API issue.
                </p>
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 text-sm">Show Debug Info</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 border rounded overflow-auto max-h-40">
                    {JSON.stringify(paymentMethodsData, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Bank Account Confirmation
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Bank Details</h3>
          
          {/* Selected Payment Method */}
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <h4 className="font-medium text-green-900 mb-2">Selected Payment Method</h4>
            <p className="text-green-800">
              {(selectedPaymentMethod.availableMethods?.[0]?.mode || 
                selectedPaymentMethod.methods?.[0]?.mode || 
                selectedPaymentMethod.mode || 'Unknown').replace(/_/g, ' ')}
            </p>
            {(selectedPaymentMethod.availableMethods?.[0]?.bankName || 
              selectedPaymentMethod.methods?.[0]?.bankName || 
              selectedPaymentMethod.bankName) && (
              <p className="text-sm text-green-700 mt-1">
                Bank: {selectedPaymentMethod.availableMethods?.[0]?.bankName || 
                       selectedPaymentMethod.methods?.[0]?.bankName || 
                       selectedPaymentMethod.bankName}
              </p>
            )}
          </div>

          {/* Bank Details */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-3">Bank Account Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-700">Account Holder:</span>
                <p className="text-blue-900">{PAYMENT_HARDCODED.accountHolderName}</p>
              </div>
              <div>
                <span className="text-blue-700">Account Number:</span>
                <p className="text-blue-900">{PAYMENT_HARDCODED.accountNumber}</p>
              </div>
              <div>
                <span className="text-blue-700">IFSC Code:</span>
                <p className="text-blue-900">{PAYMENT_HARDCODED.ifsc}</p>
              </div>
              <div>
                <span className="text-blue-700">Phone Number:</span>
                <p className="text-blue-900">{PAYMENT_HARDCODED.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Payment Response */}
          {paymentResponse?.data?.paymentUrl && (
            <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
              <h4 className="font-medium text-green-900 mb-3">Payment Initiated!</h4>
              <div className="text-center mb-4">
                <Button
                  onClick={() => onPaymentUrlClick(paymentResponse.data.paymentUrl)}
                  disabled={paymentUrlClicked}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {paymentUrlClicked ? 'Payment Link Opened' : 'Proceed to Payment'}
                </Button>
                <p className="text-xs text-green-700 mt-2">
                  Click to complete your lumpsum payment in a new tab
                </p>
              </div>

              {/* Payment Status Checking */}
              {paymentStatusLoading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                    <div className="text-center">
                      <p className="text-yellow-800 font-medium">Checking Payment Status...</p>
                      <p className="text-yellow-700 text-sm">
                        Attempt {statusCheckAttempts} of 30
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={onInitiatePayment}
            disabled={loading || paymentResponse}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Initiating Payment...
              </>
            ) : paymentResponse ? (
              'Payment Initiated'
            ) : (
              'Confirm & Initiate Payment'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// Main Lumpsum Transaction Component
const LumpsumTransaction = ({ 
  clientData, 
  fundData, 
  transactionData, 
  onBack, 
  onFolioSelection,
  isOpen = true 
}) => {
  const [currentStep, setCurrentStep] = useState('form'); // 'form' | 'folio' | 'kyc' | 'payment'
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // API Responses
  const [lumpsumResponse, setLumpsumResponse] = useState(null);
  const [paymentMethodsData, setPaymentMethodsData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentResponse, setPaymentResponse] = useState(null);
  
  // Folio selection
  const [selectedExistingFolio, setSelectedExistingFolio] = useState(null);

  // KYC States
  const [kycData, setKycData] = useState(null);
  const [currentKYCStep, setCurrentKYCStep] = useState('kyc'); // 'kyc' | 'esign' | 'payment_methods'
  const [kycUrlClicked, setKycUrlClicked] = useState(false);
  const [eSignUrlClicked, setESignUrlClicked] = useState(false);
  const [kycStatusLoading, setKycStatusLoading] = useState(false);
  const [eSignStatusLoading, setESignStatusLoading] = useState(false);
  const [kycStatusAttempts, setKycStatusAttempts] = useState(0);
  const [eSignStatusAttempts, setESignStatusAttempts] = useState(0);
  const [eSignData, setESignData] = useState(null);

  // Payment Status Polling States
  const [paymentUrlClicked, setPaymentUrlClicked] = useState(false);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [paymentStatusResponse, setPaymentStatusResponse] = useState(null);
  const [statusCheckAttempts, setStatusCheckAttempts] = useState(0);
  const [finalPaymentStatus, setFinalPaymentStatus] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

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

  // Handle payment URL click and start status polling
  const handlePaymentUrlClick = (paymentUrl) => {
    window.open(paymentUrl, '_blank');
    setPaymentUrlClicked(true);
    startPaymentStatusPolling();
  };

  // Start polling payment status
  const startPaymentStatusPolling = async () => {
    setPaymentStatusLoading(true);
    setStatusCheckAttempts(0);
    setFinalPaymentStatus(null);
    pollPaymentStatus();
  };

  // Poll payment status with retries
  const pollPaymentStatus = async (attemptNumber = 1) => {
    if (attemptNumber > 30) {
      setPaymentStatusLoading(false);
      setFinalPaymentStatus('TIMEOUT');
      setErrors({ api: 'Payment status check timeout after 30 attempts. Please check manually.' });
      return;
    }

    setStatusCheckAttempts(attemptNumber);

    try {
      const transactionId = paymentResponse?.data?.transactionId || lumpsumResponse?.transactionId;
      const response = await fetch(`https://preprod.wyable.in/api/ondc/payment/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Payment Status Check (Attempt ${attemptNumber}):`, data);
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
        
        setTimeout(() => {
          pollPaymentStatus(attemptNumber + 1);
        }, 5000);
        
      } else {
        setTimeout(() => {
          pollPaymentStatus(attemptNumber + 1);
        }, 5000);
      }
    } catch (error) {
      console.error(`Payment status check error (Attempt ${attemptNumber}):`, error);
      setTimeout(() => {
        pollPaymentStatus(attemptNumber + 1);
      }, 5000);
    }
  };

  // KYC Handlers
  const handleCompleteKYC = (kycUrl) => {
    window.open(kycUrl, '_blank');
    setKycUrlClicked(true);
    startKYCStatusPolling();
  };

  const handleCompleteESign = async () => {
    // First get the eSign form URL
    try {
      const transactionId = lumpsumResponse?.transactionId;
      const response = await fetch(`https://preprod.wyable.in/api/ondc/esign/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('E-Sign URL Response:', data);
        
        if (data.success && data.data?.formStatuses?.[0]?.formUrl) {
          const eSignUrl = data.data.formStatuses[0].formUrl;
          setESignData(data.data);
          window.open(eSignUrl, '_blank');
          setESignUrlClicked(true);
          startESignStatusPolling();
        } else {
          setErrors({ api: 'E-Sign form not available. Please try again.' });
        }
      } else {
        setErrors({ api: 'Failed to get E-Sign form. Please try again.' });
      }
    } catch (error) {
      console.error('E-Sign URL Error:', error);
      setErrors({ api: 'Failed to get E-Sign form. Please try again.' });
    }
  };

  // Updated handleGetPaymentMethods function with better validation and debugging
  const handleGetPaymentMethods = async () => {
    try {
      setLoading(true);
      const transactionId = lumpsumResponse?.transactionId;
      const maxAttempts = 60;
      const pollInterval = 2000; // 2 seconds between attempts
      let attempts = 0;
      let paymentMethodsFound = false;

      console.log('Starting payment methods polling for transaction:', transactionId);

      const pollForPaymentMethods = async () => {
        while (attempts < maxAttempts && !paymentMethodsFound) {
          attempts++;
          console.log(`Polling attempt ${attempts}/${maxAttempts}`);

          try {
            const response = await fetch(`https://preprod.wyable.in/api/ondc/getnewfoliyostatus/${transactionId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });

            if (response.ok) {
              const data = await response.json();
              console.log(`Payment Methods Response (Attempt ${attempts}):`, data);
              
              // Much more flexible check for payment methods
              if (data.success && 
                  data.data?.paymentMethods && 
                  Array.isArray(data.data.paymentMethods) && 
                  data.data.paymentMethods.length > 0) {
                
                console.log('Found payment methods array with length:', data.data.paymentMethods.length);
                console.log('Payment methods:', data.data.paymentMethods);
                
                // Just check if we have any objects in the array
                const validPaymentMethods = data.data.paymentMethods.filter(pm => 
                  pm && typeof pm === 'object'
                );

                console.log('Valid payment methods after filtering:', validPaymentMethods.length);

                if (validPaymentMethods.length > 0) {
                  console.log(`Payment methods found after ${attempts} attempts`);
                  setPaymentMethodsData({
                    transactionId: data.data.transactionId,
                    paymentMethods: data.data.paymentMethods // Use all payment methods
                  });
                  setCurrentStep('payment');
                  paymentMethodsFound = true;
                  return; // Exit the polling loop
                }
              }
              
              // Log more details for debugging
              console.log('Payment methods check failed:');
              console.log('- data.success:', data.success);
              console.log('- data.data exists:', !!data.data);
              console.log('- paymentMethods exists:', !!(data.data && data.data.paymentMethods));
              console.log('- paymentMethods is array:', Array.isArray(data.data?.paymentMethods));
              console.log('- paymentMethods length:', data.data?.paymentMethods?.length);
              console.log('- Raw paymentMethods:', data.data?.paymentMethods);
              
              // If we haven't found payment methods yet and haven't reached max attempts
              if (attempts < maxAttempts) {
                console.log(`No payment methods found yet. Waiting ${pollInterval/1000} seconds before next attempt...`);
                await new Promise(resolve => setTimeout(resolve, pollInterval));
              }
              
            } else {
              console.error(`API request failed (Attempt ${attempts}):`, response.status, response.statusText);
              
              // If it's not the last attempt, continue polling
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, pollInterval));
              }
            }
          } catch (fetchError) {
            console.error(`Fetch error (Attempt ${attempts}):`, fetchError);
            
            // If it's not the last attempt, continue polling
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
          }
        }

        // If we've exhausted all attempts without finding payment methods
        if (!paymentMethodsFound) {
          if (attempts >= maxAttempts) {
            setErrors({ api: `Payment methods not available after ${maxAttempts} attempts. Please try again later.` });
          } else {
            setErrors({ api: 'Failed to get payment methods. Please try again.' });
          }
        }
      };

      await pollForPaymentMethods();

    } catch (error) {
      console.error('Payment Methods Error:', error);
      setErrors({ api: 'Failed to get payment methods. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // KYC Status Polling
  const startKYCStatusPolling = () => {
    setKycStatusLoading(true);
    setKycStatusAttempts(0);
    pollKYCStatus();
  };

  const pollKYCStatus = async (attemptNumber = 1) => {
    if (attemptNumber > 30) {
      setKycStatusLoading(false);
      setErrors({ api: 'KYC status check timeout after 30 attempts. Please check manually.' });
      return;
    }

    setKycStatusAttempts(attemptNumber);

    try {
      const transactionId = lumpsumResponse?.transactionId;
      const response = await fetch(`https://preprod.wyable.in/api/ondc/getnewfoliyostatus/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`KYC Status Check (Attempt ${attemptNumber}):`, data);
        
        if (data.success && data.data?.status === 'FORM_SUBMITTED') {
          setKycStatusLoading(false);
          setKycData(prev => ({ ...prev, ...data.data.kycDetails }));
          setCurrentKYCStep('esign');
          return;
        }
        
        setTimeout(() => {
          pollKYCStatus(attemptNumber + 1);
        }, 5000);
        
      } else {
        setTimeout(() => {
          pollKYCStatus(attemptNumber + 1);
        }, 5000);
      }
    } catch (error) {
      console.error(`KYC status check error (Attempt ${attemptNumber}):`, error);
      setTimeout(() => {
        pollKYCStatus(attemptNumber + 1);
      }, 5000);
    }
  };

  // E-Sign Status Polling
  const startESignStatusPolling = () => {
    setESignStatusLoading(true);
    setESignStatusAttempts(0);
    pollESignStatus();
  };

  const pollESignStatus = async (attemptNumber = 1) => {
    if (attemptNumber > 30) {
      setESignStatusLoading(false);
      setErrors({ api: 'E-Sign status check timeout after 30 attempts. Please check manually.' });
      return;
    }

    setESignStatusAttempts(attemptNumber);

    try {
      const transactionId = lumpsumResponse?.transactionId;
      const response = await fetch(`https://preprod.wyable.in/api/ondc/esign/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`E-Sign Status Check (Attempt ${attemptNumber}):`, data);
        
        if (data.success && data.data?.formStatuses?.[0]?.status === 'ESIGN_SUBMITTED') {
          setESignStatusLoading(false);
          setESignData(data.data);
          setCurrentKYCStep('payment_methods');
          return;
        }
        
        setTimeout(() => {
          pollESignStatus(attemptNumber + 1);
        }, 5000);
        
      } else {
        setTimeout(() => {
          pollESignStatus(attemptNumber + 1);
        }, 5000);
      }
    } catch (error) {
      console.error(`E-Sign status check error (Attempt ${attemptNumber}):`, error);
      setTimeout(() => {
        pollESignStatus(attemptNumber + 1);
      }, 5000);
    }
  };

  // Handle completion modal close and call parent callback
  const handleCompletionClose = () => {
    setShowCompletionModal(false);
    if (onFolioSelection) {
      onFolioSelection({
        ...lumpsumResponse,
        folioCreated: true,
        paymentInitiated: true,
        paymentResponse: paymentResponse,
        paymentStatusResponse: paymentStatusResponse,
        finalStatus: 'PAID'
      }, 'new');
    }
  };

  // Step 1: Handle Lumpsum Form Submission
  const handleLumpsumSubmit = async (formData) => {
    setLoading(true);
    setErrors({});

    try {
      const requestBody = {
        type: "LUMPSUM",
        userId: "68a2d84c3914abc028413cf0",
        transactionId: transactionData.transactionId,
        providerId: transactionData.providerId,
        itemId: transactionData.itemId,
        fulfillmentId: transactionData.fulfillmentId,
        lumpsum: {
          value: parseInt(formData.amount)
        },
        distributor: {
          arn: "ARN-123456",
          euin: "E12345"
        },
        customer: {
          pan: clientData.pan
        }
      };

      console.log('Lumpsum API Request:', requestBody);

      const response = await fetch('https://viable-money-be.onrender.com/api/transaction/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Lumpsum API Response:', data);
        setLumpsumResponse(data.data);
        
        // Check if it's a new folio scenario, existing folio scenario, or both
        if (data.data.type === 'LUMPSUM_NEW' || (data.data.existingFolios && data.data.existingFolios.length === 0)) {
          // Only new folio available
          setCurrentStep('folio');
        } else if (data.data.type === 'LUMPSUM_NEW&EXISTING' || data.data.folioStatus === 'NEW_AND_EXISTING') {
          // Both new and existing folios available
          setCurrentStep('folio');
        } else if (data.data.existingFolios && data.data.existingFolios.length > 0) {
          // Only existing folios available
          setCurrentStep('folio');
        } else {
          // Handle other scenarios - call parent callback
          if (onFolioSelection) {
            onFolioSelection(data.data, 'existing');
          }
        }
      } else {
        throw new Error(data.message || 'Failed to submit lumpsum investment');
      }
      
    } catch (error) {
      console.error('Lumpsum API Error:', error);
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
      const requestBody = {
        transactionId: lumpsumResponse.transactionId,
        formUrl: lumpsumResponse.newFolio.formUrl,
        formId: lumpsumResponse.newFolio.formId
      };

      console.log('Folio API Request:', requestBody);

      const response = await fetch('https://viable-money-be.onrender.com/api/transaction/newfolio-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Folio API Response:', data);
        
        // Check for KYC requirement
        if (data.data && data.data.status === 'KYC_PENDING') {
          setKycData(data.data.kycDetails);
          setCurrentKYCStep('kyc');
          setCurrentStep('kyc');
        } else if (data.data && data.data.status === 'PAYMENT_SELECTION_AVAILABLE' && data.data.paymentMethods) {
          setPaymentMethodsData(data.data);
          setCurrentStep('payment');
        } else {
          if (onFolioSelection) {
            onFolioSelection({ ...lumpsumResponse, folioCreated: true }, 'new');
          }
        }
      } else {
        throw new Error(data.message || 'Failed to create new folio');
      }
      
    } catch (error) {
      console.error('Folio API Error:', error);
      setErrors({ api: 'Failed to create new folio. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2B: Handle Existing Folio Selection
  const handleExistingFolioSelection = (folio) => {
    setSelectedExistingFolio(folio);
    
    // If we have payment methods in the original response, use them
    if (lumpsumResponse?.paymentMethods && lumpsumResponse.paymentMethods.length > 0) {
      setPaymentMethodsData({
        transactionId: lumpsumResponse.transactionId,
        paymentMethods: lumpsumResponse.paymentMethods
      });
      setCurrentStep('payment');
    } else {
      // Otherwise try to get payment methods (might need different API call)
      setErrors({ api: 'Payment methods not available for existing folio. Please try again.' });
    }
  };

  // Step 3: Handle Payment Method Selection
  const handlePaymentMethodSelect = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  // Step 4: Handle Payment Initiation
  const handlePaymentInitiation = async () => {
    if (!selectedPaymentMethod || !paymentMethodsData) return;

    setLoading(true);
    setErrors({});

    try {
      // Determine folio number: use selected existing folio or hardcoded for new folio
      const folioNumber = selectedExistingFolio 
        ? selectedExistingFolio.folioNumber 
        : "4562132132/45"; // Hardcoded for new folio creation

      const requestBody = {
        transactionId: paymentMethodsData.transactionId,
        folioNumber: folioNumber,
        paymentIp: "192.168.1.100",
        phoneNumber: "9876543210",
        amount: parseInt(lumpsumResponse?.lumpsum?.value || 1000),
        ifsc: "ICIC0001234",
        accountNumber: "123456789012",
        accountHolderName: "Satish K Perala",
        paymentMethod: {
          mode: selectedPaymentMethod.methods?.[0]?.mode || selectedPaymentMethod.availableMethods?.[0]?.mode,
          auth: selectedPaymentMethod.methods?.[0]?.auth || selectedPaymentMethod.availableMethods?.[0]?.auth,
          mandateLimit: selectedPaymentMethod.methods?.[0]?.mandate_limit || selectedPaymentMethod.availableMethods?.[0]?.mandateLimit || 50000,
          mandateIdentifier: selectedPaymentMethod.methods?.[0]?.mandateIdentifier || selectedPaymentMethod.availableMethods?.[0]?.mandateIdentifier || 6
        }
      };

      console.log('Payment API Request:', requestBody);

      const response = await fetch('https://viable-money-be.onrender.com/api/transaction/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Payment API Response:', data);
        setPaymentResponse(data);
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
      
    } catch (error) {
      console.error('Payment API Error:', error);
      setErrors({ api: 'Failed to initiate payment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
              <h1 className="text-xl font-semibold text-gray-900">{fundData?.name}</h1>
              <p className="text-sm text-gray-600">
                Growth • {fundData?.category || 'Mixed'} • Multi Cap
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
          {/* Full Popup Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentStep === 'form' ? 'Processing Investment...' :
                   currentStep === 'folio' ? 'Creating Folio...' :
                   currentStep === 'kyc' ? 'Processing KYC...' :
                   'Processing Payment...'}
                </h3>
                <p className="text-gray-600">
                  {currentStep === 'form' ? 'Please wait while we process your lumpsum investment' :
                   currentStep === 'folio' ? 'Please wait while we create your investment folio' :
                   currentStep === 'kyc' ? 'Please wait while we process your KYC verification' :
                   'Please wait while we process your payment details'}
                </p>
                <div className="flex justify-center mt-4 space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
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
            {currentStep === 'form' && (
              <LumpsumFormComponent
                fundData={fundData}
                onSubmit={handleLumpsumSubmit}
                loading={loading}
                errors={errors}
              />
            )}

            {currentStep === 'folio' && (
              <FolioSelectionComponent
                lumpsumResponse={lumpsumResponse}
                onCreateFolio={handleFolioCreation}
                onSelectExistingFolio={handleExistingFolioSelection}
                loading={loading}
                errors={errors}
              />
            )}

            {currentStep === 'kyc' && (
              <KYCComponent
                kycData={kycData}
                onCompleteKYC={handleCompleteKYC}
                onCompleteESign={handleCompleteESign}
                onGetPaymentMethods={handleGetPaymentMethods}
                kycUrlClicked={kycUrlClicked}
                eSignUrlClicked={eSignUrlClicked}
                kycStatusLoading={kycStatusLoading}
                eSignStatusLoading={eSignStatusLoading}
                kycStatusAttempts={kycStatusAttempts}
                eSignStatusAttempts={eSignStatusAttempts}
                currentKYCStep={currentKYCStep}
                errors={errors}
              />
            )}

            {currentStep === 'payment' && (
              <PaymentInitiationComponent
                paymentMethodsData={paymentMethodsData}
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodSelect={handlePaymentMethodSelect}
                onInitiatePayment={handlePaymentInitiation}
                loading={loading}
                paymentResponse={paymentResponse}
                onPaymentUrlClick={handlePaymentUrlClick}
                paymentUrlClicked={paymentUrlClicked}
                paymentStatusLoading={paymentStatusLoading}
                statusCheckAttempts={statusCheckAttempts}
                errors={errors}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Investment Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                Your lumpsum investment has been successfully completed and payment is confirmed.
              </p>
              
              {/* Investment Summary */}
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 text-left">
                <h4 className="font-semibold text-green-900 mb-3">Investment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Fund:</span>
                    <span className="font-medium text-green-900">{fundData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Investment Type:</span>
                    <span className="font-medium text-green-900">Lumpsum</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Payment Status:</span>
                    <span className="font-medium text-green-900">PAID</span>
                  </div>
                </div>
              </div>
              
              {/* Payment Status */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Payment Status: PAID</span>
                </div>
                {paymentStatusResponse?.data?.mandateIdentifier && (
                  <p className="text-sm text-blue-700 mt-2">
                    Mandate ID: {paymentStatusResponse.data.mandateIdentifier}
                  </p>
                )}
              </div>
              
              {/* Action Button */}
              <Button
                onClick={handleCompletionClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
              >
                Continue to Dashboard
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">
                You will receive a confirmation email with all the details shortly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LumpsumTransaction;