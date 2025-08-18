'use client';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import useAuthStore from '../../store/auth';

const InvestorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for PAN check
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [existingInvestor, setExistingInvestor] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  const { user, token, isAuthenticated, getAuthHeaders } = useAuthStore();

  // Hardcoded ARN for now
  const HARDCODED_ARN = 'ARN-12345';
const API_BASE_URL = 'https://viable-money-be.onrender.com';
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Step 0 - PAN Check
    pan_check: '',
    
    // Step 1 - Basic Information
    name: '',
    dob: '',
    pan: '',
    
    // Step 2 - Personal Details
    gender: '',
    father_name: '',
    mother_name: '',
    marital_status: '',
    spouse_name: '',
    occupation: '',
    source_of_wealth: '',
    income_range: '',
    cob: 'in',
    pob: '',
    nationality: 'in',
    citizenships: ['in'],
    aadhaar_number: '',
    
    // Step 3 - Location Details
    geo_latitude: '',
    geo_longitude: '',
    
    // Step 4 - Political Exposure & Tax Details
    political_exposure: 'no_exposure',
    india_tax_residency_status: 'resident',
    trc_country: [],
    trc_idtype: [],
    trc_idnumber: [],
    
    // Step 5 - Communication Details
    mode_of_holding: 'single',
    ca_line: '',
    ca_pincode: '',
    ca_country: 'in',
    ca_nature: 'residential',
    cp_number: '',
    cp_belongsto: 'self',
    ce_address: '',
    ce_belongsto: 'self',
    
    // Step 6 - Bank Details
    pba_number: '',
    pba_pname: '',
    pba_code: '',
    pba_type: 'savings',
    
    // Step 7 - Nominee Details
    nominee_name: [''],
    nominee_pan: [''],
    nominee_dob: [''],
    nominee_relationship: [''],
    nominee_guardian_name: [''],
    nominee_guardian_pan: [''],
    nominee_percentage: [100],
    
    // Step 8 - File Upload
    signature: null
  });

  // Check existing investor by PAN
  const checkExistingPAN = async (panNumber) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/investor/by-pan/${panNumber}`);
      
      if (response.status === 404) {
        // No existing investor, proceed with normal flow
        setFormData(prev => ({ ...prev, pan: panNumber }));
        setCurrentStep(1);
        setSuccessMessage('Starting new registration...');
        setTimeout(() => setSuccessMessage(''), 2000);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to check PAN');
      }
      
      const result = await response.json();
      
      if (result.success && result.data.investors.length > 0) {
        const investor = result.data.investors[0];
        setExistingInvestor(investor);
        setTransactionId(investor.transactionId);
        setCompletedSteps(investor.completedSteps || []);
        
        // Pre-fill known data
        setFormData(prev => ({
          ...prev,
          pan: panNumber,
          name: investor.name || ''
        }));
        
        // Jump to current step
        setCurrentStep(investor.currentStep);
        setSuccessMessage(`Continuing registration for ${investor.name}. Proceeding to step ${investor.currentStep}...`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        // No investor found, proceed with normal flow
        setFormData(prev => ({ ...prev, pan: panNumber }));
        setCurrentStep(1);
        setSuccessMessage('Starting new registration...');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (error) {
      console.error('Error checking PAN:', error);
      setErrors({ pan_check: 'Failed to verify PAN. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Validation patterns
  const patterns = {
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    phone: /^[6-9]\d{9}$/,
    ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    pincode: /^[1-9][0-9]{5}$/,
    aadhaar: /^\d{4}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  };

  // Enum options for dropdowns
  const options = {
    gender: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'transgender', label: 'Transgender' }
    ],
    marital_status: [
      { value: 'married', label: 'Married' },
      { value: 'unmarried', label: 'Unmarried' }
    ],
    occupation: [
      { value: 'business', label: 'Business' },
      { value: 'professional', label: 'Professional' },
      { value: 'self_employed', label: 'Self Employed' },
      { value: 'retired', label: 'Retired' },
      { value: 'housewife', label: 'Housewife' },
      { value: 'student', label: 'Student' },
      { value: 'public_sector_service', label: 'Public Sector Service' },
      { value: 'private_sector_service', label: 'Private Sector Service' },
      { value: 'government_service', label: 'Government Service' },
      { value: 'agriculture', label: 'Agriculture' },
      { value: 'doctor', label: 'Doctor' },
      { value: 'service', label: 'Service' },
      { value: 'others', label: 'Others' }
    ],
    source_of_wealth: [
      { value: 'salary', label: 'Salary' },
      { value: 'business', label: 'Business' },
      { value: 'gift', label: 'Gift' },
      { value: 'ancestral_property', label: 'Ancestral Property' },
      { value: 'rental_income', label: 'Rental Income' },
      { value: 'prize_money', label: 'Prize Money' },
      { value: 'royalty', label: 'Royalty' }
    ],
    income_range: [
      { value: 'upto_1lakh', label: 'Up to ₹1 Lakh' },
      { value: 'above_1lakh_upto_5lakh', label: '₹1 - 5 Lakh' },
      { value: 'above_5lakh_upto_10lakh', label: '₹5 - 10 Lakh' },
      { value: 'above_10lakh_upto_25lakh', label: '₹10 - 25 Lakh' },
      { value: 'above_25lakh_upto_1cr', label: '₹25 Lakh - 1 Crore' },
      { value: 'above_1cr', label: 'Above ₹1 Crore' }
    ],
    political_exposure: [
      { value: 'no_exposure', label: 'No Exposure' },
      { value: 'pep', label: 'Politically Exposed Person' },
      { value: 'related_pep', label: 'Related to PEP' }
    ],
    ca_nature: [
      { value: 'residential', label: 'Residential' },
      { value: 'business_location', label: 'Business Location' },
      { value: 'registered_office', label: 'Registered Office' }
    ],
    belongsto: [
      { value: 'self', label: 'Self' },
      { value: 'spouse', label: 'Spouse' },
      { value: 'dependent_children', label: 'Dependent Children' },
      { value: 'guardian', label: 'Guardian' }
    ],
    relationship: [
      { value: 'spouse', label: 'Spouse' },
      { value: 'son', label: 'Son' },
      { value: 'daughter', label: 'Daughter' },
      { value: 'father', label: 'Father' },
      { value: 'mother', label: 'Mother' },
      { value: 'brother', label: 'Brother' },
      { value: 'sister', label: 'Sister' }
    ],
    pba_type: [
      { value: 'savings', label: 'Savings' },
      { value: 'current', label: 'Current' }
    ]
  };

  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};
    
    // Skip validation for already completed steps
    if (existingInvestor && completedSteps.includes(step)) {
      return {};
    }
    
    switch (step) {
      case 0:
        if (!patterns.pan.test(formData.pan_check)) newErrors.pan_check = 'Invalid PAN format (e.g., ABCDE1234F)';
        break;
        
      case 1:
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        if (!patterns.pan.test(formData.pan)) newErrors.pan = 'Invalid PAN format (e.g., ABCDE1234F)';
        
        // Age validation
        if (formData.dob) {
          const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
          if (age < 18 || age > 100) newErrors.dob = 'Age must be between 18 and 100 years';
        }
        break;
        
      case 2:
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.father_name?.trim()) newErrors.father_name = 'Father name is required';
        if (!formData.mother_name?.trim()) newErrors.mother_name = 'Mother name is required';
        if (!formData.marital_status) newErrors.marital_status = 'Marital status is required';
        if (!formData.occupation) newErrors.occupation = 'Occupation is required';
        if (!formData.source_of_wealth) newErrors.source_of_wealth = 'Source of wealth is required';
        if (!formData.income_range) newErrors.income_range = 'Income range is required';
        if (!formData.pob?.trim()) newErrors.pob = 'Place of birth is required';
        if (!patterns.aadhaar.test(formData.aadhaar_number)) newErrors.aadhaar_number = 'Invalid Aadhaar (last 4 digits)';
        break;
        
      case 3:
        if (!formData.geo_latitude || !formData.geo_longitude) {
          newErrors.location = 'Location coordinates are required';
        }
        break;
        
      case 5:
        if (!formData.ca_line?.trim()) newErrors.ca_line = 'Address is required';
        if (!patterns.pincode.test(formData.ca_pincode)) newErrors.ca_pincode = 'Invalid pincode format';
        if (!patterns.phone.test(formData.cp_number)) newErrors.cp_number = 'Invalid phone number (10 digits, starting with 6-9)';
        if (!patterns.email.test(formData.ce_address)) newErrors.ce_address = 'Invalid email format';
        break;
        
      case 6:
        if (!formData.pba_number?.trim()) newErrors.pba_number = 'Account number is required';
        if (!formData.pba_pname?.trim()) newErrors.pba_pname = 'Account holder name is required';
        if (!patterns.ifsc.test(formData.pba_code)) newErrors.pba_code = 'Invalid IFSC code format (e.g., HDFC0000123)';
        break;
        
      case 7:
        if (!formData.nominee_name[0]?.trim()) newErrors.nominee_name = 'Nominee name is required';
        if (!patterns.pan.test(formData.nominee_pan[0])) newErrors.nominee_pan = 'Invalid nominee PAN format';
        if (!formData.nominee_dob[0]) newErrors.nominee_dob = 'Nominee date of birth is required';
        if (!formData.nominee_relationship[0]) newErrors.nominee_relationship = 'Nominee relationship is required';
        break;
        
      case 8:
        if (!formData.signature) newErrors.signature = 'Signature file is required';
        break;
    }
    
    return newErrors;
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            geo_latitude: position.coords.latitude,
            geo_longitude: position.coords.longitude
          }));
          setLoading(false);
          setSuccessMessage('Location captured successfully!');
        },
        (error) => {
          setLoading(false);
          setErrors({ location: 'Unable to get location. Please enter manually.' });
        }
      );
    } else {
      setErrors({ location: 'Geolocation is not supported by this browser.' });
    }
  };

  // API call function
  const apiCall = async (endpoint, data, isFormData = false) => {
    try {
      const headers = isFormData 
        ? {} // Let browser set Content-Type for FormData
        : { 'Content-Type': 'application/json' };

      const body = isFormData ? data : JSON.stringify(data);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ API Error:', result);
        throw new Error(result.message || `API request failed with status ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ API Call Failed:', error);
      throw error;
    }
  };

  // Handle step submission
  const handleStepSubmit = async () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      let result;
      
      switch (currentStep) {
        case 0:
          // PAN check step
          await checkExistingPAN(formData.pan_check.toUpperCase());
          return; // checkExistingPAN handles navigation
          
        case 1:
          // Skip if already completed for existing investor
          if (existingInvestor && completedSteps.includes(1)) {
            setCurrentStep(currentStep + 1);
            return;
          }
          
          const step1Data = {
            name: formData.name,
            dob: formData.dob,
            pan: formData.pan,
            arn: HARDCODED_ARN,
          };
          
          result = await apiCall('/api/investor/step1', step1Data);
          if (!transactionId) {
            setTransactionId(result.data.transactionId);
          }
          break;
          
        case 2:
          // Skip if already completed for existing investor
          if (existingInvestor && completedSteps.includes(2)) {
            setCurrentStep(currentStep + 1);
            return;
          }
          
          const step2Data = {
            transactionId,
            gender: formData.gender,
            father_name: formData.father_name,
            mother_name: formData.mother_name,
            marital_status: formData.marital_status,
            spouse_name: formData.marital_status === 'unmarried' ? 'not applicable' : formData.spouse_name,
            occupation: formData.occupation,
            source_of_wealth: formData.source_of_wealth,
            income_range: formData.income_range,
            cob: formData.cob,
            pob: formData.pob,
            nationality: formData.nationality,
            citizenships: formData.citizenships,
            aadhaar_number: formData.aadhaar_number
          };
          
          result = await apiCall('/api/investor/step2', step2Data);
          break;
          
        case 3:
          // Skip if already completed for existing investor
          if (existingInvestor && completedSteps.includes(3)) {
            setCurrentStep(currentStep + 1);
            return;
          }
          
          const step3Data = {
            transactionId,
            geo_latitude: parseFloat(formData.geo_latitude),
            geo_longitude: parseFloat(formData.geo_longitude)
          };
          
          result = await apiCall('/api/investor/step3', step3Data);
          break;
          
        case 4:
          // Skip if already completed for existing investor
          if (existingInvestor && completedSteps.includes(4)) {
            setCurrentStep(currentStep + 1);
            return;
          }
          
          const step4Data = {
            transactionId,
            political_exposure: formData.political_exposure,
            india_tax_residency_status: formData.india_tax_residency_status,
            trc_country: formData.trc_country,
            trc_idtype: formData.trc_idtype,
            trc_idnumber: formData.trc_idnumber
          };
          
          result = await apiCall('/api/investor/step4', step4Data);
          break;
          
        case 5:
          // Skip if already completed for existing investor
          if (existingInvestor && completedSteps.includes(5)) {
            setCurrentStep(currentStep + 1);
            return;
          }
          
          const step5Data = {
            transactionId,
            mode_of_holding: formData.mode_of_holding,
            ca_line: formData.ca_line,
            ca_pincode: formData.ca_pincode,
            ca_country: formData.ca_country,
            ca_nature: formData.ca_nature,
            cp_number: formData.cp_number,
            cp_belongsto: formData.cp_belongsto,
            ce_address: formData.ce_address,
            ce_belongsto: formData.ce_belongsto
          };
          
          result = await apiCall('/api/investor/step5', step5Data);
          break;
          
        case 6:
          // Skip if already completed for existing investor
          if (existingInvestor && completedSteps.includes(6)) {
            setCurrentStep(currentStep + 1);
            return;
          }
          
          const step6Data = {
            transactionId,
            pba_number: formData.pba_number,
            pba_pname: formData.pba_pname,
            pba_code: formData.pba_code,
            pba_type: formData.pba_type
          };
          
          result = await apiCall('/api/investor/step6', step6Data);
          break;
          
        case 7:
          // Skip if already completed for existing investor
          if (existingInvestor && completedSteps.includes(7)) {
            setCurrentStep(currentStep + 1);
            return;
          }
          
          const step7Data = {
            transactionId,
            nominee_name: formData.nominee_name,
            nominee_pan: formData.nominee_pan,
            nominee_dob: formData.nominee_dob,
            nominee_relationship: formData.nominee_relationship,
            nominee_guardian_name: formData.nominee_guardian_name,
            nominee_guardian_pan: formData.nominee_guardian_pan,
            nominee_percentage: formData.nominee_percentage
          };
          
          result = await apiCall('/api/investor/step7', step7Data);
          break;
          
        case 8:
          const formDataObj = new FormData();
          formDataObj.append('transactionId', transactionId);
          formDataObj.append('signature', formData.signature);
          const pan = formData.pan.toUpperCase();
          const userId = user?._id || user?.userId || user?.id;
          result = await apiCall('/api/investor/step8', formDataObj, true);
          const response = await fetch(`${API_BASE_URL}/api/investor/by-pan/${pan}/${userId}/completed`);
          console.log('Step 8 response:', response);
          
          
          break;
      }

      if (result && result.success) {
        setSuccessMessage(`Step ${currentStep} completed successfully!`);
        
        if (currentStep < 8) {
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
            setSuccessMessage('');
          }, 1000);
        } else {
          // Show success animation for registration completion
          setShowSuccessAnimation(true);
          setSuccessMessage('🎉 Onboarding completed successfully!');
          
          // Navigate back to home after animation
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      }
    } catch (error) {
      console.error('❌ Step submission failed:', error);
      setErrors({ api: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'marital_status') {
        if (value === 'unmarried') {
          newData.spouse_name = 'not applicable';
        } else if (value === 'married') {
          newData.spouse_name = '';
        }
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ signature: 'File size must be less than 5MB' });
        return;
      }
      
      const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors({ signature: 'File must be PNG, JPG, JPEG, or PDF' });
        return;
      }
      
      setFormData(prev => ({ ...prev, signature: file }));
      setErrors(prev => ({ ...prev, signature: '' }));
    }
  };

  // Steps configuration
  const steps = [
    { number: 0, title: 'PAN Verification', subtitle: 'Check existing registration' },
    { number: 1, title: 'Basic Information', subtitle: 'Personal identification' },
    { number: 2, title: 'Personal Details', subtitle: 'Family and occupation' },
    { number: 3, title: 'Location Details', subtitle: 'Geographical information' },
    { number: 4, title: 'Political & Tax', subtitle: 'Compliance information' },
    { number: 5, title: 'Communication', subtitle: 'Contact details' },
    { number: 6, title: 'Bank Details', subtitle: 'Financial information' },
    { number: 7, title: 'Nominee Details', subtitle: 'Beneficiary information' },
    { number: 8, title: 'Signature Upload', subtitle: 'Digital signature' }
  ];

  const renderCurrentStepTitle = () => {
    switch (currentStep) {
      case 0: return 'Enter your PAN number';
      case 1: return 'Your basic information';
      case 2: return 'Personal details';
      case 3: return 'Location information';
      case 4: return 'Political & tax status';
      case 5: return 'Communication details';
      case 6: return 'Bank information';
      case 7: return 'Nominee information';
      case 8: return 'Upload signature';
      default: return 'Your information';
    }
  };

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      {/* Loading line animation */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            style={{
              animation: 'loading-sweep 2s ease-in-out infinite'
            }}
          />
        </div>
      )}

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="relative">
              {/* Green check circle animation */}
              <div className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <svg 
                  className="w-12 h-12 text-white animate-pulse" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ animation: 'checkmark 0.6s ease-in-out forwards' }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="3" 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              
              {/* Success text */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in">
                Onboarding Complete!
              </h3>
              <p className="text-gray-600 animate-fade-in-delay">
                Welcome aboard! Redirecting to your dashboard...
              </p>
              
              {/* Loading dots */}
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
        
        @keyframes checkmark {
          0% {
            stroke-dasharray: 0 50;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 50 50;
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-delay {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          50% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 1.2s ease-out forwards;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="InvestFund Logo" 
              className="h-12 object-contain"
            />
          </div>

          {/* Return to Home Button */}
          <Button 
            onClick={handleReturnHome}
            variant="outline"
            className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Return to Home</span>
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white/90 backdrop-blur-sm shadow-sm border-r border-gray-200 p-6 min-h-screen">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Investor Onboarding</h1>
            <p className="text-sm text-gray-500">Complete all steps to activate your account</p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {steps.map((step) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              
              return (
                <div key={step.number} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${isCompleted 
                          ? 'bg-green-600 text-white' 
                          : isCurrent 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{step.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {renderCurrentStepTitle()}
              </h2>
              <p className="text-gray-600">
                Please provide the required information to continue with your onboarding
              </p>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            )}

            {errors.api && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm font-medium text-red-800">{errors.api}</p>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-6">
                {/* Step 0: PAN Check */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-1">PAN Verification</h4>
                      <p className="text-sm text-blue-700">Enter your PAN number to check for existing registration or start a new one</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN number
                      </label>
                      <input
                        type="text"
                        value={formData.pan_check}
                        onChange={(e) => handleInputChange('pan_check', e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.pan_check ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.pan_check && <p className="mt-1 text-sm text-red-600">{errors.pan_check}</p>}
                      <p className="mt-2 text-sm text-gray-500">
                        Enter your 10-digit PAN number to verify existing registration status
                      </p>
                    </div>

                    {existingInvestor && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-green-800">Existing registration found!</p>
                            <p className="text-sm text-green-700">
                              Registration for {existingInvestor.name} will continue from step {existingInvestor.currentStep}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full legal name"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of birth
                      </label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.dob ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN number
                      </label>
                      <input
                        type="text"
                        value={formData.pan}
                        onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.pan ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.pan && <p className="mt-1 text-sm text-red-600">{errors.pan}</p>}
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <div className="space-y-2">
                          {options.gender.map(option => (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="radio"
                                name="gender"
                                value={option.value}
                                checked={formData.gender === option.value}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-900">{option.label}</span>
                            </label>
                          ))}
                        </div>
                        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Marital status</label>
                        <div className="space-y-2">
                          {options.marital_status.map(option => (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="radio"
                                name="marital_status"
                                value={option.value}
                                checked={formData.marital_status === option.value}
                                onChange={(e) => handleInputChange('marital_status', e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-900">{option.label}</span>
                            </label>
                          ))}
                        </div>
                        {errors.marital_status && <p className="mt-1 text-sm text-red-600">{errors.marital_status}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Father's name</label>
                        <input
                          type="text"
                          value={formData.father_name}
                          onChange={(e) => handleInputChange('father_name', e.target.value)}
                          placeholder="Father's full name"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.father_name ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.father_name && <p className="mt-1 text-sm text-red-600">{errors.father_name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mother's name</label>
                        <input
                          type="text"
                          value={formData.mother_name}
                          onChange={(e) => handleInputChange('mother_name', e.target.value)}
                          placeholder="Mother's full name"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.mother_name ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.mother_name && <p className="mt-1 text-sm text-red-600">{errors.mother_name}</p>}
                      </div>
                    </div>

                    {formData.marital_status === 'married' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spouse name</label>
                        <input
                          type="text"
                          value={formData.spouse_name}
                          onChange={(e) => handleInputChange('spouse_name', e.target.value)}
                          placeholder="Spouse's full name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                      <select
                        value={formData.occupation}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.occupation ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select occupation</option>
                        {options.occupation.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {errors.occupation && <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Source of wealth</label>
                        <select
                          value={formData.source_of_wealth}
                          onChange={(e) => handleInputChange('source_of_wealth', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.source_of_wealth ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select source</option>
                          {options.source_of_wealth.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.source_of_wealth && <p className="mt-1 text-sm text-red-600">{errors.source_of_wealth}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Annual income range</label>
                        <select
                          value={formData.income_range}
                          onChange={(e) => handleInputChange('income_range', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.income_range ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select income range</option>
                          {options.income_range.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.income_range && <p className="mt-1 text-sm text-red-600">{errors.income_range}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Place of birth</label>
                        <input
                          type="text"
                          value={formData.pob}
                          onChange={(e) => handleInputChange('pob', e.target.value)}
                          placeholder="City/Place of birth"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.pob ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.pob && <p className="mt-1 text-sm text-red-600">{errors.pob}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar (last 4 digits)</label>
                        <input
                          type="text"
                          value={formData.aadhaar_number}
                          onChange={(e) => handleInputChange('aadhaar_number', e.target.value)}
                          placeholder="1234"
                          maxLength={4}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.aadhaar_number ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.aadhaar_number && <p className="mt-1 text-sm text-red-600">{errors.aadhaar_number}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Location Details */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900">Location coordinates</h4>
                          <p className="text-sm text-blue-700">Required for compliance purposes</p>
                        </div>
                        <button
                          onClick={getCurrentLocation}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Getting location...' : 'Use current location'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.geo_latitude}
                          onChange={(e) => handleInputChange('geo_latitude', e.target.value)}
                          placeholder="19.0760"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.location ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.geo_longitude}
                          onChange={(e) => handleInputChange('geo_longitude', e.target.value)}
                          placeholder="72.8777"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.location ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                    {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                  </div>
                )}

                {/* Step 4: Political Exposure & Tax Details */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Political exposure</label>
                      <div className="space-y-2">
                        {options.political_exposure.map(option => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="radio"
                              name="political_exposure"
                              value={option.value}
                              checked={formData.political_exposure === option.value}
                              onChange={(e) => handleInputChange('political_exposure', e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-900">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">India tax residency status</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="india_tax_residency_status"
                            value="resident"
                            checked={formData.india_tax_residency_status === 'resident'}
                            onChange={(e) => handleInputChange('india_tax_residency_status', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-900">Resident</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="india_tax_residency_status"
                            value="non_resident"
                            checked={formData.india_tax_residency_status === 'non_resident'}
                            onChange={(e) => handleInputChange('india_tax_residency_status', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-900">Non-Resident</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Tax Residency Certificate (TRC) details are optional and can be left empty if not applicable.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 5: Communication Details */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address line</label>
                      <input
                        type="text"
                        value={formData.ca_line}
                        onChange={(e) => handleInputChange('ca_line', e.target.value)}
                        placeholder="123, MG Road, Bandra West, Mumbai"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.ca_line ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.ca_line && <p className="mt-1 text-sm text-red-600">{errors.ca_line}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                        <input
                          type="text"
                          value={formData.ca_pincode}
                          onChange={(e) => handleInputChange('ca_pincode', e.target.value)}
                          placeholder="400050"
                          maxLength={6}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.ca_pincode ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.ca_pincode && <p className="mt-1 text-sm text-red-600">{errors.ca_pincode}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address nature</label>
                        <select
                          value={formData.ca_nature}
                          onChange={(e) => handleInputChange('ca_nature', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {options.ca_nature.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                        <input
                          type="text"
                          value={formData.cp_number}
                          onChange={(e) => handleInputChange('cp_number', e.target.value)}
                          placeholder="9876543210"
                          maxLength={10}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.cp_number ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.cp_number && <p className="mt-1 text-sm text-red-600">{errors.cp_number}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone belongs to</label>
                        <select
                          value={formData.cp_belongsto}
                          onChange={(e) => handleInputChange('cp_belongsto', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {options.belongsto.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                        <input
                          type="email"
                          value={formData.ce_address}
                          onChange={(e) => handleInputChange('ce_address', e.target.value)}
                          placeholder="user@example.com"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.ce_address ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.ce_address && <p className="mt-1 text-sm text-red-600">{errors.ce_address}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email belongs to</label>
                        <select
                          value={formData.ce_belongsto}
                          onChange={(e) => handleInputChange('ce_belongsto', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {options.belongsto.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Bank Details */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account number</label>
                      <input
                        type="text"
                        value={formData.pba_number}
                        onChange={(e) => handleInputChange('pba_number', e.target.value)}
                        placeholder="123456789012"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.pba_number ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.pba_number && <p className="mt-1 text-sm text-red-600">{errors.pba_number}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account holder name</label>
                      <input
                        type="text"
                        value={formData.pba_pname}
                        onChange={(e) => handleInputChange('pba_pname', e.target.value)}
                        placeholder="As per bank records"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.pba_pname ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.pba_pname && <p className="mt-1 text-sm text-red-600">{errors.pba_pname}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IFSC code</label>
                        <input
                          type="text"
                          value={formData.pba_code}
                          onChange={(e) => handleInputChange('pba_code', e.target.value.toUpperCase())}
                          placeholder="HDFC0000123"
                          maxLength={11}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.pba_code ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.pba_code && <p className="mt-1 text-sm text-red-600">{errors.pba_code}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account type</label>
                        <select
                          value={formData.pba_type}
                          onChange={(e) => handleInputChange('pba_type', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {options.pba_type.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7: Nominee Details */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-1">Nominee information</h4>
                      <p className="text-sm text-blue-700">Provide details of the nominee (100% allocation)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nominee name</label>
                        <input
                          type="text"
                          value={formData.nominee_name[0]}
                          onChange={(e) => {
                            const newNames = [...formData.nominee_name];
                            newNames[0] = e.target.value;
                            handleInputChange('nominee_name', newNames);
                          }}
                          placeholder="Nominee full name"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.nominee_name ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.nominee_name && <p className="mt-1 text-sm text-red-600">{errors.nominee_name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nominee PAN</label>
                        <input
                          type="text"
                          value={formData.nominee_pan[0]}
                          onChange={(e) => {
                            const newPans = [...formData.nominee_pan];
                            newPans[0] = e.target.value.toUpperCase();
                            handleInputChange('nominee_pan', newPans);
                          }}
                          placeholder="FGHIJ5678K"
                          maxLength={10}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.nominee_pan ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.nominee_pan && <p className="mt-1 text-sm text-red-600">{errors.nominee_pan}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nominee date of birth</label>
                        <input
                          type="date"
                          value={formData.nominee_dob[0]}
                          onChange={(e) => {
                            const newDobs = [...formData.nominee_dob];
                            newDobs[0] = e.target.value;
                            handleInputChange('nominee_dob', newDobs);
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.nominee_dob ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.nominee_dob && <p className="mt-1 text-sm text-red-600">{errors.nominee_dob}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                        <select
                          value={formData.nominee_relationship[0]}
                          onChange={(e) => {
                            const newRelationships = [...formData.nominee_relationship];
                            newRelationships[0] = e.target.value;
                            handleInputChange('nominee_relationship', newRelationships);
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.nominee_relationship ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select relationship</option>
                          {options.relationship.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.nominee_relationship && <p className="mt-1 text-sm text-red-600">{errors.nominee_relationship}</p>}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        <strong>Allocation:</strong> 100% (Guardian details are optional and can be left empty if nominee is an adult)
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 8: Signature Upload */}
                {currentStep === 8 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-1">Digital signature upload</h4>
                      <p className="text-sm text-blue-700">Upload your signature image or scanned signature document</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Signature file</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          id="signature-upload"
                        />
                        <div className="space-y-4">
                          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <label
                              htmlFor="signature-upload"
                              className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Choose file
                            </label>
                            <p className="text-sm text-gray-500 mt-2">
                              PNG, JPG, JPEG or PDF (Max 5MB)
                            </p>
                          </div>
                        </div>
                        
                        {formData.signature && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-center space-x-2">
                              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-green-800 font-medium">{formData.signature.name}</span>
                              <span className="text-sm text-green-600">
                                ({(formData.signature.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.signature && <p className="mt-1 text-sm text-red-600">{errors.signature}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleStepSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : currentStep === 8 ? (
                    'Complete onboarding'
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorOnboarding;