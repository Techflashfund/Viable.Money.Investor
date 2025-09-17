import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';

const NominationStep = ({ 
  formData, 
  setFormData, 
  transactionId, 
  onNext, 
  onPrevious,
  needsSignature,
  kycVerificationStatus,
  setBankVerificationStatus,
  onFinalComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://viable-money-be.onrender.com';

  const patterns = {
    phone: /^[6-9]\d{9}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    pincode: /^[1-9][0-9]{5}$/,
    nomineeName: /^[A-Za-z ]{1,40}$/
  };

  const options = {
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

  const validate = () => {
    const newErrors = {};
    
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
      
      const totalAllocation = formData.nominees.reduce((sum, nominee) => sum + (nominee.allocationPercentage || 0), 0);
      if (totalAllocation !== 100) {
        newErrors.allocation = `Total allocation must equal 100%. Current total: ${totalAllocation}%`;
      }
    }
    
    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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

  const removeNominee = (index) => {
    setFormData(prev => ({
      ...prev,
      nominees: prev.nominees.filter((_, i) => i !== index)
    }));
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
      const payload = {
        skipNomination: formData.skipNomination,
        displaySetting: formData.displaySetting
      };
      
      if (formData.skipNomination === 'no') {
        payload.nominees = formData.nominees.filter(nominee => nominee.name);
      }

      const response = await fetch(`${API_BASE_URL}/api/onboarding/nomination-info/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save nomination information');
      }
      
      if (result.success) {
        if (result.data?.bankVerificationStatus === 'verified') {
          setBankVerificationStatus(true);
        } else if (result.data?.bankVerificationStatus === 'failed') {
          setBankVerificationStatus(false);
        }

        // Check if signature step is needed
        console.log('NominationStep - needsSignature:', needsSignature);
        console.log('NominationStep - kycVerificationStatus:', kycVerificationStatus);
        
        if (needsSignature || kycVerificationStatus === false) {
          setSuccessMessage('Nomination information saved! Please upload your signature and provide Aadhaar details.');
          setTimeout(() => {
            onNext();
            setSuccessMessage('');
          }, 1000);
        } else {
          setSuccessMessage('✅ KYC process completed successfully!');
          setTimeout(() => {
            onFinalComplete();
          }, 1500);
        }
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
          <strong>Nomination Information:</strong> Choose whether to add nominees for your account
        </AlertDescription>
      </Alert>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Do you want to skip nomination? *</label>
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
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> Total allocation percentage across all nominees must equal 100%.
            </AlertDescription>
          </Alert>

          {formData.nominees.map((nominee, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900">Nominee {index + 1}</h5>
                {formData.nominees.length > 1 && (
                  <Button
                    onClick={() => removeNominee(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nominee name *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID number *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allocation % *</label>
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
            <Button
              onClick={addNominee}
              variant="outline"
              className="text-blue-600 hover:text-blue-800 border-blue-300 hover:border-blue-400 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Nominee</span>
            </Button>
            <div className="text-sm text-gray-600">
              Total allocation: {formData.nominees.reduce((sum, nominee) => sum + (nominee.allocationPercentage || 0), 0)}%
            </div>
          </div>

          {errors.allocation && <p className="text-sm text-red-600">{errors.allocation}</p>}
        </div>
      )}

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
          ) : needsSignature || kycVerificationStatus === false ? (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <span>Complete KYC</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NominationStep;