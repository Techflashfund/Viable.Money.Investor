import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  User,
  FileText,
  TrendingUp,
  X
} from 'lucide-react';

const SIPTransaction = ({ 
  clientData, 
  fundData, 
  transactionData, 
  onBack, 
  onFolioSelection,
  isOpen = true 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    installments: '',
    date: '',
    frequency: 'MONTHLY'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newFolioLoading, setNewFolioLoading] = useState(false);
  const [paymentInitiateLoading, setPaymentInitiateLoading] = useState(false);
  const [sipResponse, setSipResponse] = useState(null);
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

  // Handle modal close
  const handleModalClose = () => {
    if (onBack) {
      onBack();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleModalClose();
    }
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
      const transactionId = paymentResponse?.data?.transactionId || sipResponse?.transactionId;
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

  // Get SIP constraints from fund data
  const getSIPConstraints = () => {
    if (!fundData?.fulfillments) return null;
    
    const sipFulfillment = fundData.fulfillments.find(f => 
      f.type === 'SIP' && f.id.includes('MONTH')
    );
    
    if (!sipFulfillment?.thresholds) return null;
    
    return {
      minAmount: parseInt(sipFulfillment.thresholds.AMOUNT_MIN || '0'),
      maxAmount: parseInt(sipFulfillment.thresholds.AMOUNT_MAX || '0'),
      minInstallments: parseInt(sipFulfillment.thresholds.INSTALMENTS_COUNT_MIN || '0'),
      maxInstallments: parseInt(sipFulfillment.thresholds.INSTALMENTS_COUNT_MAX || '0'),
      cumulativeMinAmount: parseInt(sipFulfillment.thresholds.CUMULATIVE_AMOUNT_MIN || '0'),
      frequencyDates: sipFulfillment.thresholds.FREQUENCY_DATES?.split(',') || []
    };
  };

  const constraints = getSIPConstraints();

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
      }
    }
    
    if (!formData.installments || formData.installments <= 0) {
      newErrors.installments = 'Please enter number of installments';
    } else if (constraints) {
      if (formData.installments < constraints.minInstallments) {
        newErrors.installments = `Minimum ${constraints.minInstallments} installments`;
      } else if (formData.installments > constraints.maxInstallments) {
        newErrors.installments = `Maximum ${constraints.maxInstallments} installments`;
      }
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select SIP date';
    }

    // Check cumulative amount
    if (constraints && formData.amount && formData.installments) {
      const totalAmount = formData.amount * formData.installments;
      if (totalAmount < constraints.cumulativeMinAmount) {
        newErrors.cumulative = `Total investment (₹${totalAmount}) should be at least ₹${constraints.cumulativeMinAmount}`;
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

  // Generate full date from selected day
  const generateFullDate = (selectedDay) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-based month
    
    // Create date with current year, current month, and selected day
    const fullDate = new Date(currentYear, currentMonth, parseInt(selectedDay));
    
    // If the selected date has already passed this month, move to next month
    if (fullDate < currentDate) {
      fullDate.setMonth(currentMonth + 1);
    }
    
    // Format as YYYY-MM-DD
    return fullDate.toISOString().split('T')[0];
  };

  // Handle SIP submission
  const handleSubmitSIP = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Generate full date from selected day
      const fullSipDate = generateFullDate(formData.date);
      
      const requestBody = {
        type: "SIP",
        transactionId: transactionData.transactionId,
        providerId: transactionData.providerId,
        itemId: transactionData.itemId,
        fulfillmentId: transactionData.fulfillmentId,
        sip: {
          value: parseInt(formData.amount),
          repeat: parseInt(formData.installments),
          date: fullSipDate,
          frequency: formData.frequency
        },
        distributor: {
          arn: "ARN-123456",
          euin: "E12345"
        },
        customer: {
          pan: clientData.pan
        }
      };

      console.log('Submitting SIP request:', requestBody);
      console.log('Selected day:', formData.date, '-> Full date:', fullSipDate);

      const response = await fetch('https://viable-money-be.onrender.com/api/transaction/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('SIP Response:', data);
        setSipResponse(data.data);
        
        // Check if it's a new folio scenario
        if (data.data.type === 'SIP_NEW' || (data.data.existingFolios && data.data.existingFolios.length === 0)) {
          setShowFolioSelection(true);
        } else {
          // Handle other scenarios - call parent callback
          if (onFolioSelection) {
            onFolioSelection(data.data, 'existing');
          }
        }
      } else {
        throw new Error(data.message || 'Failed to submit SIP');
      }
      
    } catch (error) {
      console.error('Error submitting SIP:', error);
      setErrors({ api: 'Failed to submit SIP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle new folio selection
  const handleNewFolioSelection = async () => {
    if (!sipResponse?.newFolio) return;

    setNewFolioLoading(true);
    setErrors({});

    try {
      const requestBody = {
        transactionId: sipResponse.transactionId,
        formUrl: sipResponse.newFolio.formUrl,
        formId: sipResponse.newFolio.formId
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
              ...sipResponse,
              folioCreated: true,
              sipDetails: {
                amount: formData.amount,
                installments: formData.installments,
                date: generateFullDate(formData.date),
                totalInvestment: getTotalInvestment()
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

  // Handle completion modal close and call parent callback
  const handleCompletionClose = () => {
    setShowCompletionModal(false);
    if (onFolioSelection) {
      onFolioSelection({
        ...sipResponse,
        folioCreated: true,
        paymentInitiated: true,
        paymentResponse: paymentResponse,
        paymentStatusResponse: paymentStatusResponse,
        finalStatus: 'PAID',
        sipDetails: {
          amount: formData.amount,
          installments: formData.installments,
          date: generateFullDate(formData.date),
          totalInvestment: getTotalInvestment()
        }
      }, 'new');
    }
  };

  // Calculate total investment
  const getTotalInvestment = () => {
    if (formData.amount && formData.installments) {
      return formData.amount * formData.installments;
    }
    return 0;
  };

  // Generate date options (1-28 of month)
  const getDateOptions = () => {
    if (constraints?.frequencyDates?.length > 0) {
      return constraints.frequencyDates.map(date => ({
        value: date,
        label: `${date}${getOrdinalSuffix(date)} of every month`
      }));
    }
    
    // Default 1-28
    return Array.from({ length: 28 }, (_, i) => {
      const date = i + 1;
      return {
        value: date.toString(),
        label: `${date}${getOrdinalSuffix(date)} of every month`
      };
    });
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4 "
        onClick={handleBackdropClick}
      >
        {/* Modal Container */}
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-blue-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Loading line animation */}
          {(loading || newFolioLoading || paymentInitiateLoading) && (
            <div className="absolute top-0 left-0 right-0 z-10 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                style={{
                  animation: 'loading-sweep 1.5s ease-in-out infinite'
                }}
              />
            </div>
          )}

          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 ">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Setup SIP</h1>
                <p className="text-sm text-gray-600">Systematic Investment Plan</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleModalClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
              {/* Progress Steps */}
              <div className="space-y-4 mb-6">
                {[
                  { number: 1, title: 'SIP Configuration', subtitle: 'Set amount & duration', active: !showFolioSelection && !showPaymentMethods && !showBankConfirmation },
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
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          isCompleted || isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            step.number
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-700'}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{step.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Client Summary */}
              <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-1">Selected Client:</p>
                <p className="text-sm text-gray-700">{clientData?.name}</p>
                <p className="text-xs text-gray-500 mt-1">{clientData?.pan}</p>
              </div>

              {/* Fund Summary */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Selected Fund:</p>
                <p className="text-sm text-blue-700">{fundData?.name}</p>
                <p className="text-xs text-blue-600 mt-1">by {fundData?.creator}</p>
                
                {constraints && (
                  <div className="mt-3 pt-3 border-t border-blue-200 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Min Amount:</span>
                      <span className="text-blue-900">₹{constraints.minAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Max Amount:</span>
                      <span className="text-blue-900">₹{constraints.maxAmount}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Investment Summary */}
              {formData.amount && formData.installments && formData.date && !showFolioSelection && !showPaymentMethods && !showBankConfirmation && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-3">Investment Summary:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Monthly:</span>
                      <span className="font-medium text-green-900">₹{formData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Duration:</span>
                      <span className="font-medium text-green-900">{formData.installments} months</span>
                    </div>
                    <div className="flex justify-between border-t border-green-200 pt-2">
                      <span className="text-green-700">Total:</span>
                      <span className="font-bold text-green-900">₹{getTotalInvestment().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {showBankConfirmation ? 'Bank Account Confirmation' :
                   showPaymentMethods ? 'Select Payment Method' :
                   showFolioSelection ? 'Folio Setup' : 'SIP Configuration'}
                </h2>
                <p className="text-gray-600">
                  {showBankConfirmation
                    ? 'Confirm your bank account details for payment processing'
                    : showPaymentMethods
                      ? 'Choose your preferred payment method for SIP'
                      : showFolioSelection
                        ? 'Create new folio for your investment'
                        : 'Configure your systematic investment plan'
                  }
                </p>
              </div>

              {/* Error Messages */}
              {(errors.api || errors.cumulative) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                    <p className="text-sm font-medium text-red-800">
                      {errors.api || errors.cumulative}
                    </p>
                  </div>
                </div>
              )}

              {/* Main Content Area */}
              <div className="space-y-6">
                {/* Folio Selection Screen */}
                {showFolioSelection && sipResponse && (
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
                          We couldn't find any existing folios for this fund. A new folio will be created for your SIP investment.
                        </p>
                      </div>

                      {/* SIP Summary */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-semibold text-blue-900 mb-4">SIP Investment Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-700 font-medium">Fund:</span>
                            <p className="text-blue-900">{sipResponse.itemDetails?.schemeName || fundData?.name}</p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Fund House:</span>
                            <p className="text-blue-900">{sipResponse.itemDetails?.fundHouse || fundData?.creator}</p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Monthly Amount:</span>
                            <p className="text-blue-900 font-semibold">₹{formData.amount}</p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Duration:</span>
                            <p className="text-blue-900">{formData.installments} months</p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Start Date:</span>
                            <p className="text-blue-900">{generateFullDate(formData.date)}</p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Total Investment:</span>
                            <p className="text-blue-900 font-bold">₹{getTotalInvestment().toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-center space-x-4">
                        <Button
                          onClick={handleNewFolioSelection}
                          disabled={newFolioLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {newFolioLoading ? (
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
                        
                        <Button
                          variant="outline"
                          onClick={() => setShowFolioSelection(false)}
                          disabled={newFolioLoading}
                        >
                          Back to SIP Details
                        </Button>
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
                          Please select your preferred payment method to proceed with SIP setup.
                        </p>
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
                              </div>
                            </div>
                          ))}
                        </div>
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
                          Please verify your bank account details before proceeding with payment setup.
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
                            <span className="text-green-700 font-medium">Monthly Amount:</span>
                            <p className="text-green-900 font-bold">₹{formData.amount}</p>
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
                                Click to complete your SIP payment in a new tab
                              </p>
                            </div>
                          )}

                          {/* Payment Status Checking */}
                          {paymentStatusLoading && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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

                      {/* Action Buttons */}
                      <div className="flex justify-center space-x-4">
                        <Button
                          onClick={handleInitiatePayment}
                          disabled={paymentInitiateLoading || paymentResponse}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {paymentInitiateLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Initiating Payment...
                            </>
                          ) : paymentResponse ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Payment Initiated
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm & Initiate Payment
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowBankConfirmation(false);
                            setShowPaymentMethods(true);
                            setSelectedPaymentMethod(null);
                          }}
                          disabled={paymentInitiateLoading}
                        >
                          Back to Payment Methods
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SIP Form */}
                {!showFolioSelection && !showPaymentMethods && !showBankConfirmation && (
                  <div className="bg-white rounded-lg border p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* SIP Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SIP Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          placeholder="Enter monthly SIP amount"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.amount ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                        {constraints && (
                          <p className="mt-1 text-sm text-gray-500">
                            Amount should be between ₹{constraints.minAmount} - ₹{constraints.maxAmount}
                          </p>
                        )}
                      </div>

                      {/* Number of Installments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Installments <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.installments}
                          onChange={(e) => handleInputChange('installments', e.target.value)}
                          placeholder="Enter number of months"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.installments ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.installments && <p className="mt-1 text-sm text-red-600">{errors.installments}</p>}
                        {constraints && (
                          <p className="mt-1 text-sm text-gray-500">
                            Between {constraints.minInstallments} - {constraints.maxInstallments} months
                          </p>
                        )}
                      </div>

                      {/* SIP Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SIP Date <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.date ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select SIP date</option>
                          {getDateOptions().map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                        <p className="mt-1 text-sm text-gray-500">
                          Choose the date for monthly SIP deduction
                        </p>
                      </div>

                      {/* Frequency (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frequency
                        </label>
                        <input
                          type="text"
                          value="Monthly"
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Currently only monthly SIP is supported
                        </p>
                      </div>
                    </div>

                    {/* Total Investment Display */}
                    {getTotalInvestment() > 0 && formData.date && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-blue-700 font-medium">Total Investment:</span>
                          <span className="text-2xl font-bold text-blue-900">
                            ₹{getTotalInvestment().toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-blue-600">
                            ₹{formData.amount} × {formData.installments} months
                          </p>
                          <p className="text-blue-600">
                            <strong>Start Date:</strong> {generateFullDate(formData.date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                      <Button
                        onClick={handleSubmitSIP}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Setting up SIP...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Setup SIP
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                SIP Setup Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                Your Systematic Investment Plan has been successfully set up and payment is confirmed.
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
                    <span className="text-green-700">Monthly Amount:</span>
                    <span className="font-medium text-green-900">₹{formData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Duration:</span>
                    <span className="font-medium text-green-900">{formData.installments} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Start Date:</span>
                    <span className="font-medium text-green-900">{generateFullDate(formData.date)}</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-2">
                    <span className="text-green-700">Total Investment:</span>
                    <span className="font-bold text-green-900">₹{getTotalInvestment().toLocaleString()}</span>
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
    </>
  );
};

export default SIPTransaction;