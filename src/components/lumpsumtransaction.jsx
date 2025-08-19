import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  User,
  FileText,
  TrendingUp
} from 'lucide-react';

const LumpsumTransaction = ({ 
  clientData, 
  fundData, 
  transactionData, 
  onBack, 
  onFolioSelection 
}) => {
  const [formData, setFormData] = useState({
    amount: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newFolioLoading, setNewFolioLoading] = useState(false);
  const [paymentInitiateLoading, setPaymentInitiateLoading] = useState(false);
  const [lumpsumResponse, setLumpsumResponse] = useState(null);
  const [showFolioSelection, setShowFolioSelection] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [paymentMethodsData, setPaymentMethodsData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showBankConfirmation, setShowBankConfirmation] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [paymentUrlClicked, setPaymentUrlClicked] = useState(false);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [paymentStatusResponse, setPaymentStatusResponse] = useState(null);
  const [statusCheckAttempts, setStatusCheckAttempts] = useState(0);
  const [finalPaymentStatus, setFinalPaymentStatus] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Hardcoded values for payment
  const PAYMENT_HARDCODED = {
    folioNumber: "4562132132/45",
    paymentIp: "192.168.1.100",
    phoneNumber: "9876543210",
    ifsc: "ICIC0001234",
    accountNumber: "123456789012",
    accountHolderName: "Satish K Perala"
  };

  // Handle payment URL click and start status polling
  const handlePaymentUrlClick = (paymentUrl) => {
    // Open payment URL in new tab
    window.open(paymentUrl, '_blank');
    setPaymentUrlClicked(true);
    
    // Start polling payment status
    startPaymentStatusPolling();
  };

  // Start polling payment status
  const startPaymentStatusPolling = async () => {
    setPaymentStatusLoading(true);
    setStatusCheckAttempts(0);
    setFinalPaymentStatus(null);
    pollPaymentStatus();
  };

  // Poll payment status with retries - Updated to use new API
  const pollPaymentStatus = async (attemptNumber = 1) => {
    if (attemptNumber > 30) {
      setPaymentStatusLoading(false);
      setFinalPaymentStatus('TIMEOUT');
      setErrors({ api: 'Payment status check timeout after 30 attempts. Please check manually.' });
      return;
    }

    setStatusCheckAttempts(attemptNumber);

    try {
      // Updated API endpoint - using the new URL format
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
        
        // Check if payment is completed based on the new response format
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
        
        // If status is neither PAID nor NOT-PAID, continue polling
        setTimeout(() => {
          pollPaymentStatus(attemptNumber + 1);
        }, 5000); // 5 second delay
        
      } else {
        // Continue polling if not 200
        setTimeout(() => {
          pollPaymentStatus(attemptNumber + 1);
        }, 5000); // 5 second delay
      }
    } catch (error) {
      console.error(`Payment status check error (Attempt ${attemptNumber}):`, error);
      
      // Continue polling even on error
      setTimeout(() => {
        pollPaymentStatus(attemptNumber + 1);
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
        finalStatus: 'PAID',
        lumpsumDetails: {
          amount: formData.amount
        }
      }, 'new');
    }
  };

  // Get LUMPSUM constraints from fund data
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

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (constraints) {
      if (formData.amount < constraints.minAmount) {
        newErrors.amount = `Minimum amount is ₹${constraints.minAmount}`;
      } else if (formData.amount > constraints.maxAmount) {
        newErrors.amount = `Maximum amount is ₹${constraints.maxAmount}`;
      } else if (formData.amount % constraints.amountMultiples !== 0) {
        newErrors.amount = `Amount should be in multiples of ₹${constraints.amountMultiples}`;
      }
    }
    
    return newErrors;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors for the field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle LUMPSUM submission
  const handleSubmitLumpsum = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const requestBody = {
        type: "LUMPSUM",
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

      console.log('Submitting LUMPSUM request:', requestBody);

      const response = await fetch('https://viable-money-be.onrender.com/api/transaction/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('LUMPSUM Response:', data);
        setLumpsumResponse(data.data);
        
        // Check if it's a new folio scenario
        if (data.data.type === 'LUMPSUM_NEW' || data.data.type === 'SIP_NEW' || (data.data.existingFolios && data.data.existingFolios.length === 0)) {
          setShowFolioSelection(true);
        } else {
          // Handle other scenarios - call parent callback
          if (onFolioSelection) {
            onFolioSelection(data.data, 'existing');
          }
        }
      } else {
        throw new Error(data.message || 'Failed to submit LUMPSUM');
      }
      
    } catch (error) {
      console.error('Error submitting LUMPSUM:', error);
      setErrors({ api: 'Failed to submit LUMPSUM. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle new folio selection
  const handleNewFolioSelection = async () => {
    if (!lumpsumResponse?.newFolio) return;

    setNewFolioLoading(true);
    setErrors({});

    try {
      const requestBody = {
        transactionId: lumpsumResponse.transactionId,
        formUrl: lumpsumResponse.newFolio.formUrl,
        formId: lumpsumResponse.newFolio.formId
      };

      console.log('New Folio Selection Request:', requestBody);

      const response = await fetch('https://viable-money-be.onrender.com/api/transaction/newfolio-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('New Folio Selection Response:', data);
        
        // Check if we have payment methods available
        if (data.data && data.data.status === 'PAYMENT_SELECTION_AVAILABLE' && data.data.paymentMethods) {
          setPaymentMethodsData(data.data);
          setShowFolioSelection(false);
          setShowPaymentMethods(true);
        } else {
          // Call parent callback with success if no payment methods
          if (onFolioSelection) {
            onFolioSelection({
              ...lumpsumResponse,
              folioCreated: true,
              lumpsumDetails: {
                amount: formData.amount
              }
            }, 'new');
          }
        }
      } else {
        throw new Error(data.message || 'Failed to create new folio');
      }
      
    } catch (error) {
      console.error('Error creating new folio:', error);
      setErrors({ api: 'Failed to create new folio. Please try again.' });
    } finally {
      setNewFolioLoading(false);
    }
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setShowPaymentMethods(false);
    setShowBankConfirmation(true);
  };

  // Handle initiate payment
  const handleInitiatePayment = async () => {
    if (!selectedPaymentMethod || !paymentMethodsData) return;

    setPaymentInitiateLoading(true);
    setErrors({});

    try {
      const requestBody = {
        transactionId: paymentMethodsData.transactionId,
        folioNumber: PAYMENT_HARDCODED.folioNumber,
        paymentIp: PAYMENT_HARDCODED.paymentIp,
        phoneNumber: PAYMENT_HARDCODED.phoneNumber,
        amount: parseInt(formData.amount),
        ifsc: PAYMENT_HARDCODED.ifsc,
        accountNumber: PAYMENT_HARDCODED.accountNumber,
        accountHolderName: PAYMENT_HARDCODED.accountHolderName,
        paymentMethod: {
          mode: selectedPaymentMethod.methods[0]?.mode,
          auth: selectedPaymentMethod.methods[0]?.auth,
          mandateLimit: selectedPaymentMethod.methods[0]?.mandate_limit || 50000,
          mandateIdentifier: 6
        }
      };

      console.log('Initiating Payment Request:', requestBody);

      const response = await fetch('https://viable-money-be.onrender.com/api/transaction/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Payment Initiation Response:', data);
        setPaymentResponse(data);
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      setErrors({ api: 'Failed to initiate payment. Please try again.' });
    } finally {
      setPaymentInitiateLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Loading line animation */}
      {(loading || newFolioLoading || paymentInitiateLoading) && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            style={{
              animation: 'loading-sweep 1.5s ease-in-out infinite'
            }}
          />
        </div>
      )}

      {/* Left Sidebar */}
      <div className="w-80 bg-white shadow-sm border-r border-gray-200 p-6">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to fund selection
          </button>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-2">LUMPSUM Investment</h1>
          <p className="text-sm text-gray-500">One-time investment</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 mb-8">
          {[
            { number: 1, title: 'Investment Amount', subtitle: 'Set investment amount', active: !showFolioSelection && !showPaymentMethods && !showBankConfirmation },
            { number: 2, title: 'Folio Setup', subtitle: 'Create investment folio', active: showFolioSelection },
            { number: 3, title: 'Payment Method', subtitle: 'Choose payment option', active: showPaymentMethods },
            { number: 4, title: 'Bank Confirmation', subtitle: 'Confirm bank details', active: showBankConfirmation }
          ].map((step) => {
            const isCompleted = (step.number === 1 && (showFolioSelection || showPaymentMethods || showBankConfirmation)) || 
                              (step.number === 2 && (showPaymentMethods || showBankConfirmation)) ||
                              (step.number === 3 && showBankConfirmation);
            const isCurrent = step.active;
            
            return (
              <div key={step.number} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-all bg-blue-600 text-white">
                    {isCompleted ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      step.number
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-600">
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{step.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Client Summary */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{clientData?.name}</p>
              <p className="text-sm text-gray-600">{clientData?.pan}</p>
            </div>
          </div>
        </div>

        {/* Fund Summary */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-blue-900">{fundData?.name}</p>
              <p className="text-sm text-blue-700">by {fundData?.creator}</p>
            </div>
          </div>
          
          {constraints && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Min Amount:</span>
                <span className="font-medium text-blue-900">₹{constraints.minAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Max Amount:</span>
                <span className="font-medium text-blue-900">₹{constraints.maxAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Multiples:</span>
                <span className="font-medium text-blue-900">₹{constraints.amountMultiples}</span>
              </div>
            </div>
          )}
        </div>

        {/* Investment Summary */}
        {formData.amount && !showFolioSelection && !showPaymentMethods && !showBankConfirmation && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-3">Investment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-t border-green-200 pt-2">
                <span className="text-green-700">Investment Amount:</span>
                <span className="font-bold text-green-900">₹{parseInt(formData.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {showBankConfirmation ? 'Bank Account Confirmation' :
               showPaymentMethods ? 'Select Payment Method' :
               showFolioSelection ? 'Folio Setup' : 'LUMPSUM Investment Details'}
            </h2>
            <p className="text-gray-600">
              {showBankConfirmation
                ? 'Confirm your bank account details for payment processing'
                : showPaymentMethods
                  ? 'Choose your preferred payment method for investment'
                  : showFolioSelection
                    ? 'Create new folio for your investment'
                    : 'Enter your one-time investment amount'
              }
            </p>
          </div>

          {/* Error Messages */}
          {errors.api && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <p className="text-sm font-medium text-red-800">{errors.api}</p>
              </div>
            </div>
          )}

          {/* Folio Selection Screen */}
          {showFolioSelection && lumpsumResponse && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Existing Folio Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any existing folios for this fund. A new folio will be created for your LUMPSUM investment.
                  </p>
                </div>

                {/* Investment Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-4">LUMPSUM Investment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Fund:</span>
                      <p className="font-medium text-blue-900">{lumpsumResponse.itemDetails?.schemeName || fundData?.name}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Fund House:</span>
                      <p className="font-medium text-blue-900">{lumpsumResponse.itemDetails?.fundHouse || fundData?.creator}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Investment Type:</span>
                      <p className="font-medium text-blue-900">One-time LUMPSUM</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Investment Amount:</span>
                      <p className="font-bold text-blue-900">₹{parseInt(formData.amount).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* New Folio Information */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-green-900 mb-3">New Folio Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Folio Status:</span>
                      <span className="font-medium text-green-900">{lumpsumResponse.folioStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Transaction Type:</span>
                      <span className="font-medium text-green-900">{lumpsumResponse.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Form Required:</span>
                      <span className="font-medium text-green-900">
                        {lumpsumResponse.newFolio?.formRequired ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <button
                    onClick={handleNewFolioSelection}
                    disabled={newFolioLoading}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
                  >
                    {newFolioLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating New Folio...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Create New Folio</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowFolioSelection(false)}
                    disabled={newFolioLoading}
                    className="mt-3 text-gray-600 hover:text-gray-700 text-sm underline"
                  >
                    Back to Investment Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selection Screen */}
          {showPaymentMethods && paymentMethodsData && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Folio Created Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Please select your preferred payment method to proceed with investment.
                  </p>
                </div>

                {/* Investment Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">LUMPSUM Investment Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Investment Type:</span>
                      <p className="text-blue-900">One-time LUMPSUM</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Investment Amount:</span>
                      <p className="text-blue-900 font-bold">₹{parseInt(formData.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Fund:</span>
                      <p className="text-blue-900">{lumpsumResponse?.itemDetails?.schemeName || fundData?.name}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Fund House:</span>
                      <p className="text-blue-900">{lumpsumResponse?.itemDetails?.fundHouse || fundData?.creator}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Available Payment Methods</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethodsData.paymentMethods
                      .filter(method => method.methods && method.methods.length > 0)
                      .map((paymentMethod) => (
                      <div
                        key={paymentMethod.paymentId}
                        onClick={() => handlePaymentMethodSelect(paymentMethod)}
                        className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {paymentMethod.methods[0]?.mode?.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {paymentMethod.methods[0]?.auth}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Collected by: {paymentMethod.collectedBy}</p>
                          <p>Type: {paymentMethod.type.replace('_', ' ')}</p>
                          {paymentMethod.methods[0]?.mandate_limit && (
                            <p>Mandate Limit: ₹{paymentMethod.methods[0].mandate_limit}</p>
                          )}
                          {paymentMethod.methods[0]?.mandate_identifier && (
                            <p>Existing Mandate: {paymentMethod.methods[0].mandate_identifier}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Back Button */}
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPaymentMethods(false);
                      setShowFolioSelection(true);
                    }}
                  >
                    Back to Folio Setup
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bank Account Confirmation Screen */}
          {showBankConfirmation && selectedPaymentMethod && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Confirm Bank Account Details
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Please verify your bank account details before proceeding with payment.
                  </p>
                </div>

                {/* Selected Payment Method */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-green-900 mb-4">Selected Payment Method</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">Payment Mode:</span>
                      <p className="text-green-900">{selectedPaymentMethod.methods[0]?.mode?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">Authentication:</span>
                      <p className="text-green-900">{selectedPaymentMethod.methods[0]?.auth}</p>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">Investment Amount:</span>
                      <p className="text-green-900 font-bold">₹{parseInt(formData.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">Mandate Limit:</span>
                      <p className="text-green-900">₹{selectedPaymentMethod.methods[0]?.mandate_limit || 50000}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Bank Account Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Account Holder Name:</span>
                      <p className="text-blue-900">{PAYMENT_HARDCODED.accountHolderName}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Account Number:</span>
                      <p className="text-blue-900">{PAYMENT_HARDCODED.accountNumber}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">IFSC Code:</span>
                      <p className="text-blue-900">{PAYMENT_HARDCODED.ifsc}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Phone Number:</span>
                      <p className="text-blue-900">{PAYMENT_HARDCODED.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Response Display */}
                {paymentResponse && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-semibold text-green-900 mb-4">Payment Initiated Successfully!</h4>
                    
                    {/* Payment Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-green-700 font-medium">Order ID:</span>
                        <p className="text-green-900">{paymentResponse.data?.orderId}</p>
                      </div>
                      <div>
                        <span className="text-green-700 font-medium">Order Status:</span>
                        <p className="text-green-900">{paymentResponse.data?.orderStatus}</p>
                      </div>
                      <div>
                        <span className="text-green-700 font-medium">Transaction ID:</span>
                        <p className="text-green-900">{paymentResponse.data?.transactionId}</p>
                      </div>
                      <div>
                        <span className="text-green-700 font-medium">Created At:</span>
                        <p className="text-green-900">{new Date(paymentResponse.data?.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Payment URL Button */}
                    {paymentResponse.data?.paymentUrl && (
                      <div className="text-center mb-4">
                        <button
                          onClick={() => handlePaymentUrlClick(paymentResponse.data.paymentUrl)}
                          disabled={paymentUrlClicked}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2 mx-auto"
                        >
                          <span>{paymentUrlClicked ? 'Payment Link Opened' : 'Proceed to Payment'}</span>
                        </button>
                        <p className="text-xs text-green-700 mt-2">
                          Click to complete your LUMPSUM payment in a new tab
                        </p>
                      </div>
                    )}

                    {/* Payment Status Checking */}
                    {paymentStatusLoading && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center space-x-3">
                          <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                          <div className="text-center">
                            <p className="text-yellow-800 font-medium">Checking Payment Status...</p>
                            <p className="text-yellow-700 text-sm">
                              Attempt {statusCheckAttempts} of 30 (checking every 5 seconds)
                            </p>
                            <p className="text-yellow-600 text-xs mt-1">
                              Using: https://preprod.wyable.in/api/ondc/payment/status/
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Status Response */}
                    {paymentStatusResponse && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="text-blue-900 font-semibold mb-3">Payment Status Details:</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-blue-700 font-medium">Payment Status:</span>
                            <p className="text-blue-900">{paymentStatusResponse.data?.paymentStatus}</p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Order Status:</span>
                            <p className="text-blue-900">{paymentStatusResponse.data?.orderStatus}</p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Payment ID:</span>
                            <p className="text-blue-900">{paymentStatusResponse.data?.paymentId}</p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Mandate ID:</span>
                            <p className="text-blue-900">{paymentStatusResponse.data?.mandateIdentifier}</p>
                          </div>
                        </div>
                        <details className="mt-3">
                          <summary className="text-blue-900 font-medium cursor-pointer">View Full Response</summary>
                          <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40 mt-2">
                            {JSON.stringify(paymentStatusResponse, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleInitiatePayment}
                    disabled={paymentInitiateLoading || paymentResponse}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {paymentInitiateLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Initiating Payment...</span>
                      </>
                    ) : paymentResponse ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Payment Initiated</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Confirm & Initiate Payment</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowBankConfirmation(false);
                      setShowPaymentMethods(true);
                      setSelectedPaymentMethod(null);
                    }}
                    disabled={paymentInitiateLoading}
                    className="text-gray-600 hover:text-gray-700 font-medium py-3 px-8 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back to Payment Methods
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Investment Form */}
          {!showFolioSelection && !showPaymentMethods && !showBankConfirmation && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="Enter investment amount"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.amount ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                  {constraints && (
                    <p className="mt-1 text-sm text-gray-500">
                      Amount should be between ₹{constraints.minAmount} - ₹{constraints.maxAmount} 
                      {constraints.amountMultiples > 1 && ` in multiples of ₹${constraints.amountMultiples}`}
                    </p>
                  )}
                </div>

                {/* Investment Summary Display */}
                {formData.amount && parseInt(formData.amount) > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">Investment Amount:</span>
                      <span className="text-2xl font-bold text-blue-900">
                        ₹{parseInt(formData.amount).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      One-time LUMPSUM investment
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSubmitLumpsum}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Setting up Investment...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Invest Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                Your LUMPSUM investment has been successfully completed and payment is confirmed.
              </p>
              
              {/* Investment Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-green-900 mb-3">Investment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Fund:</span>
                    <span className="font-medium text-green-900">{fundData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Investment Type:</span>
                    <span className="font-medium text-green-900">LUMPSUM</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-2">
                    <span className="text-green-700">Investment Amount:</span>
                    <span className="font-bold text-green-900">₹{parseInt(formData.amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes loading-sweep {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LumpsumTransaction;