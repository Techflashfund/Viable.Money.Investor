'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import useAuthStore from '../../store/auth';

const InvestorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1); // Start at step 1
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const { user, token, transactionId, getAuthHeaders } = useAuthStore();

  console.log('Auth Store - User:', transactionId);

  const API_BASE_URL = 'https://viable-money-be.onrender.com';

  // Form data for all 4 steps
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
    aadhaarLastFour: '',
    nationality: 'in',
    citizenships: ['in'],
    geolocation: {
      latitude: '',
      longitude: ''
    },
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
      allocationPercentage: 100,
      guardian: {
        name: '',
        idType: '',
        idNumber: '',
        phone: '',
        email: '',
        address: {
          line: '',
          pincode: '',
          country: 'IN'
        }
      }
    }]
  });

  // Check if transaction ID exists
  useEffect(() => {
    if (!transactionId) {
      setErrors({ general: 'Transaction ID not found. Please start from the beginning.' });
    }
  }, [transactionId]);

  // Validation patterns
  const patterns = {
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    phone: /^[6-9]\d{9}$/,
    ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    pincode: /^[1-9][0-9]{5}$/,
    aadhaar: /^\d{4}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    bankAccount: /^\d{9,18}$/,
    name: /^[A-Za-z ]{1,70}$/,
    nomineeName: /^[A-Za-z ]{1,40}$/,
    place: /^.{2,50}$/
  };

  // Enum options for dropdowns
  const options = {
    gender: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'transgender', label: 'Transgender' }
    ],
    maritalStatus: [
      { value: 'married', label: 'Married' },
      { value: 'unmarried', label: 'Unmarried' },
      { value: 'others', label: 'Others' }
    ],
    occupation: [
      { value: 'business', label: 'Business' },
      { value: 'professional', label: 'Professional' },
      { value: 'retired', label: 'Retired' },
      { value: 'housewife', label: 'Housewife' },
      { value: 'house_wife', label: 'House Wife' },
      { value: 'student', label: 'Student' },
      { value: 'public_sector_service', label: 'Public Sector Service' },
      { value: 'private_sector_service', label: 'Private Sector Service' },
      { value: 'government_service', label: 'Government Service' },
      { value: 'agriculture', label: 'Agriculture' },
      { value: 'doctor', label: 'Doctor' },
      { value: 'forex_dealer', label: 'Forex Dealer' },
      { value: 'service', label: 'Service' },
      { value: 'others', label: 'Others' }
    ],
    sourceOfWealth: [
      { value: 'salary', label: 'Salary' },
      { value: 'business', label: 'Business' },
      { value: 'gift', label: 'Gift' },
      { value: 'ancestral_property', label: 'Ancestral Property' },
      { value: 'rental_income', label: 'Rental Income' },
      { value: 'prize_money', label: 'Prize Money' },
      { value: 'royalty', label: 'Royalty' },
      { value: 'others', label: 'Others' }
    ],
    incomeRange: [
      { value: 'upto_1lakh', label: 'Up to ₹1 Lakh' },
      { value: 'above_1lakh_upto_5lakh', label: '₹1 - 5 Lakh' },
      { value: 'above_5lakh_upto_10lakh', label: '₹5 - 10 Lakh' },
      { value: 'above_10lakh_upto_25lakh', label: '₹10 - 25 Lakh' },
      { value: 'above_25lakh_upto_1cr', label: '₹25 Lakh - 1 Crore' },
      { value: 'above_1cr', label: 'Above ₹1 Crore' }
    ],
    countryOfBirth: [
      { value: 'in', label: 'India' },
      { value: 'Other', label: 'Other' }
    ],
    politicalExposure: [
      { value: 'no_exposure', label: 'No Exposure' },
      { value: 'pep', label: 'Politically Exposed Person' },
      { value: 'related_pep', label: 'Related to PEP' }
    ],
    addressNature: [
      { value: 'residential', label: 'Residential' },
      { value: 'registered_office', label: 'Registered Office' },
      { value: 'business_location', label: 'Business Location' }
    ],
    belongsTo: [
      { value: 'self', label: 'Self' },
      { value: 'spouse', label: 'Spouse' },
      { value: 'dependent_children', label: 'Dependent Children' },
      { value: 'dependent_siblings', label: 'Dependent Siblings' },
      { value: 'dependent_parents', label: 'Dependent Parents' },
      { value: 'guardian', label: 'Guardian' },
      { value: 'pms', label: 'PMS' },
      { value: 'custodian', label: 'Custodian' },
      { value: 'poa', label: 'POA' }
    ],
    bankAccountType: [
      { value: 'savings', label: 'Savings' },
      { value: 'current', label: 'Current' },
      { value: 'nre_savings', label: 'NRE Savings' },
      { value: 'nro_savings', label: 'NRO Savings' }
    ],
    relationship: [
      { value: 'aunt', label: 'Aunt' },
      { value: 'brother_in_law', label: 'Brother-in-law' },
      { value: 'brother', label: 'Brother' },
      { value: 'daughter', label: 'Daughter' },
      { value: 'daughter_in_law', label: 'Daughter-in-law' },
      { value: 'father', label: 'Father' },
      { value: 'father_in_law', label: 'Father-in-law' },
      { value: 'grand_daughter', label: 'Granddaughter' },
      { value: 'grand_father', label: 'Grandfather' },
      { value: 'grand_mother', label: 'Grandmother' },
      { value: 'grand_son', label: 'Grandson' },
      { value: 'mother_in_law', label: 'Mother-in-law' },
      { value: 'mother', label: 'Mother' },
      { value: 'nephew', label: 'Nephew' },
      { value: 'niece', label: 'Niece' },
      { value: 'sister', label: 'Sister' },
      { value: 'sister_in_law', label: 'Sister-in-law' },
      { value: 'son', label: 'Son' },
      { value: 'son_in_law', label: 'Son-in-law' },
      { value: 'spouse', label: 'Spouse' },
      { value: 'uncle', label: 'Uncle' },
      { value: 'court_appointed_legal_guardian', label: 'Court Appointed Legal Guardian' },
      { value: 'others', label: 'Others' }
    ],
    idType: [
      { value: 'pan', label: 'PAN' },
      { value: 'aadhaar_last4', label: 'Aadhaar Last 4 Digits' },
      { value: 'driving_license', label: 'Driving License' },
      { value: 'passport', label: 'Passport' }
    ],
    skipNomination: [
      { value: 'yes', label: 'Yes, Skip Nomination' },
      { value: 'no', label: 'No, Add Nominees' }
    ]
  };

  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!patterns.name.test(formData.name)) newErrors.name = 'Name must contain only letters and spaces (1-70 characters)';
        if (!patterns.pan.test(formData.pan)) newErrors.pan = 'Invalid PAN format (e.g., ABCDE1234F)';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!patterns.name.test(formData.fatherName)) newErrors.fatherName = 'Father name must contain only letters and spaces';
        if (!patterns.name.test(formData.motherName)) newErrors.motherName = 'Mother name must contain only letters and spaces';
        if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
        if (formData.maritalStatus === 'married' && !patterns.name.test(formData.spouseName)) {
          newErrors.spouseName = 'Spouse name is required for married status';
        }
        if (!formData.occupation) newErrors.occupation = 'Occupation is required';
        if (!formData.sourceOfWealth) newErrors.sourceOfWealth = 'Source of wealth is required';
        if (!formData.incomeRange) newErrors.incomeRange = 'Income range is required';
        if (!formData.countryOfBirth) newErrors.countryOfBirth = 'Country of birth is required';
        if (!patterns.place.test(formData.placeOfBirth)) newErrors.placeOfBirth = 'Place of birth is required (2-50 characters)';
        if (!formData.politicalExposure) newErrors.politicalExposure = 'Political exposure status is required';
        if (!patterns.aadhaar.test(formData.aadhaarLastFour)) newErrors.aadhaarLastFour = 'Last 4 digits of Aadhaar required';
        if (!formData.geolocation.latitude || !formData.geolocation.longitude) {
          newErrors.geolocation = 'Location coordinates are required';
        }
        
        // Age validation
        if (formData.dob) {
          const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
          if (age < 18 || age > 100) newErrors.dob = 'Age must be between 18 and 100 years';
        }
        break;
        
      case 2:
        if (!formData.communicationAddress.line?.trim()) newErrors['communicationAddress.line'] = 'Address line is required';
        if (!patterns.place.test(formData.communicationAddress.city)) newErrors['communicationAddress.city'] = 'City is required (2-50 characters)';
        if (!patterns.place.test(formData.communicationAddress.state)) newErrors['communicationAddress.state'] = 'State is required (2-50 characters)';
        if (!patterns.pincode.test(formData.communicationAddress.pincode)) newErrors['communicationAddress.pincode'] = 'Invalid pincode format';
        if (!patterns.phone.test(formData.phone.number)) newErrors['phone.number'] = 'Invalid phone number (10 digits, starting with 6-9)';
        if (!patterns.email.test(formData.email.address)) newErrors['email.address'] = 'Invalid email format';
        break;
        
      case 3:
        if (!patterns.bankAccount.test(formData.bankAccount.number)) newErrors['bankAccount.number'] = 'Bank account number must be 9-18 digits';
        if (!patterns.name.test(formData.bankAccount.primaryHolderName)) newErrors['bankAccount.primaryHolderName'] = 'Primary holder name must contain only letters and spaces';
        if (!patterns.ifsc.test(formData.bankAccount.ifscCode)) newErrors['bankAccount.ifscCode'] = 'Invalid IFSC code format (e.g., HDFC0001234)';
        if (!formData.bankAccount.type) newErrors['bankAccount.type'] = 'Bank account type is required';
        break;
        
      case 4:
        if (!formData.skipNomination) newErrors.skipNomination = 'Please select nomination preference';
        
        if (formData.skipNomination === 'no') {
          if (!formData.nominees[0]?.name || !patterns.nomineeName.test(formData.nominees[0].name)) {
            newErrors['nominees.0.name'] = 'Nominee name is required (1-40 characters, letters and spaces only)';
          }
          if (!formData.nominees[0]?.relationship) newErrors['nominees.0.relationship'] = 'Nominee relationship is required';
          if (!formData.nominees[0]?.dob) newErrors['nominees.0.dob'] = 'Nominee date of birth is required';
          if (!formData.nominees[0]?.idNumber) newErrors['nominees.0.idNumber'] = 'Nominee ID number is required';
          if (!patterns.phone.test(formData.nominees[0]?.phone)) newErrors['nominees.0.phone'] = 'Invalid nominee phone number';
          if (!patterns.email.test(formData.nominees[0]?.email)) newErrors['nominees.0.email'] = 'Invalid nominee email format';
          if (!formData.nominees[0]?.address?.line?.trim()) newErrors['nominees.0.address.line'] = 'Nominee address is required';
          if (!patterns.pincode.test(formData.nominees[0]?.address?.pincode)) newErrors['nominees.0.address.pincode'] = 'Invalid nominee address pincode';
          
          // Check total allocation percentage
          const totalAllocation = formData.nominees.reduce((sum, nominee) => sum + (nominee.allocationPercentage || 0), 0);
          if (totalAllocation !== 100) {
            newErrors.allocation = `Total allocation must equal 100%. Current total: ${totalAllocation}%`;
          }
        }
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
            geolocation: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
          setLoading(false);
          setSuccessMessage('Location captured successfully!');
          setTimeout(() => setSuccessMessage(''), 2000);
        },
        (error) => {
          setLoading(false);
          setErrors({ geolocation: 'Unable to get location. Please enter manually.' });
        }
      );
    } else {
      setErrors({ geolocation: 'Geolocation is not supported by this browser.' });
    }
  };

  // API call function
  const apiCall = async (endpoint, data) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
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
    if (!transactionId) {
      setErrors({ general: 'Transaction ID not found. Please start from the beginning.' });
      return;
    }

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
      let endpoint;
      let data;
      
      switch (currentStep) {
        case 1:
          endpoint = `/api/onboarding/basic-info/${transactionId}`;
          data = {
            name: formData.name,
            pan: formData.pan,
            dob: formData.dob,
            gender: formData.gender,
            fatherName: formData.fatherName,
            motherName: formData.motherName,
            maritalStatus: formData.maritalStatus,
            spouseName: formData.maritalStatus === 'married' ? formData.spouseName : undefined,
            occupation: formData.occupation,
            sourceOfWealth: formData.sourceOfWealth,
            incomeRange: formData.incomeRange,
            countryOfBirth: formData.countryOfBirth,
            placeOfBirth: formData.placeOfBirth,
            politicalExposure: formData.politicalExposure,
            aadhaarLastFour: formData.aadhaarLastFour,
            nationality: formData.nationality,
            citizenships: formData.citizenships,
            geolocation: formData.geolocation,
            indiaTaxResidencyStatus: formData.indiaTaxResidencyStatus
          };
          break;
          
        case 2:
          endpoint = `/api/onboarding/address-info/${transactionId}`;
          data = {
            communicationAddress: formData.communicationAddress,
            phone: formData.phone,
            email: formData.email
          };
          break;
          
        case 3:
          endpoint = `/api/onboarding/bank-tax-info/${transactionId}`;
          data = {
            bankAccount: formData.bankAccount,
            taxResidencies: formData.taxResidencies
          };
          break;
          
        case 4:
          endpoint = `/api/onboarding/nomination-info/${transactionId}`;
          data = {
            skipNomination: formData.skipNomination,
            displaySetting: formData.displaySetting
          };
          
          if (formData.skipNomination === 'no') {
            data.nominees = formData.nominees.filter(nominee => nominee.name); // Only include filled nominees
          }
          break;
      }

      result = await apiCall(endpoint, data);

      if (result && result.success) {
        setSuccessMessage(`Step ${currentStep} completed successfully!`);
        
        if (currentStep < 4) {
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
            setSuccessMessage('');
          }, 1000);
        } else {
          // Show success animation for KYC completion
          setShowSuccessAnimation(true);
          setSuccessMessage('🎉 KYC process completed successfully! Status: Signature Pending');
          
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
    if (field.includes('.')) {
      // Handle nested object updates
      const keys = field.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        
        // Handle conditional logic
        if (field === 'maritalStatus') {
          if (value === 'unmarried' || value === 'others') {
            newData.spouseName = '';
          }
        }
        
        return newData;
      });
    }
    
    // Clear errors for the field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle nominee changes
  const handleNomineeChange = (index, field, value) => {
    setFormData(prev => {
      const newNominees = [...prev.nominees];
      if (!newNominees[index]) newNominees[index] = {};
      
      if (field.includes('.')) {
        const keys = field.split('.');
        if (!newNominees[index][keys[0]]) newNominees[index][keys[0]] = {};
        newNominees[index][keys[0]][keys[1]] = value;
      } else {
        newNominees[index][field] = value;
      }
      
      return { ...prev, nominees: newNominees };
    });
  };

  // Add nominee
  const addNominee = () => {
    setFormData(prev => ({
      ...prev,
      nominees: [...prev.nominees, {
        name: '',
        relationship: '',
        dob: '',
        idType: 'pan',
        idNumber: '',
        phone: '',
        email: '',
        address: { line: '', pincode: '', country: 'IN' },
        allocationPercentage: 0,
        guardian: { name: '', idType: '', idNumber: '', phone: '', email: '', address: { line: '', pincode: '', country: 'IN' } }
      }]
    }));
  };

  // Remove nominee
  const removeNominee = (index) => {
    setFormData(prev => ({
      ...prev,
      nominees: prev.nominees.filter((_, i) => i !== index)
    }));
  };

  // Steps configuration
  const steps = [
    { number: 1, title: 'Basic Information', subtitle: 'Personal identification details' },
    { number: 2, title: 'Address & Contact', subtitle: 'Communication information' },
    { number: 3, title: 'Bank & Tax Details', subtitle: 'Financial information' },
    { number: 4, title: 'Nomination', subtitle: 'Beneficiary details' }
  ];

  const renderCurrentStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Your basic information';
      case 2: return 'Address & contact details';
      case 3: return 'Bank & tax information';
      case 4: return 'Nomination information';
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
              <div className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in">
                KYC Process Complete!
              </h3>
              <p className="text-gray-600 animate-fade-in-delay">
                Your application is now in signature pending status. Redirecting...
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
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes loading-sweep {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delay {
          0% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-fade-in-delay { animation: fade-in-delay 1.2s ease-out forwards; }
      `}</style>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="InvestFund Logo" className="h-12 object-contain" />
          </div>
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
            <h1 className="text-xl font-semibold text-gray-900 mb-2">KYC Process</h1>
            <p className="text-sm text-gray-500">Complete all steps to finish your KYC</p>
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
                        ${isCompleted ? 'bg-green-600 text-white' : isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
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
                Please provide the required information to continue with your KYC process
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

            {(errors.api || errors.general) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm font-medium text-red-800">{errors.api || errors.general}</p>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">PAN number</label>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Father's name</label>
                        <input
                          type="text"
                          value={formData.fatherName}
                          onChange={(e) => handleInputChange('fatherName', e.target.value)}
                          placeholder="Father's full name"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.fatherName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.fatherName && <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mother's name</label>
                        <input
                          type="text"
                          value={formData.motherName}
                          onChange={(e) => handleInputChange('motherName', e.target.value)}
                          placeholder="Mother's full name"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.motherName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.motherName && <p className="mt-1 text-sm text-red-600">{errors.motherName}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Marital status</label>
                        <select
                          value={formData.maritalStatus}
                          onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.maritalStatus ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select marital status</option>
                          {options.maritalStatus.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.maritalStatus && <p className="mt-1 text-sm text-red-600">{errors.maritalStatus}</p>}
                      </div>

                      {formData.maritalStatus === 'married' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Spouse name</label>
                          <input
                            type="text"
                            value={formData.spouseName}
                            onChange={(e) => handleInputChange('spouseName', e.target.value)}
                            placeholder="Spouse's full name"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.spouseName ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.spouseName && <p className="mt-1 text-sm text-red-600">{errors.spouseName}</p>}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Source of wealth</label>
                        <select
                          value={formData.sourceOfWealth}
                          onChange={(e) => handleInputChange('sourceOfWealth', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.sourceOfWealth ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select source</option>
                          {options.sourceOfWealth.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.sourceOfWealth && <p className="mt-1 text-sm text-red-600">{errors.sourceOfWealth}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Annual income range</label>
                        <select
                          value={formData.incomeRange}
                          onChange={(e) => handleInputChange('incomeRange', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.incomeRange ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select income range</option>
                          {options.incomeRange.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.incomeRange && <p className="mt-1 text-sm text-red-600">{errors.incomeRange}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country of birth</label>
                        <select
                          value={formData.countryOfBirth}
                          onChange={(e) => handleInputChange('countryOfBirth', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.countryOfBirth ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          {options.countryOfBirth.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors.countryOfBirth && <p className="mt-1 text-sm text-red-600">{errors.countryOfBirth}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Place of birth</label>
                        <input
                          type="text"
                          value={formData.placeOfBirth}
                          onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                          placeholder="City/Place of birth"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.placeOfBirth ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.placeOfBirth && <p className="mt-1 text-sm text-red-600">{errors.placeOfBirth}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar (last 4 digits)</label>
                        <input
                          type="text"
                          value={formData.aadhaarLastFour}
                          onChange={(e) => handleInputChange('aadhaarLastFour', e.target.value)}
                          placeholder="1234"
                          maxLength={4}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.aadhaarLastFour ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.aadhaarLastFour && <p className="mt-1 text-sm text-red-600">{errors.aadhaarLastFour}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Political exposure</label>
                      <div className="space-y-2">
                        {options.politicalExposure.map(option => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="radio"
                              name="politicalExposure"
                              value={option.value}
                              checked={formData.politicalExposure === option.value}
                              onChange={(e) => handleInputChange('politicalExposure', e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-900">{option.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.politicalExposure && <p className="mt-1 text-sm text-red-600">{errors.politicalExposure}</p>}
                    </div>

                    <div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
                            value={formData.geolocation.latitude}
                            onChange={(e) => handleInputChange('geolocation.latitude', e.target.value)}
                            placeholder="19.0760"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.geolocation ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            value={formData.geolocation.longitude}
                            onChange={(e) => handleInputChange('geolocation.longitude', e.target.value)}
                            placeholder="72.8777"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.geolocation ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                      {errors.geolocation && <p className="text-sm text-red-600 mt-2">{errors.geolocation}</p>}
                    </div>
                  </div>
                )}

                {/* Step 2: Address Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-1">Communication Address</h4>
                      <p className="text-sm text-blue-700">Provide your current residential address</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address line</label>
                      <input
                        type="text"
                        value={formData.communicationAddress.line}
                        onChange={(e) => handleInputChange('communicationAddress.line', e.target.value)}
                        placeholder="123, MG Road, Bandra West"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors['communicationAddress.line'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors['communicationAddress.line'] && <p className="mt-1 text-sm text-red-600">{errors['communicationAddress.line']}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={formData.communicationAddress.city}
                          onChange={(e) => handleInputChange('communicationAddress.city', e.target.value)}
                          placeholder="Mumbai"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors['communicationAddress.city'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors['communicationAddress.city'] && <p className="mt-1 text-sm text-red-600">{errors['communicationAddress.city']}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={formData.communicationAddress.state}
                          onChange={(e) => handleInputChange('communicationAddress.state', e.target.value)}
                          placeholder="Maharashtra"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors['communicationAddress.state'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors['communicationAddress.state'] && <p className="mt-1 text-sm text-red-600">{errors['communicationAddress.state']}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                        <input
                          type="text"
                          value={formData.communicationAddress.pincode}
                          onChange={(e) => handleInputChange('communicationAddress.pincode', e.target.value)}
                          placeholder="400050"
                          maxLength={6}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors['communicationAddress.pincode'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors['communicationAddress.pincode'] && <p className="mt-1 text-sm text-red-600">{errors['communicationAddress.pincode']}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address nature</label>
                        <select
                          value={formData.communicationAddress.nature}
                          onChange={(e) => handleInputChange('communicationAddress.nature', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {options.addressNature.map(opt => (
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
                          value={formData.phone.number}
                          onChange={(e) => handleInputChange('phone.number', e.target.value)}
                          placeholder="9876543210"
                          maxLength={10}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors['phone.number'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors['phone.number'] && <p className="mt-1 text-sm text-red-600">{errors['phone.number']}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone belongs to</label>
                        <select
                          value={formData.phone.belongsTo}
                          onChange={(e) => handleInputChange('phone.belongsTo', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {options.belongsTo.map(opt => (
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
                          value={formData.email.address}
                          onChange={(e) => handleInputChange('email.address', e.target.value)}
                          placeholder="user@example.com"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors['email.address'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors['email.address'] && <p className="mt-1 text-sm text-red-600">{errors['email.address']}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email belongs to</label>
                        <select
                          value={formData.email.belongsTo}
                          onChange={(e) => handleInputChange('email.belongsTo', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {options.belongsTo.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Bank & Tax Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-1">Bank Account Information</h4>
                      <p className="text-sm text-blue-700">Provide your primary bank account details</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account number</label>
                      <input
                        type="text"
                        value={formData.bankAccount.number}
                        onChange={(e) => handleInputChange('bankAccount.number', e.target.value)}
                        placeholder="123456789012"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors['bankAccount.number'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors['bankAccount.number'] && <p className="mt-1 text-sm text-red-600">{errors['bankAccount.number']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account holder name</label>
                      <input
                        type="text"
                        value={formData.bankAccount.primaryHolderName}
                        onChange={(e) => handleInputChange('bankAccount.primaryHolderName', e.target.value)}
                        placeholder="As per bank records"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors['bankAccount.primaryHolderName'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors['bankAccount.primaryHolderName'] && <p className="mt-1 text-sm text-red-600">{errors['bankAccount.primaryHolderName']}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IFSC code</label>
                        <input
                          type="text"
                          value={formData.bankAccount.ifscCode}
                          onChange={(e) => handleInputChange('bankAccount.ifscCode', e.target.value.toUpperCase())}
                          placeholder="HDFC0001234"
                          maxLength={11}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors['bankAccount.ifscCode'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors['bankAccount.ifscCode'] && <p className="mt-1 text-sm text-red-600">{errors['bankAccount.ifscCode']}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account type</label>
                        <select
                          value={formData.bankAccount.type}
                          onChange={(e) => handleInputChange('bankAccount.type', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors['bankAccount.type'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          {options.bankAccountType.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {errors['bankAccount.type'] && <p className="mt-1 text-sm text-red-600">{errors['bankAccount.type']}</p>}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Tax residency information is optional and can be left empty if not applicable.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 4: Nomination Information */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-1">Nomination Information</h4>
                      <p className="text-sm text-blue-700">Choose whether to add nominees for your account</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Do you want to skip nomination?</label>
                      <div className="space-y-2">
                        {options.skipNomination.map(option => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="radio"
                              name="skipNomination"
                              value={option.value}
                              checked={formData.skipNomination === option.value}
                              onChange={(e) => handleInputChange('skipNomination', e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-900">{option.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.skipNomination && <p className="mt-1 text-sm text-red-600">{errors.skipNomination}</p>}
                    </div>

                    {formData.skipNomination === 'no' && (
                      <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm text-amber-800">
                            <strong>Important:</strong> Total allocation percentage across all nominees must equal 100%.
                          </p>
                        </div>

                        {formData.nominees.map((nominee, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-medium text-gray-900">Nominee {index + 1}</h5>
                              {formData.nominees.length > 1 && (
                                <button
                                  onClick={() => removeNominee(index)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nominee name</label>
                                <input
                                  type="text"
                                  value={nominee.name}
                                  onChange={(e) => handleNomineeChange(index, 'name', e.target.value)}
                                  placeholder="Nominee full name"
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    errors[`nominees.${index}.name`] ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors[`nominees.${index}.name`] && <p className="mt-1 text-sm text-red-600">{errors[`nominees.${index}.name`]}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                                <select
                                  value={nominee.relationship}
                                  onChange={(e) => handleNomineeChange(index, 'relationship', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    errors[`nominees.${index}.relationship`] ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Select relationship</option>
                                  {options.relationship.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                                {errors[`nominees.${index}.relationship`] && <p className="mt-1 text-sm text-red-600">{errors[`nominees.${index}.relationship`]}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
                                <input
                                  type="date"
                                  value={nominee.dob}
                                  onChange={(e) => handleNomineeChange(index, 'dob', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    errors[`nominees.${index}.dob`] ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors[`nominees.${index}.dob`] && <p className="mt-1 text-sm text-red-600">{errors[`nominees.${index}.dob`]}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ID type</label>
                                <select
                                  value={nominee.idType}
                                  onChange={(e) => handleNomineeChange(index, 'idType', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                  {options.idType.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ID number</label>
                                <input
                                  type="text"
                                  value={nominee.idNumber}
                                  onChange={(e) => handleNomineeChange(index, 'idNumber', e.target.value)}
                                  placeholder="ID number"
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    errors[`nominees.${index}.idNumber`] ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors[`nominees.${index}.idNumber`] && <p className="mt-1 text-sm text-red-600">{errors[`nominees.${index}.idNumber`]}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                  type="text"
                                  value={nominee.phone}
                                  onChange={(e) => handleNomineeChange(index, 'phone', e.target.value)}
                                  placeholder="9876543210"
                                  maxLength={10}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    errors[`nominees.${index}.phone`] ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors[`nominees.${index}.phone`] && <p className="mt-1 text-sm text-red-600">{errors[`nominees.${index}.phone`]}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                  type="email"
                                  value={nominee.email}
                                  onChange={(e) => handleNomineeChange(index, 'email', e.target.value)}
                                  placeholder="nominee@example.com"
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    errors[`nominees.${index}.email`] ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors[`nominees.${index}.email`] && <p className="mt-1 text-sm text-red-600">{errors[`nominees.${index}.email`]}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <input
                                  type="text"
                                  value={nominee.address.line}
                                  onChange={(e) => handleNomineeChange(index, 'address.line', e.target.value)}
                                  placeholder="Address line"
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    errors[`nominees.${index}.address.line`] ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors[`nominees.${index}.address.line`] && <p className="mt-1 text-sm text-red-600">{errors[`nominees.${index}.address.line`]}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                                <input
                                  type="text"
                                  value={nominee.address.pincode}
                                  onChange={(e) => handleNomineeChange(index, 'address.pincode', e.target.value)}
                                  placeholder="560034"
                                  maxLength={6}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    errors[`nominees.${index}.address.pincode`] ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors[`nominees.${index}.address.pincode`] && <p className="mt-1 text-sm text-red-600">{errors[`nominees.${index}.address.pincode`]}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Allocation %</label>
                                <input
                                  type="number"
                                  min="0.01"
                                  max="100"
                                  step="0.01"
                                  value={nominee.allocationPercentage}
                                  onChange={(e) => handleNomineeChange(index, 'allocationPercentage', parseFloat(e.target.value) || 0)}
                                  placeholder="50"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center justify-between">
                          <button
                            onClick={addNominee}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            + Add Another Nominee
                          </button>
                          <div className="text-sm text-gray-600">
                            Total allocation: {formData.nominees.reduce((sum, nominee) => sum + (nominee.allocationPercentage || 0), 0)}%
                          </div>
                        </div>

                        {errors.allocation && <p className="text-sm text-red-600">{errors.allocation}</p>}
                      </div>
                    )}
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
                  ) : currentStep === 4 ? (
                    'Complete KYC'
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