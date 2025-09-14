'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';

const BasicInfoStep = ({ formData, onSubmit, loading, errors }) => {
  const [data, setData] = useState({
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
    indiaTaxResidencyStatus: 'resident',
    ...formData?.basicInfo
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Form options
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
    ]
  };

  // Validation patterns
  const patterns = {
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    aadhaar: /^\d{4}$/,
    name: /^[A-Za-z ]{1,70}$/,
    place: /^.{2,50}$/
  };

  // Handle input change
  const handleChange = (field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear spouse name if marital status changes to unmarried/others
      if (field === 'maritalStatus') {
        if (value === 'unmarried' || value === 'others') {
          newData.spouseName = '';
        }
      }
      
      return newData;
    });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!patterns.name.test(data.name)) {
      newErrors.name = 'Name must contain only letters and spaces (1-70 characters)';
    }
    if (!patterns.pan.test(data.pan)) {
      newErrors.pan = 'Invalid PAN format (e.g., ABCDE1234F)';
    }
    if (!data.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - new Date(data.dob).getFullYear();
      if (age < 18 || age > 100) {
        newErrors.dob = 'Age must be between 18 and 100 years';
      }
    }
    if (!data.gender) newErrors.gender = 'Gender is required';
    if (!patterns.name.test(data.fatherName)) {
      newErrors.fatherName = 'Father name must contain only letters and spaces';
    }
    if (!patterns.name.test(data.motherName)) {
      newErrors.motherName = 'Mother name must contain only letters and spaces';
    }
    if (!data.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (data.maritalStatus === 'married' && !patterns.name.test(data.spouseName)) {
      newErrors.spouseName = 'Spouse name is required for married status';
    }
    if (!data.occupation) newErrors.occupation = 'Occupation is required';
    if (!data.sourceOfWealth) newErrors.sourceOfWealth = 'Source of wealth is required';
    if (!data.incomeRange) newErrors.incomeRange = 'Income range is required';
    if (!data.countryOfBirth) newErrors.countryOfBirth = 'Country of birth is required';
    if (!patterns.place.test(data.placeOfBirth)) {
      newErrors.placeOfBirth = 'Place of birth is required (2-50 characters)';
    }
    if (!data.politicalExposure) {
      newErrors.politicalExposure = 'Political exposure status is required';
    }
    if (!patterns.aadhaar.test(data.aadhaarLastFour)) {
      newErrors.aadhaarLastFour = 'Last 4 digits of Aadhaar required';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setValidationErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name and PAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full name *</Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your full legal name"
            className={validationErrors.name ? 'border-red-300' : ''}
          />
          {validationErrors.name && (
            <p className="text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pan">PAN number *</Label>
          <Input
            id="pan"
            type="text"
            value={data.pan}
            onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            maxLength={10}
            className={validationErrors.pan ? 'border-red-300' : ''}
          />
          {validationErrors.pan && (
            <p className="text-sm text-red-600">{validationErrors.pan}</p>
          )}
        </div>
      </div>

      {/* DOB and Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of birth *</Label>
          <Input
            id="dob"
            type="date"
            value={data.dob}
            onChange={(e) => handleChange('dob', e.target.value)}
            className={validationErrors.dob ? 'border-red-300' : ''}
          />
          {validationErrors.dob && (
            <p className="text-sm text-red-600">{validationErrors.dob}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label>Gender *</Label>
          <RadioGroup
            value={data.gender}
            onValueChange={(value) => handleChange('gender', value)}
            className="flex flex-col space-y-2"
          >
            {options.gender.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`gender-${option.value}`} />
                <Label htmlFor={`gender-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {validationErrors.gender && (
            <p className="text-sm text-red-600">{validationErrors.gender}</p>
          )}
        </div>
      </div>

      {/* Father and Mother Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fatherName">Father's name *</Label>
          <Input
            id="fatherName"
            type="text"
            value={data.fatherName}
            onChange={(e) => handleChange('fatherName', e.target.value)}
            placeholder="Father's full name"
            className={validationErrors.fatherName ? 'border-red-300' : ''}
          />
          {validationErrors.fatherName && (
            <p className="text-sm text-red-600">{validationErrors.fatherName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="motherName">Mother's name *</Label>
          <Input
            id="motherName"
            type="text"
            value={data.motherName}
            onChange={(e) => handleChange('motherName', e.target.value)}
            placeholder="Mother's full name"
            className={validationErrors.motherName ? 'border-red-300' : ''}
          />
          {validationErrors.motherName && (
            <p className="text-sm text-red-600">{validationErrors.motherName}</p>
          )}
        </div>
      </div>

      {/* Marital Status and Spouse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Marital status *</Label>
          <Select
            value={data.maritalStatus}
            onValueChange={(value) => handleChange('maritalStatus', value)}
          >
            <SelectTrigger className={validationErrors.maritalStatus ? 'border-red-300' : ''}>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              {options.maritalStatus.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.maritalStatus && (
            <p className="text-sm text-red-600">{validationErrors.maritalStatus}</p>
          )}
        </div>

        {data.maritalStatus === 'married' && (
          <div className="space-y-2">
            <Label htmlFor="spouseName">Spouse name *</Label>
            <Input
              id="spouseName"
              type="text"
              value={data.spouseName}
              onChange={(e) => handleChange('spouseName', e.target.value)}
              placeholder="Spouse's full name"
              className={validationErrors.spouseName ? 'border-red-300' : ''}
            />
            {validationErrors.spouseName && (
              <p className="text-sm text-red-600">{validationErrors.spouseName}</p>
            )}
          </div>
        )}
      </div>

      {/* Occupation and Source of Wealth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation *</Label>
          <Select
            value={data.occupation}
            onValueChange={(value) => handleChange('occupation', value)}
          >
            <SelectTrigger className={validationErrors.occupation ? 'border-red-300' : ''}>
              <SelectValue placeholder="Select occupation" />
            </SelectTrigger>
            <SelectContent>
              {options.occupation.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.occupation && (
            <p className="text-sm text-red-600">{validationErrors.occupation}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceOfWealth">Source of wealth *</Label>
          <Select
            value={data.sourceOfWealth}
            onValueChange={(value) => handleChange('sourceOfWealth', value)}
          >
            <SelectTrigger className={validationErrors.sourceOfWealth ? 'border-red-300' : ''}>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {options.sourceOfWealth.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.sourceOfWealth && (
            <p className="text-sm text-red-600">{validationErrors.sourceOfWealth}</p>
          )}
        </div>
      </div>

      {/* Income Range and Country of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="incomeRange">Annual income range *</Label>
          <Select
            value={data.incomeRange}
            onValueChange={(value) => handleChange('incomeRange', value)}
          >
            <SelectTrigger className={validationErrors.incomeRange ? 'border-red-300' : ''}>
              <SelectValue placeholder="Select income range" />
            </SelectTrigger>
            <SelectContent>
              {options.incomeRange.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.incomeRange && (
            <p className="text-sm text-red-600">{validationErrors.incomeRange}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="countryOfBirth">Country of birth *</Label>
          <Select
            value={data.countryOfBirth}
            onValueChange={(value) => handleChange('countryOfBirth', value)}
          >
            <SelectTrigger className={validationErrors.countryOfBirth ? 'border-red-300' : ''}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {options.countryOfBirth.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.countryOfBirth && (
            <p className="text-sm text-red-600">{validationErrors.countryOfBirth}</p>
          )}
        </div>
      </div>

      {/* Place of Birth and Aadhaar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="placeOfBirth">Place of birth *</Label>
          <Input
            id="placeOfBirth"
            type="text"
            value={data.placeOfBirth}
            onChange={(e) => handleChange('placeOfBirth', e.target.value)}
            placeholder="City/Place of birth"
            className={validationErrors.placeOfBirth ? 'border-red-300' : ''}
          />
          {validationErrors.placeOfBirth && (
            <p className="text-sm text-red-600">{validationErrors.placeOfBirth}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aadhaarLastFour">Aadhaar (last 4 digits) *</Label>
          <Input
            id="aadhaarLastFour"
            type="text"
            value={data.aadhaarLastFour}
            onChange={(e) => handleChange('aadhaarLastFour', e.target.value)}
            placeholder="1234"
            maxLength={4}
            className={validationErrors.aadhaarLastFour ? 'border-red-300' : ''}
          />
          {validationErrors.aadhaarLastFour && (
            <p className="text-sm text-red-600">{validationErrors.aadhaarLastFour}</p>
          )}
        </div>
      </div>

      {/* Political Exposure */}
      <div className="space-y-3">
        <Label>Political exposure *</Label>
        <RadioGroup
          value={data.politicalExposure}
          onValueChange={(value) => handleChange('politicalExposure', value)}
          className="flex flex-col space-y-2"
        >
          {options.politicalExposure.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`political-${option.value}`} />
              <Label htmlFor={`political-${option.value}`} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {validationErrors.politicalExposure && (
          <p className="text-sm text-red-600">{validationErrors.politicalExposure}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={loading}
          className="min-w-32"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </form>
  );
};

export default BasicInfoStep;