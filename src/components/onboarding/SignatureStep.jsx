import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Check, MapPin, Upload } from 'lucide-react';

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
    aadhaar: /^\d{12}$/
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
        setSuccessMessage('KYC process completed successfully!');
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

  const labelClasses = "block text-sm lg:text-base font-medium text-gray-800 mb-1.5 lg:mb-2";
  const errorClasses = "mt-1 text-xs lg:text-sm text-red-600";
  const helperClasses = "mt-1 text-xs lg:text-sm text-gray-500";

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
          <strong>Complete Verification:</strong> Upload your signature, provide Aadhaar details, and allow location access for final verification
        </AlertDescription>
      </Alert>

      {/* Mobile Info */}
      <div className="lg:hidden p-3 bg-blue-50 rounded-lg border border-blue-400">
        <p className="text-xs text-blue-800">
          <strong>Final Step:</strong> Complete verification with signature, Aadhaar, and location
        </p>
      </div>

      {/* Aadhaar Number Input */}
      <div>
        <label className={labelClasses}>Aadhaar Number *</label>
        <input
          type="text"
          value={formData.aadhaarLastFour}
          onChange={(e) => handleInputChange('aadhaarLastFour', e.target.value)}
          placeholder="123456789012"
          maxLength={12}
          className={inputClasses(errors.aadhaarLastFour)}
        />
        {errors.aadhaarLastFour && <p className={errorClasses}>{errors.aadhaarLastFour}</p>}
        <p className={helperClasses}>
          Your complete 12-digit Aadhaar number is required for verification
        </p>
      </div>

      {/* Location Access */}
      <div>
        <label className={labelClasses}>Location Verification *</label>
        <div className="space-y-3">
          <Button
            onClick={getCurrentLocation}
            disabled={locationLoading || !!geolocation}
            variant={geolocation ? "default" : "outline"}
            className={`w-full lg:w-auto flex items-center justify-center space-x-2 py-3 px-4 text-sm lg:text-base ${
              geolocation 
                ? "bg-green-500 hover:bg-green-600 text-white border-green-500" 
                : "border-blue-400 hover:bg-blue-50 hover:border-blue-500 text-gray-700"
            }`}
          >
            {locationLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
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
            <div className="p-3 bg-green-50 rounded-lg border border-green-400">
              <p className="text-sm text-green-700">
                Location verified (Accuracy: ~{Math.round(geolocation.accuracy)}m)
              </p>
            </div>
          )}
        </div>
        {errors.location && <p className={errorClasses}>{errors.location}</p>}
        <p className={helperClasses}>
          We need your location for security and compliance purposes
        </p>
      </div>

      {/* Signature Upload */}
      <div>
        <label className={labelClasses}>Signature Document *</label>
        <div className="space-y-3">
          {/* Custom File Upload Button */}
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="signature-upload"
            />
            <label
              htmlFor="signature-upload"
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 text-sm lg:text-base ${
                errors.signatureFile 
                  ? 'border-red-400 hover:border-red-500 text-red-700 bg-red-50' 
                  : formData.signatureFile
                    ? 'border-green-400 text-green-700 bg-green-50'
                    : 'border-blue-400 hover:border-blue-500 text-gray-700 hover:bg-blue-50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>
                {formData.signatureFile 
                  ? `Selected: ${formData.signatureFile.name}` 
                  : 'Choose signature file'}
              </span>
            </label>
          </div>

          {formData.signatureFile && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-400">
              <p className="text-sm text-green-700">
                File selected: {formData.signatureFile.name}
              </p>
            </div>
          )}
        </div>
        {errors.signatureFile && <p className={errorClasses}>{errors.signatureFile}</p>}
        <p className={helperClasses}>
          Accepted formats: JPEG, PNG, PDF. Maximum size: 5MB
        </p>
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
            <span>Complete KYC</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SignatureStep;