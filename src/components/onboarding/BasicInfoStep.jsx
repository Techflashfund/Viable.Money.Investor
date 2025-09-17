import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

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

const BasicInfoStep = ({ formData, setFormData, transactionId, onNext }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://viable-money-be.onrender.com';

  const patterns = {
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    name: /^[A-Za-z ]{1,70}$/,
    place: /^.{2,50}$/
  };

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
      { value: 'in', label: 'India' }
    ],
    politicalExposure: [
      { value: 'no_exposure', label: 'No Exposure' },
      { value: 'pep', label: 'Politically Exposed Person' },
      { value: 'related_pep', label: 'Related to PEP' }
    ]
  };

  const validate = () => {
    const newErrors = {};
    
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
    if (!formData.politicalExposure) newErrors.politicalExposure = 'Please confirm you have no political exposure';
    
    if (formData.dob) {
      const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
      if (age < 18 || age > 100) newErrors.dob = 'Age must be between 18 and 100 years';
    }
    
    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'maritalStatus') {
        if (value === 'unmarried' || value === 'others') {
          newData.spouseName = '';
        }
      }
      return newData;
    });
    
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
      const response = await fetch(`${API_BASE_URL}/api/onboarding/basic-info/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          nationality: formData.nationality,
          citizenships: formData.citizenships,
          indiaTaxResidencyStatus: formData.indiaTaxResidencyStatus
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save basic information');
      }
      
      if (result.success) {
        setSuccessMessage('Basic information saved successfully! Processing KYC verification...');
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

      {/* Name and PAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>Full name (as per PAN card) *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter name exactly as on PAN card"
            className={inputClasses(errors.name)}
          />
          <p className="mt-1 text-xs text-gray-500">Name must match exactly with your PAN card</p>
          {errors.name && <p className={errorClasses}>{errors.name}</p>}
        </div>

        <div>
          <label className={labelClasses}>PAN number *</label>
          <input
            type="text"
            value={formData.pan}
            onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            maxLength={10}
            className={inputClasses(errors.pan)}
          />
          {errors.pan && <p className={errorClasses}>{errors.pan}</p>}
        </div>
      </div>

      {/* DOB and Gender */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>Date of birth *</label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => handleInputChange('dob', e.target.value)}
            className={inputClasses(errors.dob)}
          />
          {errors.dob && <p className={errorClasses}>{errors.dob}</p>}
        </div>

        <div>
          <label className={labelClasses}>Gender *</label>
          {/* Mobile Horizontal Selector */}
          <div className="lg:hidden">
            <MobileHorizontalSelector 
              options={options.gender}
              value={formData.gender}
              onChange={(value) => handleInputChange('gender', value)}
              placeholder="Select gender"
            />
          </div>
          {/* Desktop Radio Buttons */}
          <div className="hidden lg:block space-y-3 mt-3">
            {options.gender.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="h-4 w-4 text-blue-400 focus:ring-blue-400 border-blue-400"
                />
                <span className="ml-2 text-base text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.gender && <p className={errorClasses}>{errors.gender}</p>}
        </div>
      </div>

      {/* Father's and Mother's Name */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>Father's name *</label>
          <input
            type="text"
            value={formData.fatherName}
            onChange={(e) => handleInputChange('fatherName', e.target.value)}
            placeholder="Father's full name"
            className={inputClasses(errors.fatherName)}
          />
          {errors.fatherName && <p className={errorClasses}>{errors.fatherName}</p>}
        </div>

        <div>
          <label className={labelClasses}>Mother's name *</label>
          <input
            type="text"
            value={formData.motherName}
            onChange={(e) => handleInputChange('motherName', e.target.value)}
            placeholder="Mother's full name"
            className={inputClasses(errors.motherName)}
          />
          {errors.motherName && <p className={errorClasses}>{errors.motherName}</p>}
        </div>
      </div>

      {/* Marital Status and Spouse Name */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>Marital status *</label>
          {/* Mobile Horizontal Selector */}
          <div className="lg:hidden">
            <MobileHorizontalSelector 
              options={options.maritalStatus}
              value={formData.maritalStatus}
              onChange={(value) => handleInputChange('maritalStatus', value)}
              placeholder="Select marital status"
            />
          </div>
          {/* Desktop Select */}
          <select
            value={formData.maritalStatus}
            onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
            className={`hidden lg:block ${selectClasses(errors.maritalStatus)}`}
          >
            <option value="">Select marital status</option>
            {options.maritalStatus.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.maritalStatus && <p className={errorClasses}>{errors.maritalStatus}</p>}
        </div>

        {formData.maritalStatus === 'married' && (
          <div>
            <label className={labelClasses}>Spouse name *</label>
            <input
              type="text"
              value={formData.spouseName}
              onChange={(e) => handleInputChange('spouseName', e.target.value)}
              placeholder="Spouse's full name"
              className={inputClasses(errors.spouseName)}
            />
            {errors.spouseName && <p className={errorClasses}>{errors.spouseName}</p>}
          </div>
        )}
      </div>

      {/* Occupation and Source of Wealth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>Occupation *</label>
          {/* Mobile Horizontal Selector */}
          <div className="lg:hidden">
            <MobileHorizontalSelector 
              options={options.occupation}
              value={formData.occupation}
              onChange={(value) => handleInputChange('occupation', value)}
              placeholder="Select occupation"
            />
          </div>
          {/* Desktop Select */}
          <select
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            className={`hidden lg:block ${selectClasses(errors.occupation)}`}
          >
            <option value="">Select occupation</option>
            {options.occupation.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.occupation && <p className={errorClasses}>{errors.occupation}</p>}
        </div>

        <div>
          <label className={labelClasses}>Source of wealth *</label>
          {/* Mobile Horizontal Selector */}
          <div className="lg:hidden">
            <MobileHorizontalSelector 
              options={options.sourceOfWealth}
              value={formData.sourceOfWealth}
              onChange={(value) => handleInputChange('sourceOfWealth', value)}
              placeholder="Select source"
            />
          </div>
          {/* Desktop Select */}
          <select
            value={formData.sourceOfWealth}
            onChange={(e) => handleInputChange('sourceOfWealth', e.target.value)}
            className={`hidden lg:block ${selectClasses(errors.sourceOfWealth)}`}
          >
            <option value="">Select source</option>
            {options.sourceOfWealth.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.sourceOfWealth && <p className={errorClasses}>{errors.sourceOfWealth}</p>}
        </div>
      </div>

      {/* Income Range and Country of Birth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className={labelClasses}>Annual income range *</label>
          {/* Mobile Horizontal Selector */}
          <div className="lg:hidden">
            <MobileHorizontalSelector 
              options={options.incomeRange}
              value={formData.incomeRange}
              onChange={(value) => handleInputChange('incomeRange', value)}
              placeholder="Select income range"
            />
          </div>
          {/* Desktop Select */}
          <select
            value={formData.incomeRange}
            onChange={(e) => handleInputChange('incomeRange', e.target.value)}
            className={`hidden lg:block ${selectClasses(errors.incomeRange)}`}
          >
            <option value="">Select income range</option>
            {options.incomeRange.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.incomeRange && <p className={errorClasses}>{errors.incomeRange}</p>}
        </div>

        <div>
          <label className={labelClasses}>Country of birth</label>
          <div className="px-3 py-2 text-sm lg:px-4 lg:py-3 lg:text-base text-gray-600 bg-gray-50 border border-gray-300 rounded">
            India
          </div>
        </div>
      </div>

      {/* Place of Birth */}
      <div>
        <label className={labelClasses}>Place of birth *</label>
        <input
          type="text"
          value={formData.placeOfBirth}
          onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
          placeholder="City/Place of birth"
          className={inputClasses(errors.placeOfBirth)}
        />
        {errors.placeOfBirth && <p className={errorClasses}>{errors.placeOfBirth}</p>}
      </div>

      {/* Political Exposure */}
      <div>
        <label className={labelClasses}>Political exposure confirmation *</label>
        <div className="mt-2">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.politicalExposure === 'no_exposure'}
              onChange={(e) => handleInputChange('politicalExposure', e.target.checked ? 'no_exposure' : '')}
              className="h-4 w-4 text-blue-400 focus:ring-blue-400 border-blue-400 mt-1"
            />
            <span className="ml-3 text-sm lg:text-base text-gray-900 leading-relaxed">
              I confirm that I have no political exposure (I am not a politically exposed person and not related to any politically exposed person)
            </span>
          </label>
        </div>
        {errors.politicalExposure && <p className={errorClasses}>{errors.politicalExposure}</p>}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 lg:pt-6">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full lg:w-auto bg-blue-400 hover:bg-blue-500 text-white font-medium py-3 px-6 lg:px-8 text-sm lg:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

export default BasicInfoStep;