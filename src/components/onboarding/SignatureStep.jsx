import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Check, MapPin } from 'lucide-react';

const SignatureStep = ({ 
  formData, 
  setFormData, 
  transactionId, 
  onPrevious,
  onFinalComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [geolocation, setGeolocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://viable-money-be.onrender.com';

  const patterns = {
    aadhaar: /^\d{4}$/
  };

  // Get user's geolocation
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, location: 'Geolocation is not supported by this browser' }));
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        setGeolocation(locationData);
        setFormData(prev => ({ ...prev, geolocation: locationData }));
        setLocationLoading(false);
        setErrors(prev => ({ ...prev, location: '' }));
      },
      (error) => {
        console.error('Geolocation error:', error);
        setErrors(prev => ({ 
          ...prev, 
          location: 'Unable to retrieve your location. Please enable location services and try again.' 
        }));
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  }, [setFormData]);

  // Initialize geolocation if already in form data
  useEffect(() => {
    if (formData.geolocation) {
      setGeolocation(formData.geolocation);
    }
  }, [formData.geolocation]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.signatureFile) {
      newErrors.signatureFile = 'Please upload your signature';
    }
    if (!patterns.aadhaar.test(formData.aadhaarLastFour)) {
      newErrors.aadhaarLastFour = 'Aadhaar number must be exactly 12 digits';
    }
    if (!geolocation || !geolocation.latitude || !geolocation.longitude) {
      newErrors.location = 'Location is required for signature verification';
    }
    
    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setErrors({ signatureFile: 'Invalid file type. Please upload JPEG, PNG, or PDF files only.' });
        return;
      }

      if (file.size > maxSize) {
        setErrors({ signatureFile: 'File too large. Maximum size allowed is 5MB.' });
        return;
      }

      setFormData(prev => ({ ...prev, signatureFile: file }));
      setErrors(prev => ({ ...prev, signatureFile: '' }));
    }
  };

  const uploadSignature = async () => {
    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('signature', formData.signatureFile);
      formDataToUpload.append('aadhaarLastFour', formData.aadhaarLastFour);
      formDataToUpload.append('geolocation', JSON.stringify(geolocation));
      
      console.log('Uploading signature with data:', {
        aadhaarLastFour: formData.aadhaarLastFour,
        geolocation
      });

      const response = await fetch(`${API_BASE_URL}/api/onboarding/signature/${transactionId}`, {
        method: 'POST',
        body: formDataToUpload
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Signature upload failed');
      }
      
      return result;
    } catch (error) {
      console.error('Signature Upload Failed:', error);
      throw error;
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
      const result = await uploadSignature();
      
      if (result && result.success) {
        setSuccessMessage('✅ KYC process completed successfully!');
        setTimeout(() => {
          onFinalComplete();
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
          <strong>Complete Verification:</strong> Upload your signature, provide Aadhaar details, and allow location access for final verification
        </AlertDescription>
      </Alert>

      {/* Aadhaar Number Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number *</label>
        <input
          type="text"
          value={formData.aadhaarLastFour}
          onChange={(e) => handleInputChange('aadhaarLastFour', e.target.value)}
          placeholder="123456789012"
          maxLength={12}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.aadhaarLastFour ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.aadhaarLastFour && <p className="mt-1 text-sm text-red-600">{errors.aadhaarLastFour}</p>}
        <p className="mt-2 text-sm text-gray-500">
          Your complete 12-digit Aadhaar number is required for verification
        </p>
      </div>

      {/* Location Access */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location Verification *</label>
        <div className="flex items-center space-x-3">
          <Button
            onClick={getCurrentLocation}
            disabled={locationLoading || !!geolocation}
            variant={geolocation ? "default" : "outline"}
            className={`flex items-center space-x-2 ${geolocation ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            {locationLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Getting Location...</span>
              </>
            ) : geolocation ? (
              <>
                <Check className="w-4 h-4" />
                <span>Location Captured</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>Get Current Location</span>
              </>
            )}
          </Button>
          {geolocation && (
            <span className="text-sm text-green-600">
              Location verified (Accuracy: ~{Math.round(geolocation.accuracy)}m)
            </span>
          )}
        </div>
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
        <p className="mt-2 text-sm text-gray-500">
          We need your location for security and compliance purposes
        </p>
      </div>

      {/* Signature Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Signature Document *</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onChange={handleFileChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.signatureFile ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.signatureFile && <p className="mt-1 text-sm text-red-600">{errors.signatureFile}</p>}
        <p className="mt-2 text-sm text-gray-500">
          Accepted formats: JPEG, PNG, PDF. Maximum size: 5MB
        </p>
      </div>

      {formData.signatureFile && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            File selected: {formData.signatureFile.name}
          </AlertDescription>
        </Alert>
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
          ) : (
            <span>Complete KYC</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SignatureStep;