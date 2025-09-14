'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Info } from 'lucide-react';

const BankInfoStep = ({ formData, onSubmit, loading, errors }) => {
  const [data, setData] = useState({
    bankAccount: {
      number: '',
      primaryHolderName: '',
      ifscCode: '',
      type: 'savings'
    },
    taxResidencies: [],
    ...formData?.bankTaxInfo
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Form options
  const options = {
    bankAccountType: [
      { value: 'savings', label: 'Savings' },
      { value: 'current', label: 'Current' },
      { value: 'nre_savings', label: 'NRE Savings' },
      { value: 'nro_savings', label: 'NRO Savings' }
    ]
  };

  // Validation patterns
  const patterns = {
    bankAccount: /^\d{9,18}$/,
    ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    name: /^[A-Za-z ]{1,70}$/
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
    
    if (!patterns.bankAccount.test(data.bankAccount.number)) {
      newErrors['bankAccount.number'] = 'Bank account number must be 9-18 digits';
    }
    if (!patterns.name.test(data.bankAccount.primaryHolderName)) {
      newErrors['bankAccount.primaryHolderName'] = 'Primary holder name must contain only letters and spaces';
    }
    if (!patterns.ifsc.test(data.bankAccount.ifscCode)) {
      newErrors['bankAccount.ifscCode'] = 'Invalid IFSC code format (e.g., HDFC0001234)';
    }
    if (!data.bankAccount.type) {
      newErrors['bankAccount.type'] = 'Bank account type is required';
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bank Account Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-1">Bank Account Information</h4>
          <p className="text-sm text-blue-700">Provide your primary bank account details for verification</p>
        </div>

        {/* Account Number */}
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account number *</Label>
          <Input
            id="accountNumber"
            type="text"
            value={data.bankAccount.number}
            onChange={(e) => handleChange('bankAccount.number', e.target.value)}
            placeholder="123456789012"
            className={validationErrors['bankAccount.number'] ? 'border-red-300' : ''}
          />
          {validationErrors['bankAccount.number'] && (
            <p className="text-sm text-red-600">{validationErrors['bankAccount.number']}</p>
          )}
        </div>

        {/* Account Holder Name */}
        <div className="space-y-2">
          <Label htmlFor="holderName">Account holder name *</Label>
          <Input
            id="holderName"
            type="text"
            value={data.bankAccount.primaryHolderName}
            onChange={(e) => handleChange('bankAccount.primaryHolderName', e.target.value)}
            placeholder="As per bank records"
            className={validationErrors['bankAccount.primaryHolderName'] ? 'border-red-300' : ''}
          />
          {validationErrors['bankAccount.primaryHolderName'] && (
            <p className="text-sm text-red-600">{validationErrors['bankAccount.primaryHolderName']}</p>
          )}
          <p className="text-xs text-gray-500">
            Name should match exactly as per your bank account
          </p>
        </div>

        {/* IFSC Code and Account Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC code *</Label>
            <Input
              id="ifscCode"
              type="text"
              value={data.bankAccount.ifscCode}
              onChange={(e) => handleChange('bankAccount.ifscCode', e.target.value.toUpperCase())}
              placeholder="HDFC0001234"
              maxLength={11}
              className={validationErrors['bankAccount.ifscCode'] ? 'border-red-300' : ''}
            />
            {validationErrors['bankAccount.ifscCode'] && (
              <p className="text-sm text-red-600">{validationErrors['bankAccount.ifscCode']}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Account type *</Label>
            <Select
              value={data.bankAccount.type}
              onValueChange={(value) => handleChange('bankAccount.type', value)}
            >
              <SelectTrigger className={validationErrors['bankAccount.type'] ? 'border-red-300' : ''}>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {options.bankAccountType.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors['bankAccount.type'] && (
              <p className="text-sm text-red-600">{validationErrors['bankAccount.type']}</p>
            )}
          </div>
        </div>

        {/* Bank Verification Info */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Bank Verification:</strong> Your bank details will be automatically verified. 
            This may take a few moments to complete. Ensure all details are accurate to avoid verification delays.
          </AlertDescription>
        </Alert>

        {/* Tax Residency Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-1">Tax Residency Information</h4>
          <p className="text-sm text-gray-600">
            Tax residency information is optional and can be left empty if not applicable. 
            Most Indian residents can skip this section.
          </p>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Account holder name must match exactly with your PAN name</li>
            <li>• Only active bank accounts are accepted</li>
            <li>• Account should have sufficient transaction history</li>
            <li>• Joint accounts are not supported for KYC verification</li>
          </ul>
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
                Verifying...
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

export default BankInfoStep;