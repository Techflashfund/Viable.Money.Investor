'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const AddressInfoStep = ({ formData, onSubmit, loading, errors, kycStatus }) => {
  const [data, setData] = useState({
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
    ...formData?.addressInfo
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Form options
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

  // Validation patterns
  const patterns = {
    phone: /^[6-9]\d{9}$/,
    pincode: /^[1-9][0-9]{5}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    place: /^.{2,50}$/
  };

  // Handle input change
  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setData(prev => {
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
      setData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!data.communicationAddress.line?.trim()) {
      newErrors['communicationAddress.line'] = 'Address line is required';
    }
    if (!patterns.place.test(data.communicationAddress.city)) {
      newErrors['communicationAddress.city'] = 'City is required (2-50 characters)';
    }
    if (!patterns.place.test(data.communicationAddress.state)) {
      newErrors['communicationAddress.state'] = 'State is required (2-50 characters)';
    }
    if (!patterns.pincode.test(data.communicationAddress.pincode)) {
      newErrors['communicationAddress.pincode'] = 'Invalid pincode format';
    }
    if (!patterns.phone.test(data.phone.number)) {
      newErrors['phone.number'] = 'Invalid phone number (10 digits, starting with 6-9)';
    }
    if (!patterns.email.test(data.email.address)) {
      newErrors['email.address'] = 'Invalid email format';
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
      {/* KYC Status Alert */}
      {kycStatus !== 'pending' && (
        <Alert className={`border-2 ${
          kycStatus === 'verified' 
            ? 'border-green-200 bg-green-50' 
            : 'border-amber-200 bg-amber-50'
        }`}>
          {kycStatus === 'verified' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          )}
          <AlertDescription className={
            kycStatus === 'verified' ? 'text-green-800' : 'text-amber-800'
          }>
            {kycStatus === 'verified' 
              ? 'Your KYC has been verified successfully!'
              : 'KYC verification is pending. You may need to provide additional documents later.'
            }
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Communication Address Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-1">Communication Address</h4>
          <p className="text-sm text-blue-700">Provide your current residential address</p>
        </div>

        {/* Address Line */}
        <div className="space-y-2">
          <Label htmlFor="addressLine">Address line *</Label>
          <Input
            id="addressLine"
            type="text"
            value={data.communicationAddress.line}
            onChange={(e) => handleChange('communicationAddress.line', e.target.value)}
            placeholder="123, MG Road, Bandra West"
            className={validationErrors['communicationAddress.line'] ? 'border-red-300' : ''}
          />
          {validationErrors['communicationAddress.line'] && (
            <p className="text-sm text-red-600">{validationErrors['communicationAddress.line']}</p>
          )}
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              type="text"
              value={data.communicationAddress.city}
              onChange={(e) => handleChange('communicationAddress.city', e.target.value)}
              placeholder="Mumbai"
              className={validationErrors['communicationAddress.city'] ? 'border-red-300' : ''}
            />
            {validationErrors['communicationAddress.city'] && (
              <p className="text-sm text-red-600">{validationErrors['communicationAddress.city']}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              type="text"
              value={data.communicationAddress.state}
              onChange={(e) => handleChange('communicationAddress.state', e.target.value)}
              placeholder="Maharashtra"
              className={validationErrors['communicationAddress.state'] ? 'border-red-300' : ''}
            />
            {validationErrors['communicationAddress.state'] && (
              <p className="text-sm text-red-600">{validationErrors['communicationAddress.state']}</p>
            )}
          </div>
        </div>

        {/* Pincode and Address Nature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              type="text"
              value={data.communicationAddress.pincode}
              onChange={(e) => handleChange('communicationAddress.pincode', e.target.value)}
              placeholder="400050"
              maxLength={6}
              className={validationErrors['communicationAddress.pincode'] ? 'border-red-300' : ''}
            />
            {validationErrors['communicationAddress.pincode'] && (
              <p className="text-sm text-red-600">{validationErrors['communicationAddress.pincode']}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressNature">Address nature *</Label>
            <Select
              value={data.communicationAddress.nature}
              onValueChange={(value) => handleChange('communicationAddress.nature', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select address nature" />
              </SelectTrigger>
              <SelectContent>
                {options.addressNature.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Phone Number and Belongs To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone number *</Label>
            <Input
              id="phoneNumber"
              type="text"
              value={data.phone.number}
              onChange={(e) => handleChange('phone.number', e.target.value)}
              placeholder="9876543210"
              maxLength={10}
              className={validationErrors['phone.number'] ? 'border-red-300' : ''}
            />
            {validationErrors['phone.number'] && (
              <p className="text-sm text-red-600">{validationErrors['phone.number']}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneBelongsTo">Phone belongs to *</Label>
            <Select
              value={data.phone.belongsTo}
              onValueChange={(value) => handleChange('phone.belongsTo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {options.belongsTo.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Email Address and Belongs To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emailAddress">Email address *</Label>
            <Input
              id="emailAddress"
              type="email"
              value={data.email.address}
              onChange={(e) => handleChange('email.address', e.target.value)}
              placeholder="user@example.com"
              className={validationErrors['email.address'] ? 'border-red-300' : ''}
            />
            {validationErrors['email.address'] && (
              <p className="text-sm text-red-600">{validationErrors['email.address']}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailBelongsTo">Email belongs to *</Label>
            <Select
              value={data.email.belongsTo}
              onValueChange={(value) => handleChange('email.belongsTo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {options.belongsTo.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
    </div>
  );
};

export default AddressInfoStep;