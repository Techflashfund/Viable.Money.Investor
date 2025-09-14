'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload, MapPin, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const SignatureStep = ({ formData, onSubmit, loading, errors }) => {
  const [data, setData] = useState({
    signatureFile: null,
    aadhaarNumber: '',
    geolocation: {
      latitude: null,
      longitude: null,
      accuracy: null,
      timestamp: null
    },
    ...formData?.signatureInfo
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [dragActive, setDragActive] = useState(false);

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      setValidationErrors(prev => ({
        ...prev,
        geolocation: 'Geolocation is not supported by this browser'
      }));
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setData(prev => ({
          ...prev,
          geolocation: {
            latitude,
            longitude,
            accuracy,
            timestamp: new Date().toISOString()
          }
        }));
        setLocationPermission('granted');
        setLocationLoading(false);
        
        // Clear geolocation errors
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.geolocation;
          return newErrors;
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services and try again.';
            setLocationPermission('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setValidationErrors(prev => ({ ...prev, geolocation: errorMessage }));
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    );
  };

  // Auto-get location on component mount
  useEffect(() => {
    if (!data.geolocation.latitude) {
      getCurrentLocation();
    }
  }, []);

  // Handle file input change
  const handleFileChange = (file) => {
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setValidationErrors(prev => ({
          ...prev,
          signatureFile: 'Invalid file type. Please upload JPEG, PNG, or PDF files only.'
        }));
        return;
      }

      if (file.size > maxSize) {
        setValidationErrors(prev => ({
          ...prev,
          signatureFile: 'File too large. Maximum size allowed is 5MB.'
        }));
        return;
      }

      setData(prev => ({ ...prev, signatureFile: file }));
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.signatureFile;
        return newErrors;
      });
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Handle input change
  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!data.signatureFile) {
      newErrors.signatureFile = 'Please upload your signature';
    }
    
    if (!data.aadhaarNumber) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!/^[0-9]{12}$/.test(data.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits';
    }
    
    if (!data.geolocation.latitude) {
      newErrors.geolocation = 'Location is required for verification. Please allow location access.';
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
        {/* Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-1">Upload Signature</h4>
          <p className="text-sm text-blue-700">
            Please upload your signature document along with verification details
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Important:</strong> This step is required because your KYC requires manual verification. 
            Please provide your complete Aadhaar number and allow location access for security purposes.
          </AlertDescription>
        </Alert>

        {/* Signature Upload */}
        <div className="space-y-2">
          <Label htmlFor="signature">Signature Document *</Label>
          
          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : data.signatureFile 
                  ? 'border-green-400 bg-green-50' 
                  : validationErrors.signatureFile 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="signature"
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              {data.signatureFile ? (
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <CheckCircle className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-medium">{data.signatureFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(data.signatureFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      Drop your signature file here or <span className="text-blue-600 font-medium">browse</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPEG, PNG, PDF (Max: 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {validationErrors.signatureFile && (
            <p className="text-sm text-red-600">{validationErrors.signatureFile}</p>
          )}
        </div>

        {/* Aadhaar Number */}
        <div className="space-y-2">
          <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
          <Input
            id="aadhaarNumber"
            type="text"
            value={data.aadhaarNumber}
            onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
            placeholder="1234 5678 9012"
            maxLength={12}
            className={validationErrors.aadhaarNumber ? 'border-red-300' : ''}
          />
          {validationErrors.aadhaarNumber && (
            <p className="text-sm text-red-600">{validationErrors.aadhaarNumber}</p>
          )}
          <p className="text-xs text-gray-500">
            Your complete 12-digit Aadhaar number is required for verification
          </p>
        </div>

        {/* Geolocation */}
        <Card className={`border-2 ${
          data.geolocation.latitude 
            ? 'border-green-200' 
            : validationErrors.geolocation 
              ? 'border-red-200' 
              : 'border-gray-200'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className={`w-5 h-5 ${
                  data.geolocation.latitude ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div>
                  <Label className="text-sm font-medium">Location Verification *</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Required for security and compliance purposes
                  </p>
                </div>
              </div>
              
              {!data.geolocation.latitude && (
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  variant="outline"
                  size="sm"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    'Get Location'
                  )}
                </Button>
              )}
            </div>
            
            {data.geolocation.latitude ? (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">Location captured successfully</span>
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Lat: {data.geolocation.latitude.toFixed(6)}, Lng: {data.geolocation.longitude.toFixed(6)}
                  {data.geolocation.accuracy && ` (±${Math.round(data.geolocation.accuracy)}m)`}
                </div>
              </div>
            ) : validationErrors.geolocation ? (
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">{validationErrors.geolocation}</p>
                {locationPermission === 'denied' && (
                  <p className="text-xs text-red-700 mt-1">
                    Please enable location services in your browser settings and refresh the page.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Click "Get Location" to capture your current location</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <FileText className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Privacy & Security:</strong> Your signature, Aadhaar number, and location are securely encrypted 
            and used only for KYC verification purposes. This information helps us comply with regulatory requirements 
            and protect your account.
          </AlertDescription>
        </Alert>

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
                Uploading...
              </>
            ) : (
              'Complete KYC'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignatureStep;