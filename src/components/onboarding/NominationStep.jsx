'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2, AlertCircle, Plus, X } from 'lucide-react';

const NominationStep = ({ formData, onSubmit, loading, errors, bankVerificationStatus }) => {
  const [data, setData] = useState({
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
    }],
    ...formData?.nominationInfo
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Form options
  const options = {
    skipNomination: [
      { value: 'yes', label: 'Yes, Skip Nomination' },
      { value: 'no', label: 'No, Add Nominees' }
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
    ]
  };

  // Validation patterns
  const patterns = {
    phone: /^[6-9]\d{9}$/,
    pincode: /^[1-9][0-9]{5}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    nomineeName: /^[A-Za-z ]{1,40}$/
  };

  // Handle input change
  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle nominee change
  const handleNomineeChange = (index, field, value) => {
    setData(prev => {
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

    // Clear validation errors
    const errorKey = `nominees.${index}.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Add nominee
  const addNominee = () => {
    setData(prev => ({
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
    setData(prev => ({
      ...prev,
      nominees: prev.nominees.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!data.skipNomination) {
      newErrors.skipNomination = 'Please select nomination preference';
    }
    
    if (data.skipNomination === 'no') {
      if (!data.nominees || data.nominees.length === 0) {
        newErrors.nominees = 'At least one nominee is required';
        return newErrors;
      }

      data.nominees.forEach((nominee, index) => {
        if (!nominee.name || !patterns.nomineeName.test(nominee.name)) {
          newErrors[`nominees.${index}.name`] = 'Nominee name is required (1-40 characters, letters and spaces only)';
        }
        if (!nominee.relationship) {
          newErrors[`nominees.${index}.relationship`] = 'Nominee relationship is required';
        }
        if (!nominee.dob) {
          newErrors[`nominees.${index}.dob`] = 'Nominee date of birth is required';
        }
        if (!nominee.idNumber) {
          newErrors[`nominees.${index}.idNumber`] = 'Nominee ID number is required';
        }
        if (!patterns.phone.test(nominee.phone)) {
          newErrors[`nominees.${index}.phone`] = 'Invalid nominee phone number';
        }
        if (!patterns.email.test(nominee.email)) {
          newErrors[`nominees.${index}.email`] = 'Invalid nominee email format';
        }
        if (!nominee.address?.line?.trim()) {
          newErrors[`nominees.${index}.address.line`] = 'Nominee address is required';
        }
        if (!patterns.pincode.test(nominee.address?.pincode)) {
          newErrors[`nominees.${index}.address.pincode`] = 'Invalid nominee address pincode';
        }
      });
      
      const totalAllocation = data.nominees.reduce((sum, nominee) => sum + (nominee.allocationPercentage || 0), 0);
      if (Math.abs(totalAllocation - 100) > 0.01) {
        newErrors.allocation = `Total allocation must equal 100%. Current total: ${totalAllocation}%`;
      }
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
    <div className="space-y-6">
      {/* Bank Verification Status Alert */}
      {bankVerificationStatus !== 'pending' && (
        <Alert className={`border-2 ${
          bankVerificationStatus === 'verified' 
            ? 'border-green-200 bg-green-50' 
            : 'border-amber-200 bg-amber-50'
        }`}>
          {bankVerificationStatus === 'verified' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          )}
          <AlertDescription className={
            bankVerificationStatus === 'verified' ? 'text-green-800' : 'text-amber-800'
          }>
            {bankVerificationStatus === 'verified' 
              ? 'Your bank details have been verified successfully!'
              : 'Bank verification is in progress. Manual verification may be required.'
            }
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nomination Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-1">Nomination Information</h4>
          <p className="text-sm text-blue-700">Choose whether to add nominees for your account</p>
        </div>

        {/* Skip Nomination Selection */}
        <div className="space-y-3">
          <Label>Do you want to skip nomination? *</Label>
          <RadioGroup
            value={data.skipNomination}
            onValueChange={(value) => handleChange('skipNomination', value)}
            className="flex flex-col space-y-2"
          >
            {options.skipNomination.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`skip-${option.value}`} />
                <Label htmlFor={`skip-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {validationErrors.skipNomination && (
            <p className="text-sm text-red-600">{validationErrors.skipNomination}</p>
          )}
        </div>

        {/* Nominees Section */}
        {data.skipNomination === 'no' && (
          <div className="space-y-6">
            {/* Allocation Warning */}
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> Total allocation percentage across all nominees must equal 100%.
              </AlertDescription>
            </Alert>

            {/* Nominees List */}
            {data.nominees.map((nominee, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Nominee {index + 1}</h5>
                    {data.nominees.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeNominee(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nominee Name */}
                    <div className="space-y-2">
                      <Label htmlFor={`nominee-name-${index}`}>Nominee name *</Label>
                      <Input
                        id={`nominee-name-${index}`}
                        type="text"
                        value={nominee.name}
                        onChange={(e) => handleNomineeChange(index, 'name', e.target.value)}
                        placeholder="Nominee full name"
                        className={validationErrors[`nominees.${index}.name`] ? 'border-red-300' : ''}
                      />
                      {validationErrors[`nominees.${index}.name`] && (
                        <p className="text-sm text-red-600">{validationErrors[`nominees.${index}.name`]}</p>
                      )}
                    </div>

                    {/* Relationship */}
                    <div className="space-y-2">
                      <Label htmlFor={`nominee-relationship-${index}`}>Relationship *</Label>
                      <Select
                        value={nominee.relationship}
                        onValueChange={(value) => handleNomineeChange(index, 'relationship', value)}
                      >
                        <SelectTrigger className={validationErrors[`nominees.${index}.relationship`] ? 'border-red-300' : ''}>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.relationship.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors[`nominees.${index}.relationship`] && (
                        <p className="text-sm text-red-600">{validationErrors[`nominees.${index}.relationship`]}</p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label htmlFor={`nominee-dob-${index}`}>Date of birth *</Label>
                      <Input
                        id={`nominee-dob-${index}`}
                        type="date"
                        value={nominee.dob}
                        onChange={(e) => handleNomineeChange(index, 'dob', e.target.value)}
                        className={validationErrors[`nominees.${index}.dob`] ? 'border-red-300' : ''}
                      />
                      {validationErrors[`nominees.${index}.dob`] && (
                        <p className="text-sm text-red-600">{validationErrors[`nominees.${index}.dob`]}</p>
                      )}
                    </div>

                    {/* ID Type */}
                    <div className="space-y-2">
                      <Label htmlFor={`nominee-idtype-${index}`}>ID type *</Label>
                      <Select
                        value={nominee.idType}
                        onValueChange={(value) => handleNomineeChange(index, 'idType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.idType.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ID Number */}
                    <div className="space-y-2">
                      <Label htmlFor={`nominee-idnumber-${index}`}>ID number *</Label>
                      <Input
                        id={`nominee-idnumber-${index}`}
                        type="text"
                        value={nominee.idNumber}
                        onChange={(e) => handleNomineeChange(index, 'idNumber', e.target.value)}
                        placeholder="ID number"
                        className={validationErrors[`nominees.${index}.idNumber`] ? 'border-red-300' : ''}
                      />
                      {validationErrors[`nominees.${index}.idNumber`] && (
                        <p className="text-sm text-red-600">{validationErrors[`nominees.${index}.idNumber`]}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor={`nominee-phone-${index}`}>Phone *</Label>
                      <Input
                        id={`nominee-phone-${index}`}
                        type="text"
                        value={nominee.phone}
                        onChange={(e) => handleNomineeChange(index, 'phone', e.target.value)}
                        placeholder="9876543210"
                        maxLength={10}
                        className={validationErrors[`nominees.${index}.phone`] ? 'border-red-300' : ''}
                      />
                      {validationErrors[`nominees.${index}.phone`] && (
                        <p className="text-sm text-red-600">{validationErrors[`nominees.${index}.phone`]}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor={`nominee-email-${index}`}>Email *</Label>
                      <Input
                        id={`nominee-email-${index}`}
                        type="email"
                        value={nominee.email}
                        onChange={(e) => handleNomineeChange(index, 'email', e.target.value)}
                        placeholder="nominee@example.com"
                        className={validationErrors[`nominees.${index}.email`] ? 'border-red-300' : ''}
                      />
                      {validationErrors[`nominees.${index}.email`] && (
                        <p className="text-sm text-red-600">{validationErrors[`nominees.${index}.email`]}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor={`nominee-address-${index}`}>Address *</Label>
                      <Input
                        id={`nominee-address-${index}`}
                        type="text"
                        value={nominee.address.line}
                        onChange={(e) => handleNomineeChange(index, 'address.line', e.target.value)}
                        placeholder="Address line"
                        className={validationErrors[`nominees.${index}.address.line`] ? 'border-red-300' : ''}
                      />
                      {validationErrors[`nominees.${index}.address.line`] && (
                        <p className="text-sm text-red-600">{validationErrors[`nominees.${index}.address.line`]}</p>
                      )}
                    </div>

                    {/* Pincode */}
                    <div className="space-y-2">
                      <Label htmlFor={`nominee-pincode-${index}`}>Pincode *</Label>
                      <Input
                        id={`nominee-pincode-${index}`}
                        type="text"
                        value={nominee.address.pincode}
                        onChange={(e) => handleNomineeChange(index, 'address.pincode', e.target.value)}
                        placeholder="560034"
                        maxLength={6}
                        className={validationErrors[`nominees.${index}.address.pincode`] ? 'border-red-300' : ''}
                      />
                      {validationErrors[`nominees.${index}.address.pincode`] && (
                        <p className="text-sm text-red-600">{validationErrors[`nominees.${index}.address.pincode`]}</p>
                      )}
                    </div>

                    {/* Allocation Percentage */}
                    <div className="space-y-2">
                      <Label htmlFor={`nominee-allocation-${index}`}>Allocation % *</Label>
                      <Input
                        id={`nominee-allocation-${index}`}
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.01"
                        value={nominee.allocationPercentage}
                        onChange={(e) => handleNomineeChange(index, 'allocationPercentage', parseFloat(e.target.value) || 0)}
                        placeholder="50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add/Remove Nominee Controls */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                onClick={addNominee}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Nominee</span>
              </Button>
              <div className="text-sm text-gray-600">
                Total allocation: {data.nominees.reduce((sum, nominee) => sum + (nominee.allocationPercentage || 0), 0)}%
              </div>
            </div>

            {validationErrors.allocation && (
              <p className="text-sm text-red-600">{validationErrors.allocation}</p>
            )}
          </div>
        )}

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
    </div>
  );
};

export default NominationStep;