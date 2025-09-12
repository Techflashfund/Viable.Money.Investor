'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Circle, X, ChevronDown, Check, AlertCircle, RefreshCw } from 'lucide-react';
import useAuthStore from '@/store/auth';
import createApiService from '@/services/api';

const AuthPage = () => {
  const router = useRouter();
  
  // Initialize API service
  const baseUrl ='https://viable-money-be.onrender.com';
  const apiService = createApiService(baseUrl);
  
  // Zustand auth store
  const { 
    user, 
    isAuthenticated, 
    setAuth, 
    clearAuth, 
    setLoading: setAuthLoading,
    isLoading: authLoading,
    updateOnboardingStatus,
    updateTransactionId
  } = useAuthStore();
  
  // Local component state
  const [mode, setMode] = useState('login');
  const [currentStep, setCurrentStep] = useState(1);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    identifier: '',
    otp: '',
    pin: '',
    confirmPin: '',
    captcha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Function definitions
  const handleLogout = () => {
    clearAuth();
    switchMode('login');
  };

  const dismissError = () => setError('');
  const dismissSuccess = () => setSuccess('');

  const dismissValidationError = (field) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateField = (field, value) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'phone':
        if (value && !/^[6-9]\d{9}$/.test(value)) {
          errors.phone = 'Please enter a valid 10-digit mobile number';
        } else {
          delete errors.phone;
        }
        break;
      case 'username':
        if (value && value.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else {
          delete errors.username;
        }
        break;
      case 'identifier':
        if (value && value.trim().length === 0) {
          errors.identifier = 'This field is required';
        } else {
          delete errors.identifier;
        }
        break;
      case 'pin':
        if (value && value.length !== 4) {
          errors.pin = 'PIN must be exactly 4 digits';
        } else {
          delete errors.pin;
        }
        break;
      case 'confirmPin':
        if (value && value !== formData.pin) {
          errors.confirmPin = 'PINs do not match';
        } else {
          delete errors.confirmPin;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const checkOnboardingStatus = async (transactionId) => {
    if (!transactionId) {
      console.log('No transactionId available for onboarding status check');
      updateOnboardingStatus(false);
      return false;
    }

    try {
      const response = await fetch(
        `https://viable-money-be.onrender.com/api/onboarding/status/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.status === 404) {
        updateOnboardingStatus(false);
        return false;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const status = data.data.status;
        const completedStatuses = ['signature_pending', 'completed', 'submitted'];
        const isOnboardingComplete = completedStatuses.includes(status);
        
        updateOnboardingStatus(isOnboardingComplete);
        return isOnboardingComplete;
      } else {
        updateOnboardingStatus(false);
        return false;
      }
      
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      updateOnboardingStatus(false);
      return false;
    }
  };

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    let question;
    
    switch (operator) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        answer = larger - smaller;
        question = `${larger} - ${smaller}`;
        break;
      case '*':
        const smallNum1 = Math.floor(Math.random() * 5) + 1;
        const smallNum2 = Math.floor(Math.random() * 5) + 1;
        answer = smallNum1 * smallNum2;
        question = `${smallNum1} × ${smallNum2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }
    
    setCaptchaQuestion({ question, answer });
    setCaptchaVerified(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setCurrentStep(1);
    setFormData({
      username: '',
      phone: '',
      email: '',
      identifier: '',
      otp: '',
      pin: '',
      confirmPin: '',
      captcha: ''
    });
    setLoading(false);
    setError('');
    setSuccess('');
    setCaptchaVerified(false);
    setUsernameAvailable(null);
    setValidationErrors({});
    generateCaptcha();
  };

  const handleError = (error) => {
    setLoading(false);
    setAuthLoading(false);
    const errorMessage = error.message || 'An unexpected error occurred';
    setError(errorMessage);
    setSuccess('');
  };

  const handleSuccess = (message) => {
    setError('');
    setSuccess(message);
  };

  // Check username availability with debouncing
  useEffect(() => {
    if (mode === 'signup' && formData.username && formData.username.length >= 3) {
      const timeoutId = setTimeout(async () => {
        setCheckingUsername(true);
        try {
          const response = await apiService.checkUsername(formData.username);
          setUsernameAvailable(response.data.available);
        } catch (error) {
          console.error('Username check failed:', error);
          setUsernameAvailable(null);
        }
        setCheckingUsername(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username, mode, apiService]);

  // Initialize captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
    
    if (field === 'captcha') {
      const isCorrect = parseInt(value) === captchaQuestion.answer;
      setCaptchaVerified(isCorrect);
    }

    if (error) {
      setError('');
    }
  };

  const refreshCaptcha = () => {
    generateCaptcha();
    setFormData(prev => ({ ...prev, captcha: '' }));
    setCaptchaVerified(false);
  };

  // API handlers
  const handleSendOTP = async () => {
    if (!captchaVerified) {
      setError('Please solve the captcha correctly');
      return;
    }
    
    if (mode === 'signup' && usernameAvailable === false) {
      setError('Username is not available. Please choose a different one.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone
      };
      
      const response = await apiService.register(registrationData);
      handleSuccess(response.message || 'OTP sent successfully to your email');
      setCurrentStep(2);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.verifyOTP(formData.email, formData.otp);
      handleSuccess(response.message || 'OTP verified successfully');
      setCurrentStep(3);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.resendOTP(formData.email);
      handleSuccess(response.message || 'OTP sent again successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRequest = async () => {
    if (!captchaVerified) {
      setError('Please solve the captcha correctly');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.loginRequest(formData.identifier);
      handleSuccess(response.message || 'OTP sent to your registered email');
      setCurrentStep(2);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendLoginOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.resendLoginOTP(formData.identifier);
      handleSuccess(response.message || 'Login OTP sent again successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setAuthLoading(true);
    setError('');
    
    try {
      if (mode === 'signup') {
        if (formData.pin !== formData.confirmPin) {
          setError('PIN and Confirm PIN must match');
          return;
        }

        const response = await apiService.setPIN(formData.email, formData.pin, formData.confirmPin);
        setAuth(response.data, response.token);
        updateTransactionId(response.data.transactionId);
        await checkOnboardingStatus(response.data.transactionId);
        router.push('/');
        
      } else {
        const response = await apiService.loginVerify(formData.identifier, formData.otp, formData.pin);
        setAuth(response.data, response.token);
        updateTransactionId(response.data.transactionId);
        await checkOnboardingStatus(response.data.transactionId);
        router.push('/');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  const getStepCount = () => 3;

  const getStepTitle = () => {
    if (mode === 'signup') {
      switch (currentStep) {
        case 1: return 'Create Your Account';
        case 2: return 'Verify Your Email';
        case 3: return 'Secure Your Account';
        default: return '';
      }
    } else {
      switch (currentStep) {
        case 1: return 'Welcome Back';
        case 2: return 'Verify Your Identity';
        case 3: return 'Enter Your PIN';
        default: return '';
      }
    }
  };

  const getStepSubtitle = () => {
    if (mode === 'signup') {
      switch (currentStep) {
        case 1: return 'Join thousands of investors building wealth through mutual funds';
        case 2: return `Enter the OTP sent to ${formData.email}`;
        case 3: return 'Set a 4-digit PIN for secure account access';
        default: return '';
      }
    } else {
      switch (currentStep) {
        case 1: return 'Sign in to access your investment portfolio';
        case 2: return `Enter the OTP sent to your registered email`;
        case 3: return 'Enter your 4-digit security PIN';
        default: return '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col lg:flex-row">
      {/* Left Section - Information */}
      <div className={`flex-1 flex flex-col relative transition-all duration-500 min-h-screen lg:min-h-0 ${showMobileForm ? 'lg:flex hidden' : 'flex'}`}>
        {/* Header */}
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="InvestFund Logo" 
                className="h-10 lg:h-14 object-contain"
              />
            </div>
            
            {isAuthenticated && user && (
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">
                      {user.username || user.email || 'User'}
                    </p>
                    <p className="text-gray-600 hidden lg:block text-xs">{user.email}</p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="text-xs px-3 py-1"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 pb-8">
          <div className="max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-medium text-gray-900 mb-6 leading-tight">
              Smart Investing
              <span className="text-blue-600 block">Made Simple</span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Start your investment journey with India's leading mutual fund platform. 
              Discover, invest, and track your portfolio with personalized recommendations 
              and real-time market insights.
            </p>

            

            {/* Mobile CTA */}
            <div className="lg:hidden">
              <Button
                onClick={() => setShowMobileForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-lg shadow-lg"
                size="lg"
              >
                Get Started
                <ChevronDown className="w-5 h-5 ml-2 rotate-[-90deg]" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className={`flex-1 flex items-center justify-center p-4 lg:p-8 transition-all duration-500 ${
        showMobileForm ? 'flex' : 'hidden lg:flex'
      }`}>
        <div className="w-full max-w-md">
          {/* Mobile close button */}
          {showMobileForm && (
            <div className="lg:hidden flex justify-end mb-4">
              <Button
                onClick={() => setShowMobileForm(false)}
                variant="outline"
                size="sm"
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-8 space-y-6">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all ${
                  mode === 'login'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              {Array.from({ length: getStepCount() }, (_, i) => i + 1).map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < getStepCount() && (
                    <div className={`w-12 h-1 mx-2 rounded-full ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <button onClick={dismissError} className="text-red-600 hover:text-red-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
                <button onClick={dismissSuccess} className="text-green-600 hover:text-green-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-medium text-gray-900">{getStepTitle()}</h2>
                  <p className="text-gray-600 mt-2">{getStepSubtitle()}</p>
                </div>

                {mode === 'signup' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium text-gray-700 font-sans">
                        Username
                      </Label>
                      <div className="relative">
                        <Input
                          id="username"
                          type="text"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          placeholder="johndoe123"
                          className={`h-12 pr-10 font-sans ${
                            usernameAvailable === true ? 'border-green-400' : 
                            usernameAvailable === false ? 'border-red-400' : ''
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {checkingUsername ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : usernameAvailable === true ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : usernameAvailable === false ? (
                            <X className="w-4 h-4 text-red-600" />
                          ) : null}
                        </div>
                      </div>
                      {validationErrors.username && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <p className="text-xs text-red-600 font-sans">{validationErrors.username}</p>
                          </div>
                          <button onClick={() => dismissValidationError('username')} className="text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {usernameAvailable === false && (
                        <p className="text-xs text-red-600 font-sans">Username is already taken</p>
                      )}
                      {usernameAvailable === true && (
                        <p className="text-xs text-green-600 font-sans">Username is available</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="9876543210"
                          className="h-12 pr-10"
                        />
                        {formData.phone && !validationErrors.phone && /^[6-9]\d{9}$/.test(formData.phone) && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                      </div>
                      {validationErrors.phone && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <p className="text-xs text-red-600">{validationErrors.phone}</p>
                          </div>
                          <button onClick={() => dismissValidationError('phone')} className="text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">Enter 10-digit mobile number starting with 6-9</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your@email.com"
                          className="h-12 pr-10"
                        />
                        {formData.email && !validationErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                      </div>
                      {validationErrors.email && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <p className="text-xs text-red-600">{validationErrors.email}</p>
                          </div>
                          <button onClick={() => dismissValidationError('email')} className="text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {mode === 'login' && (
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                      Username, Email or Phone
                    </Label>
                    <div className="relative">
                      <Input
                        id="identifier"
                        type="text"
                        value={formData.identifier}
                        onChange={(e) => handleInputChange('identifier', e.target.value)}
                        placeholder="johndoe123 or your@email.com or 9876543210"
                        className="h-12 pr-10"
                      />
                      {formData.identifier && formData.identifier.trim().length > 0 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </div>
                    {validationErrors.identifier && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-xs text-red-600">{validationErrors.identifier}</p>
                        </div>
                        <button onClick={() => dismissValidationError('identifier')} className="text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Enter your username, email address, or phone number</p>
                  </div>
                )}

                {/* Captcha */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                  <Label className="text-sm font-medium text-gray-700">
                    Security Verification
                  </Label>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white px-4 py-3 border-2 border-dashed border-gray-300 rounded font-mono text-lg font-bold text-gray-800 min-w-24 text-center">
                        {captchaQuestion.question} = ?
                      </div>
                      <Button
                        type="button"
                        onClick={refreshCaptcha}
                        variant="outline"
                        size="sm"
                        className="p-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.captcha}
                        onChange={(e) => handleInputChange('captcha', e.target.value)}
                        placeholder="Enter answer"
                        className={`h-12 text-center pr-10 ${
                          formData.captcha 
                            ? captchaVerified 
                              ? 'border-green-400 bg-green-50 text-green-700' 
                              : 'border-red-400 bg-red-50 text-red-700'
                            : ''
                        }`}
                      />
                      {formData.captcha && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {captchaVerified ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {formData.captcha && !captchaVerified && (
                    <p className="text-xs text-red-600">Incorrect answer. Please try again.</p>
                  )}
                  {captchaVerified && (
                    <p className="text-xs text-green-600">Verification successful</p>
                  )}
                </div>

                <Button
                  onClick={mode === 'signup' ? handleSendOTP : handleLoginRequest}
                  disabled={
                    mode === 'signup' 
                      ? (!formData.username || !formData.phone || !formData.email || !captchaVerified || usernameAvailable === false || loading)
                      : (!formData.identifier?.trim() || !captchaVerified || loading)
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
                  size="lg"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h2>
                  <p className="text-gray-600 mt-2">{getStepSubtitle()}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    Enter OTP
                  </Label>
                  <div className="relative">
                    <Input
                      id="otp"
                      type="text"
                      value={formData.otp}
                      onChange={(e) => handleInputChange('otp', e.target.value)}
                      placeholder="123456"
                      maxLength="6"
                      className="h-12 text-center text-xl tracking-widest pr-10"
                    />
                    {formData.otp && formData.otp.length === 6 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={mode === 'signup' ? handleVerifyOTP : () => setCurrentStep(3)}
                  disabled={formData.otp.length !== 6 || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
                  size="lg"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>

                <div className="flex space-x-3">
                  <Button
                    onClick={mode === 'signup' ? handleResendOTP : handleResendLoginOTP}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 h-12 text-base font-medium"
                    size="lg"
                  >
                    {loading ? 'Sending...' : 'Resend OTP'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      generateCaptcha();
                      setFormData(prev => ({ ...prev, otp: '', captcha: '' }));
                      setCaptchaVerified(false);
                      setError('');
                      setSuccess('');
                    }}
                    variant="outline"
                    className="flex-1 h-12 text-base font-medium"
                    size="lg"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h2>
                  <p className="text-gray-600 mt-2">{getStepSubtitle()}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-sm font-medium text-gray-700">
                    4-Digit PIN
                  </Label>
                  <div className="relative">
                    <Input
                      id="pin"
                      type="password"
                      value={formData.pin}
                      onChange={(e) => handleInputChange('pin', e.target.value)}
                      placeholder="••••"
                      maxLength="4"
                      className="h-12 text-center text-xl tracking-widest pr-10"
                    />
                    {formData.pin && formData.pin.length === 4 && !validationErrors.pin && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  {validationErrors.pin && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <p className="text-xs text-red-600">{validationErrors.pin}</p>
                      </div>
                      <button onClick={() => dismissValidationError('pin')} className="text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPin" className="text-sm font-medium text-gray-700">
                      Confirm PIN
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPin"
                        type="password"
                        value={formData.confirmPin}
                        onChange={(e) => handleInputChange('confirmPin', e.target.value)}
                        placeholder="••••"
                        maxLength="4"
                        className="h-12 text-center text-xl tracking-widest pr-10"
                      />
                      {formData.confirmPin && formData.confirmPin.length === 4 && formData.pin === formData.confirmPin && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </div>
                    {validationErrors.confirmPin && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-xs text-red-600">{validationErrors.confirmPin}</p>
                        </div>
                        <button onClick={() => dismissValidationError('confirmPin')} className="text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={
                    mode === 'signup'
                      ? (formData.pin.length !== 4 || formData.confirmPin.length !== 4 || loading)
                      : (formData.pin.length !== 4 || loading)
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
                  size="lg"
                >
                  {loading 
                    ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...')
                    : (mode === 'signup' ? 'Create Account' : 'Access Dashboard')
                  }
                </Button>

                {mode === 'signup' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800">
                          <strong>Security Note:</strong> Your PIN will be used to access your account and authorize transactions. 
                          Keep it secure and don't share it with anyone.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;