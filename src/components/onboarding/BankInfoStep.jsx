import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, ArrowLeft } from 'lucide-react';

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
    if (!formData.bankAccount.type) newErrors['bankAccount.type'] = 'Bank account type is required';
    
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
      const response = await fetch(`${API_BASE_URL}/api/onboarding/bank-tax-info/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankAccount: formData.bankAccount,
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

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errors.api && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{errors.api}</AlertDescription>
        </Alert>
      )}

      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-800">
          <strong>Bank Account Information:</strong> Provide your primary bank account details
        </AlertDescription>
      </Alert>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Account number *</label>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Account holder name *</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">IFSC code *</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Account type *</label>
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

      <Alert className="border-gray-200 bg-gray-50">
        <AlertDescription className="text-gray-600">
          <strong>Note:</strong> Tax residency information is optional and can be left empty if not applicable.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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