'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, ChevronLeft, Home } from 'lucide-react';
import useAuthStore from '@/store/auth';

// Import step components
import BasicInfoStep from '../../../components/onboarding/BasicInfoStep';
import AddressInfoStep from '../../../components/onboarding/AddressInfoStep';
import BankInfoStep from '../../../components/onboarding/BankInfoStep';
import NominationStep from '../../../components/onboarding/NominationStep';
import SignatureStep from '../../../components/onboarding/SignatureStep';

// Mobile Stepper Component
const MobileStepper = ({ currentStep, maxSteps, steps }) => {
  return (
    <div className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-5">
        {/* Step Indicators Row */}
        <div className="flex items-center justify-center space-x-3 mb-5">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isAccessible = step.number <= maxSteps;
            
            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                        : isCurrent 
                          ? 'bg-blue-400 text-white shadow-lg shadow-blue-400/25 ring-4 ring-blue-100' 
                          : isAccessible 
                            ? 'bg-gray-200 text-gray-600' 
                            : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 min-w-4 max-w-8 transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {maxSteps}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-blue-400">
              {Math.round((currentStep / maxSteps) * 100)}%
            </span>
            <span className="text-xs text-gray-500">Complete</span>
          </div>
        </div>


        {/* Current Step Info with Enhanced Styling */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {steps.find(step => step.number === currentStep)?.title}
          </h3>
          <p className="text-sm text-gray-600 font-medium">
            {steps.find(step => step.number === currentStep)?.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

// Desktop Horizontal Stepper Component
const DesktopStepper = ({ currentStep, maxSteps, steps }) => {
  return (
    <div className="hidden lg:block w-full border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isAccessible = step.number <= maxSteps;
            
            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                          ? 'bg-blue-400 text-white' 
                          : isAccessible 
                            ? 'bg-gray-200 text-gray-600' 
                            : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-400' : isCompleted ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.subtitle}</p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Mobile Header Component
const MobileHeader = ({ onReturnHome }) => {
  return (
    <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={onReturnHome}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        
        <div className="flex items-center">
          <img src="/logo.png" alt="InvestFund Logo" className="h-8 object-contain" />
        </div>
        
        <button
          onClick={onReturnHome}
          className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Home className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

// Desktop Header Component
const DesktopHeader = ({ onReturnHome }) => {
  return (
    <div className="hidden lg:block bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/logo.png" alt="InvestFund Logo" className="h-12 object-contain" />
        </div>
        <Button 
          onClick={onReturnHome}
          variant="outline"
          className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Button>
      </div>
    </div>
  );
};

const InvestorOnboarding = () => {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.ID;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [maxSteps, setMaxSteps] = useState(4);
  const [needsSignature, setNeedsSignature] = useState(false);
  const [kycVerificationStatus, setKycVerificationStatus] = useState(null);
  const [bankVerificationStatus, setBankVerificationStatus] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  const updateOnboardingStatus = useAuthStore(state => state.updateOnboardingStatus);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://viable-money-be.onrender.com';

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1 - Basic Information
    name: '',
    pan: '',
    dob: '',
    gender: '',
    fatherName: '',
    motherName: '',
    maritalStatus: '',
    spouseName: '',
    occupation: '',
    sourceOfWealth: '',
    incomeRange: '',
    countryOfBirth: 'in',
    placeOfBirth: '',
    politicalExposure: 'no_exposure',
    nationality: 'in',
    citizenships: ['in'],
    indiaTaxResidencyStatus: 'resident',
    
    // Step 2 - Address Information
    communicationAddress: {
      line: '',
      city: '',
      state: '',
      pincode: '',
      country: 'in',
      nature: 'residential'
    },
    phone: {
      number: '',
      belongsTo: 'self'
    },
    email: {
      address: '',
      belongsTo: 'self'
    },
    
    // Step 3 - Bank & Tax Information
    bankAccount: {
      number: '',
      primaryHolderName: '',
      ifscCode: '',
      type: 'savings'
    },
    taxResidencies: [],
    
    // Step 4 - Nomination Information
    skipNomination: 'no',
    displaySetting: 'show_all_nominee_names',
    nominees: [{
      name: '',
      relationship: '',
      dob: '',
      idType: 'pan',
      idNumber: '',
      phone: '',
      email: '',
      address: {
        line: '',
        pincode: '',
        country: 'IN'
      },
      allocationPercentage: 100
    }],

    // Step 5 - Signature (conditional)
    signatureFile: null,
    aadhaarLastFour: '',
    geolocation: null
  });

  // Steps configuration - dynamically include step 5 if needed
  const steps = React.useMemo(() => {
    const baseSteps = [
      { number: 1, title: 'Basic Information', subtitle: 'Personal details' },
      { number: 2, title: 'Address & Contact', subtitle: 'Communication info' },
      { number: 3, title: 'Bank & Tax Details', subtitle: 'Financial info' },
      { number: 4, title: 'Nomination', subtitle: 'Beneficiary details' }
    ];

    // Add signature step if needed
    if (needsSignature) {
      baseSteps.push({ number: 5, title: 'Signature & Verification', subtitle: 'Complete verification' });
    }

    return baseSteps;
  }, [needsSignature]);

  // Check application status on load
  const checkApplicationStatus = useCallback(async () => {
    if (!transactionId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/onboarding/status/${transactionId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const { currentStep: apiStep, status, kycStatus, bankVerificationStatus, basicInfo } = result.data;
          
          console.log('Initial status check:', { status, kycStatus, bankVerificationStatus });
          
          setKycVerificationStatus(kycStatus === 'verified' ? true : kycStatus === 'no_kyc' ? false : null);
          setBankVerificationStatus(bankVerificationStatus === 'verified' ? true : bankVerificationStatus === 'failed' ? false : null);
          
          // Check if signature step is needed
          const signatureNeeded = kycStatus === 'no_kyc' || 
                                 status === 'signature_pending' || 
                                 bankVerificationStatus === 'failed';
          
          if (signatureNeeded) {
            console.log('Setting needsSignature=true and maxSteps=5 due to:', { kycStatus, status, bankVerificationStatus });
            setNeedsSignature(true);
            // maxSteps will be updated by the useEffect
          }
          
          if (basicInfo) {
            setFormData(prev => ({ ...prev, ...basicInfo, spouseName: basicInfo.spouseName || '' }));
          }
          
          let stepToShow = 1;
          switch (status) {
            case 'step1_completed': stepToShow = 2; break;
            case 'step2_completed': stepToShow = 3; break;
            case 'step3_completed': stepToShow = 4; break;
            case 'signature_pending': stepToShow = 5; break;
            case 'completed': router.push('/dashboard'); return;
            default: stepToShow = apiStep || 1;
          }
          
          console.log('Setting currentStep to:', stepToShow);
          setCurrentStep(stepToShow);
        }
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    } finally {
      setInitialDataLoaded(true);
    }
  }, [transactionId, router, needsSignature]);

  // Update maxSteps whenever needsSignature changes
  useEffect(() => {
    if (needsSignature) {
      console.log('Signature needed - updating maxSteps to 5');
      setMaxSteps(5);
    } else {
      console.log('No signature needed - maxSteps remains 4');
      setMaxSteps(4);
    }
  }, [needsSignature]);

  useEffect(() => {
    if (transactionId && !initialDataLoaded) {
      checkApplicationStatus();
    }
  }, [transactionId, checkApplicationStatus, initialDataLoaded]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, maxSteps));
  }, [maxSteps]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleStepComplete = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    handleNext();
  };

  const handleFinalComplete = () => {
    updateOnboardingStatus(true);
    router.push('/dashboard');
  };

  // Show loading while checking initial status
  if (!initialDataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your application...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    const commonProps = {
      formData,
      setFormData,
      transactionId,
      onNext: handleNext,
      onPrevious: handlePrevious,
      onComplete: handleStepComplete,
      onFinalComplete: handleFinalComplete,
      setKycVerificationStatus: (status) => {
        console.log('KYC verification status updated to:', status);
        setKycVerificationStatus(status);
        // If KYC fails, ensure signature step is enabled
        if (status === false) {
          console.log('KYC failed - enabling signature step');
          setNeedsSignature(true);
        }
      },
      setBankVerificationStatus: (status) => {
        console.log('Bank verification status updated to:', status);
        setBankVerificationStatus(status);
        // If bank verification fails, ensure signature step is enabled
        if (status === false) {
          console.log('Bank verification failed - enabling signature step');
          setNeedsSignature(true);
        }
      },
      setNeedsSignature,
      setMaxSteps,
      needsSignature,
      kycVerificationStatus,
      bankVerificationStatus
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...commonProps} />;
      case 2:
        return <AddressInfoStep {...commonProps} />;
      case 3:
        return <BankInfoStep {...commonProps} />;
      case 4:
        return <NominationStep {...commonProps} />;
      case 5:
        return <SignatureStep {...commonProps} />;
      default:
        return <BasicInfoStep {...commonProps} />;
    }
  };

  const getCurrentStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Your basic information';
      case 2: return 'Address & contact details';
      case 3: return 'Bank & tax information';
      case 4: return 'Nomination information';
      case 5: return 'Complete verification';
      default: return 'Your information';
    }
  };

  const getCurrentStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Please provide your personal details to get started';
      case 2: return 'Add your address and contact information';
      case 3: return 'Enter your banking and tax details';
      case 4: return 'Set up your nomination preferences';
      case 5: return 'Complete your verification process';
      default: return 'Please provide the required information to continue';
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Headers */}
      <MobileHeader onReturnHome={handleReturnHome} />
      <DesktopHeader onReturnHome={handleReturnHome} />

      {/* Steppers */}
      <MobileStepper 
        currentStep={currentStep}
        maxSteps={maxSteps}
        steps={steps}
      />
      <DesktopStepper 
        currentStep={currentStep}
        maxSteps={maxSteps}
        steps={steps}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
        {/* Title Section - Hidden on mobile (shown in mobile stepper) */}
        <div className="hidden lg:block mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {getCurrentStepTitle()}
          </h2>
          <p className="text-gray-600">
            {getCurrentStepDescription()}
          </p>
        </div>

        {/* Mobile Title Section - Hidden to maximize screen space */}

        {/* Form Content */}
        <div className="lg:bg-white lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-200 p-0 lg:p-8 mb-4 lg:mb-0">
          {renderStepContent()}
        </div>

        {/* Verification Status */}
        {(kycVerificationStatus !== null || bankVerificationStatus !== null) && (
          <div className="mt-4 lg:mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Verification Status</h3>
            <div className="space-y-2">
              {kycVerificationStatus !== null && (
                <div className="flex items-center">
                  {kycVerificationStatus ? (
                    <span className="text-green-600 text-sm flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      KYC Verified
                    </span>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-amber-700 text-sm">KYC: Manual verification needed</span>
                    </div>
                  )}
                </div>
              )}
              {bankVerificationStatus !== null && (
                <div className="flex items-center">
                  {bankVerificationStatus ? (
                    <span className="text-green-600 text-sm flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      Bank Verified
                    </span>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-amber-700 text-sm">Bank: Manual verification needed</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Safe Area Bottom Spacing */}
        <div className="lg:hidden h-8"></div>
      </div>
    </div>
  );
};

export default InvestorOnboarding;