import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, ArrowLeft,Check } from 'lucide-react';

const MobileHorizontalSelector = ({ options, value, onChange, placeholder }) => {
  return (
    <div className="relative">
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap ${
              value === option.value 
                ? 'bg-blue-400 text-white border-blue-400' 
                : 'bg-transparent border-blue-400 text-gray-700 hover:border-blue-500'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {!value && (
        <p className="text-xs text-gray-500 mt-1">Scroll to see more options</p>
      )}
    </div>
  );
};

const BankInfoStep = ({ 
  formData, 
  setFormData, 
  transactionId, 
  onNext, 
  onPrevious,
  setBankVerificationStatus
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [ifscValidating, setIfscValidating] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://viable-money-be.onrender.com';

  const patterns = {
    bankAccount: /^\d{9,18}$/,
    ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    name: /^[A-Za-z ]{1,70}$/
  };

  const options = {
    bankAccountType: [
      { value: 'savings', label: 'Savings' },
      { value: 'current', label: 'Current' },
      { value: 'nre_savings', label: 'NRE Savings' },
      { value: 'nro_savings', label: 'NRO Savings' }
    ]
  };

  const validate = () => {
    const newErrors = {};
    
    if (!patterns.bankAccount.test(formData.bankAccount.number)) newErrors['bankAccount.number'] = 'Bank account number must be 9-18 digits';
    if (!patterns.name.test(formData.bankAccount.primaryHolderName)) newErrors['bankAccount.primaryHolderName'] = 'Primary holder name must contain only letters and spaces';
    if (!patterns.ifsc.test(formData.bankAccount.ifscCode)) newErrors['bankAccount.ifscCode'] = 'Invalid IFSC code format (e.g., HDFC0001234)';
    if (!bankDetails && formData.bankAccount.ifscCode) newErrors['bankAccount.ifscCode'] = 'Please verify your IFSC code';
    
    return newErrors;
  };

  // Validate IFSC code using Razorpay API
  const validateIfscCode = async (ifscCode) => {
    if (!patterns.ifsc.test(ifscCode)) {
      setBankDetails(null);
      return;
    }

    setIfscValidating(true);
    try {
      const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`);
      
      if (response.ok) {
        const bankData = await response.json();
        setBankDetails(bankData);
        setErrors(prev => ({ ...prev, 'bankAccount.ifscCode': '' }));
      } else {
        setBankDetails(null);
        setErrors(prev => ({ ...prev, 'bankAccount.ifscCode': 'Invalid IFSC code or bank not found' }));
      }
    } catch (error) {
      setBankDetails(null);
      setErrors(prev => ({ ...prev, 'bankAccount.ifscCode': 'Unable to verify IFSC code. Please check your connection.' }));
    } finally {
      setIfscValidating(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
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

      // Validate IFSC code when it changes
      if (field === 'bankAccount.ifscCode') {
        setBankDetails(null); // Clear previous bank details
        if (value && value.length === 11) {
          validateIfscCode(value);
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/onboarding/bank-tax-info/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankAccount: {
            ...formData.bankAccount,
            type: 'savings' // Always set to savings
          },
          taxResidencies: formData.taxResidencies
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save bank information');
      }
      
      if (result.success) {
        // Check bank verification status from response
        if (result.data?.bankVerificationStatus === 'verified') {
          setBankVerificationStatus(true);
        } else if (result.data?.bankVerificationStatus === 'failed') {
          setBankVerificationStatus(false);
        }

        setSuccessMessage('Bank information saved successfully! Processing bank verification...');
        setTimeout(() => {
          onNext();
          setSuccessMessage('');
        }, 1500);
      }
    } catch (error) {
      setErrors({ api: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Common input classes
  const inputClasses = (hasError) => `
    w-full bg-transparent border focus:ring-0 focus:outline-none transition-all duration-200
    text-gray-900 placeholder-gray-500 
    px-3 py-2 text-sm lg:px-4 lg:py-3 lg:text-base
    ${hasError 
      ? 'border-red-400 focus:border-red-500' 
      : 'border-gray-300 hover:border-gray-400 focus:border-gray-500'
    }
  `;

  const labelClasses = "block text-sm lg:text-base font-medium text-gray-800 mb-1.5 lg:mb-2";
  const errorClasses = "mt-1 text-xs lg:text-sm text-red-600";

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Alerts */}
      {successMessage && (
        <Alert className="border-green-400 bg-green-50/50 backdrop-blur-sm">
          <AlertDescription className="text-green-800 text-sm lg:text-base">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errors.api && (
        <Alert className="border-red-400 bg-red-50/50 backdrop-blur-sm">
          <AlertDescription className="text-red-800 text-sm lg:text-base">{errors.api}</AlertDescription>
        </Alert>
      )}

      {/* Info Alert - Only show on desktop */}
      <Alert className="hidden lg:block border-blue-400 bg-blue-50/50 backdrop-blur-sm">
        <AlertDescription className="text-blue-800">
          <strong>Bank Account Information:</strong> Provide your primary bank account details
        </AlertDescription>
      </Alert>

      {/* Account Number */}
      <div>
        <label className={labelClasses}>Account number *</label>
        <input
          type="number"
          value={formData.bankAccount.number}
          onChange={(e) => handleInputChange('bankAccount.number', e.target.value)}
          placeholder="123456789012"
          className={inputClasses(errors['bankAccount.number'])}
        />
        {errors['bankAccount.number'] && <p className={errorClasses}>{errors['bankAccount.number']}</p>}
      </div>

      {/* Account Holder Name */}
      <div>
        <label className={labelClasses}>Account holder name (as per bank records) *</label>
        <input
          type="text"
          value={formData.bankAccount.primaryHolderName}
          onChange={(e) => handleInputChange('bankAccount.primaryHolderName', e.target.value)}
          placeholder="Enter name exactly as in bank records"
          className={inputClasses(errors['bankAccount.primaryHolderName'])}
        />
        <p className="mt-1 text-xs text-gray-500">Name must match exactly with your bank account</p>
        {errors['bankAccount.primaryHolderName'] && <p className={errorClasses}>{errors['bankAccount.primaryHolderName']}</p>}
      </div>

      {/* IFSC Code and Account Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>IFSC code *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.bankAccount.ifscCode}
              onChange={(e) => handleInputChange('bankAccount.ifscCode', e.target.value.toUpperCase())}
              placeholder="HDFC0001234"
              maxLength={11}
              className={inputClasses(errors['bankAccount.ifscCode'])}
            />
            {ifscValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {bankDetails && !ifscValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Check className="w-4 h-4 text-green-600" />
              </div>
            )}
          </div>
          
          {/* Bank Details Display */}
          {bankDetails && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">{bankDetails.BANK} • {bankDetails.BRANCH}</p>
            </div>
          )}
          
          {errors['bankAccount.ifscCode'] && <p className={errorClasses}>{errors['bankAccount.ifscCode']}</p>}
        </div>

        <div>
          <label className={labelClasses}>Account type</label>
          <div className="px-3 py-2 text-sm lg:px-4 lg:py-3 lg:text-base text-gray-700 bg-gray-50 border border-gray-300 rounded">
            Savings
          </div>
          <p className="mt-1 text-xs text-gray-500">Default account type</p>
        </div>
      </div>

   

      {/* Navigation Buttons */}
      <div className="flex flex-col lg:flex-row justify-between gap-3 lg:gap-0 pt-4 lg:pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="order-2 lg:order-1 w-full lg:w-auto border-blue-400 hover:bg-blue-50 hover:border-blue-500 text-gray-700 font-medium py-3 px-6 lg:px-8 text-sm lg:text-base transition-colors flex items-center justify-center lg:justify-start space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="order-1 lg:order-2 w-full lg:w-auto bg-blue-400 hover:bg-blue-500 text-white font-medium py-3 px-6 lg:px-8 text-sm lg:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BankInfoStep;