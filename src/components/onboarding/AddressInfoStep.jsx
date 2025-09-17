import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, ArrowLeft } from 'lucide-react';

// Mobile Horizontal Selector Component
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

const AddressInfoStep = ({ 
  formData, 
  setFormData, 
  transactionId, 
  onNext, 
  onPrevious,
  setKycVerificationStatus,
  setNeedsSignature,
  setMaxSteps 
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://viable-money-be.onrender.com';

  const patterns = {
    phone: /^[6-9]\d{9}$/,
    pincode: /^[1-9][0-9]{5}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    place: /^.{2,50}$/
  };

  const options = {
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
    ]
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.communicationAddress.line?.trim()) newErrors['communicationAddress.line'] = 'Address line is required';
    if (!patterns.place.test(formData.communicationAddress.city)) newErrors['communicationAddress.city'] = 'City is required (2-50 characters)';
    if (!patterns.place.test(formData.communicationAddress.state)) newErrors['communicationAddress.state'] = 'State is required (2-50 characters)';
    if (!patterns.pincode.test(formData.communicationAddress.pincode)) newErrors['communicationAddress.pincode'] = 'Invalid pincode format';
    if (!patterns.phone.test(formData.phone.number)) newErrors['phone.number'] = 'Invalid phone number (10 digits, starting with 6-9)';
    if (!patterns.email.test(formData.email.address)) newErrors['email.address'] = 'Invalid email format';
    
    return newErrors;
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
      const response = await fetch(`${API_BASE_URL}/api/onboarding/address-info/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communicationAddress: formData.communicationAddress,
          phone: formData.phone,
          email: formData.email
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save address information');
      }
      
      if (result.success) {
        // Check KYC verification status from response
        console.log('AddressStep - API result:', result.data);
        
        if (result.data?.kycStatus === 'verified') {
          setKycVerificationStatus(true);
          setSuccessMessage('Address saved and KYC verified! Proceeding to next step...');
        } else if (result.data?.kycStatus === 'no_kyc') {
          console.log('Setting KYC as not verified, enabling signature step');
          setKycVerificationStatus(false);
          setNeedsSignature(true);
          setMaxSteps(5);
          setSuccessMessage('Address information saved. Additional verification required.');
        } else {
          setSuccessMessage('Address information saved successfully!');
        }
        
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
      : 'border-blue-400 hover:border-blue-500 focus:border-blue-500'
    }
  `;

  const selectClasses = (hasError) => `
    w-full bg-transparent border focus:ring-0 focus:outline-none transition-all duration-200
    text-gray-900 
    px-3 py-2 text-sm lg:px-4 lg:py-3 lg:text-base
    ${hasError 
      ? 'border-red-400 focus:border-red-500' 
      : 'border-blue-400 hover:border-blue-500 focus:border-blue-500'
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
          <strong>Communication Address:</strong> Provide your current residential address
        </AlertDescription>
      </Alert>

      {/* Address Line */}
      <div>
        <label className={labelClasses}>Address line *</label>
        <input
          type="text"
          value={formData.communicationAddress.line}
          onChange={(e) => handleInputChange('communicationAddress.line', e.target.value)}
          placeholder="123, MG Road, Bandra West"
          className={inputClasses(errors['communicationAddress.line'])}
        />
        {errors['communicationAddress.line'] && <p className={errorClasses}>{errors['communicationAddress.line']}</p>}
      </div>

      {/* City and State */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>City *</label>
          <input
            type="text"
            value={formData.communicationAddress.city}
            onChange={(e) => handleInputChange('communicationAddress.city', e.target.value)}
            placeholder="Mumbai"
            className={inputClasses(errors['communicationAddress.city'])}
          />
          {errors['communicationAddress.city'] && <p className={errorClasses}>{errors['communicationAddress.city']}</p>}
        </div>

        <div>
          <label className={labelClasses}>State *</label>
          <input
            type="text"
            value={formData.communicationAddress.state}
            onChange={(e) => handleInputChange('communicationAddress.state', e.target.value)}
            placeholder="Maharashtra"
            className={inputClasses(errors['communicationAddress.state'])}
          />
          {errors['communicationAddress.state'] && <p className={errorClasses}>{errors['communicationAddress.state']}</p>}
        </div>
      </div>

      {/* Pincode and Address Nature */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>Pincode *</label>
          <input
            type="text"
            value={formData.communicationAddress.pincode}
            onChange={(e) => handleInputChange('communicationAddress.pincode', e.target.value)}
            placeholder="400050"
            maxLength={6}
            className={inputClasses(errors['communicationAddress.pincode'])}
          />
          {errors['communicationAddress.pincode'] && <p className={errorClasses}>{errors['communicationAddress.pincode']}</p>}
        </div>

        <div>
          <label className={labelClasses}>Address nature</label>
          {/* Mobile Horizontal Selector */}
          <div className="lg:hidden">
            <MobileHorizontalSelector 
              options={options.addressNature}
              value={formData.communicationAddress.nature}
              onChange={(value) => handleInputChange('communicationAddress.nature', value)}
              placeholder="Select address nature"
            />
          </div>
          {/* Desktop Select */}
          <select
            value={formData.communicationAddress.nature}
            onChange={(e) => handleInputChange('communicationAddress.nature', e.target.value)}
            className={`hidden lg:block ${selectClasses(false)}`}
          >
            {options.addressNature.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Phone Number and Belongs To */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>Phone number *</label>
          <input
            type="text"
            value={formData.phone.number}
            onChange={(e) => handleInputChange('phone.number', e.target.value)}
            placeholder="9876543210"
            maxLength={10}
            className={inputClasses(errors['phone.number'])}
          />
          {errors['phone.number'] && <p className={errorClasses}>{errors['phone.number']}</p>}
        </div>

        <div>
          <label className={labelClasses}>Phone belongs to</label>
          {/* Mobile Horizontal Selector */}
          <div className="lg:hidden">
            <MobileHorizontalSelector 
              options={options.belongsTo}
              value={formData.phone.belongsTo}
              onChange={(value) => handleInputChange('phone.belongsTo', value)}
              placeholder="Select owner"
            />
          </div>
          {/* Desktop Select */}
          <select
            value={formData.phone.belongsTo}
            onChange={(e) => handleInputChange('phone.belongsTo', e.target.value)}
            className={`hidden lg:block ${selectClasses(false)}`}
          >
            {options.belongsTo.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Email Address and Belongs To */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>Email address *</label>
          <input
            type="email"
            value={formData.email.address}
            onChange={(e) => handleInputChange('email.address', e.target.value)}
            placeholder="user@example.com"
            className={inputClasses(errors['email.address'])}
          />
          {errors['email.address'] && <p className={errorClasses}>{errors['email.address']}</p>}
        </div>

        <div>
          <label className={labelClasses}>Email belongs to</label>
          {/* Mobile Horizontal Selector */}
          <div className="lg:hidden">
            <MobileHorizontalSelector 
              options={options.belongsTo}
              value={formData.email.belongsTo}
              onChange={(value) => handleInputChange('email.belongsTo', value)}
              placeholder="Select owner"
            />
          </div>
          {/* Desktop Select */}
          <select
            value={formData.email.belongsTo}
            onChange={(e) => handleInputChange('email.belongsTo', e.target.value)}
            className={`hidden lg:block ${selectClasses(false)}`}
          >
            {options.belongsTo.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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

export default AddressInfoStep;