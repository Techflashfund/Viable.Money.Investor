'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Circle, X, ChevronDown, Check, AlertCircle, RefreshCw, TrendingUp, Shield, Zap, Eye, EyeOff } from 'lucide-react';
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
    otp: ['', '', '', '', '', ''],
    pin: '',
    confirmPin: '',
    captcha: ''
  });
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // OTP input refs
  const otpRefs = useRef([]);

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
      otp: ['', '', '', '', '', ''],
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

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData(prev => ({ ...prev, otp: newOtp }));

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (error) {
      setError('');
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
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
    const otpString = formData.otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.verifyOTP(formData.email, otpString);
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
        const otpString = formData.otp.join('');
        const response = await apiService.loginVerify(formData.identifier, otpString, formData.pin);
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
        case 2: return 'Verify';
        case 3: return 'Secure Your Account';
        default: return '';
      }
    } else {
      switch (currentStep) {
        case 1: return 'Welcome Back';
        case 2: return 'Verify';
        case 3: return 'Enter Your PIN';
        default: return '';
      }
    }
  };

  const getStepSubtitle = () => {
    if (mode === 'signup') {
      switch (currentStep) {
        case 1: return 'Join thousands of investors building wealth through mutual funds';
        case 2: return 'Your code was sent to you via email';
        case 3: return 'Set a 4-digit PIN for secure account access';
        default: return '';
      }
    } else {
      switch (currentStep) {
        case 1: return 'Sign in to access your investment portfolio';
        case 2: return 'Your code was sent to you via email';
        case 3: return 'Enter your 4-digit security PIN';
        default: return '';
      }
    }
  };

  // Modern Success/Error Message Components
  const ModernSuccessMessage = ({ message, onDismiss }) => (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50"></div>
      <div className="relative bg-white/60 backdrop-blur border border-green-200/50 p-3 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">{message}</p>
          </div>
          <button onClick={onDismiss} className="text-green-600 hover:text-green-800 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  const ModernErrorMessage = ({ message, onDismiss }) => (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-rose-50"></div>
      <div className="relative bg-white/60 backdrop-blur border border-red-200/50 p-3 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-red-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800">{message}</p>
          </div>
          <button onClick={onDismiss} className="text-red-600 hover:text-red-800 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Left Section - Static Information */}
      <div className={`lg:w-1/2 flex flex-col relative min-h-screen lg:min-h-0 ${showMobileForm ? 'lg:flex hidden' : 'flex'}`}>
        {/* Header */}
        <div className="p-6 lg:p-8 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="InvestFund Logo" 
                className="h-10 lg:h-14 object-contain"
              />
            </div>
            
            {isAuthenticated && user && (
              <div className="bg-white/80 backdrop-blur border border-gray-200 px-4 py-2 shadow-sm">
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
                    className="text-xs px-3 py-1 rounded-full"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Static positioned */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 pb-8">
          <div className="max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-medium text-gray-900 mb-6 leading-tight">
              Wealth Building
              <span className="text-blue-600 block">Simplified</span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Experience seamless mutual fund investing with Unique insights, 
               and professional portfolio management. 
              Build your financial future with confidence.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              
              
              
              <div className="flex items-center space-x-3 p-4 bg-white/50 backdrop-blur border border-gray-200/50">
                <div className="w-10 h-10 bg-purple-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Instant Transactions</h3>
                  <p className="text-sm text-gray-600">Lightning-fast fund transfers</p>
                </div>
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="lg:hidden">
              <Button
                onClick={() => setShowMobileForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg"
                size="lg"
              >
                Get Started
                <ChevronDown className="w-5 h-5 ml-2 rotate-[-90deg]" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Compact Form */}
      <div className={`lg:w-1/2 flex items-center justify-center p-4 lg:p-8 transition-all duration-500 ${
        showMobileForm ? 'flex' : 'hidden lg:flex'
      }`}>
        <div className="w-full max-w-sm">
          {/* Mobile close button */}
          {showMobileForm && (
            <div className="lg:hidden flex justify-end mb-4">
              <Button
                onClick={() => setShowMobileForm(false)}
                variant="outline"
                size="sm"
                className="p-2 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Form Container - Sharp edges, compact */}
          <div className={`space-y-4 ${showMobileForm ? 'lg:bg-white lg:border lg:border-gray-200 lg:shadow-xl lg:p-6' : 'bg-white border border-gray-200 shadow-xl p-6'}`}>
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 p-1 mb-4">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 px-3 text-sm font-medium transition-all rounded-full ${
                  mode === 'login'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 px-3 text-sm font-medium transition-all rounded-full ${
                  mode === 'signup'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-4">
              {Array.from({ length: getStepCount() }, (_, i) => i + 1).map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < getStepCount() && (
                    <div className={`w-8 h-0.5 mx-1 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Modern Error/Success Messages */}
            {error && (
              <ModernErrorMessage message={error} onDismiss={dismissError} />
            )}

            {success && (
              <ModernSuccessMessage message={success} onDismiss={dismissSuccess} />
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-medium text-gray-900">{getStepTitle()}</h2>
                  <p className="text-gray-600 mt-1 text-sm">{getStepSubtitle()}</p>
                </div>

                {mode === 'signup' && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="username" className="text-sm font-medium text-gray-900">
                        Username
                      </Label>
                      <div className="relative">
                        <Input
                          id="username"
                          type="text"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          placeholder="johndoe123"
                          className={`h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 ${
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
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-900">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="9876543210"
                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {mode === 'login' && (
                  <div className="space-y-1">
                    <Label htmlFor="identifier" className="text-sm font-medium text-gray-900">
                      Username, Email or Phone
                    </Label>
                    <Input
                      id="identifier"
                      type="text"
                      value={formData.identifier}
                      onChange={(e) => handleInputChange('identifier', e.target.value)}
                      placeholder="johndoe123 or your@email.com"
                      className="h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Compact Captcha */}
                <div className="space-y-2 p-3 bg-gray-50 border border-gray-200">
                  <Label className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                    <Shield className="w-3 h-3" />
                    <span>Security Verification</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <div className="bg-white px-3 py-2 border border-gray-300 font-mono text-sm font-bold text-gray-800 flex-1 text-center">
                      {captchaQuestion.question} = ?
                    </div>
                    <Button
                      type="button"
                      onClick={refreshCaptcha}
                      variant="outline"
                      size="sm"
                      className="p-2 rounded-full"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    type="number"
                    value={formData.captcha}
                    onChange={(e) => handleInputChange('captcha', e.target.value)}
                    placeholder="Enter answer"
                    className={`h-8 text-center text-sm ${
                      formData.captcha 
                        ? captchaVerified 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-red-400 bg-red-50'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>

                <Button
                  onClick={mode === 'signup' ? handleSendOTP : handleLoginRequest}
                  disabled={
                    mode === 'signup' 
                      ? (!formData.username || !formData.phone || !formData.email || !captchaVerified || usernameAvailable === false || loading)
                      : (!formData.identifier?.trim() || !captchaVerified || loading)
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm font-medium rounded-full shadow-lg"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{getStepTitle()}</h2>
                  <p className="text-gray-600 mt-1 text-sm">{getStepSubtitle()}</p>
                </div>

                {/* Individual OTP Inputs */}
                <div className="flex justify-center space-x-2 mb-4">
                  {formData.otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => otpRefs.current[index] = el}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-12 text-center text-lg font-medium border border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                      maxLength="1"
                    />
                  ))}
                </div>

                <Button
                  onClick={mode === 'signup' ? handleVerifyOTP : () => setCurrentStep(3)}
                  disabled={formData.otp.join('').length !== 6 || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm font-medium rounded-full shadow-lg"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    onClick={mode === 'signup' ? handleResendOTP : handleResendLoginOTP}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Didn't receive code? Request again
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{getStepTitle()}</h2>
                  <p className="text-gray-600 mt-1 text-sm">{getStepSubtitle()}</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pin" className="text-sm font-medium text-gray-900">
                     Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="pin"
                      type={showPin ? "text" : "password"}
                      value={formData.pin}
                      onChange={(e) => handleInputChange('pin', e.target.value)}
                      placeholder="••••"
                      maxLength="4"
                      className="h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1">
                    <Label htmlFor="confirmPin" className="text-sm font-medium text-gray-900">
                      Confirm PIN
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPin"
                        type={showConfirmPin ? "text" : "password"}
                        value={formData.confirmPin}
                        onChange={(e) => handleInputChange('confirmPin', e.target.value)}
                        placeholder="••••"
                        maxLength="4"
                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={
                    mode === 'signup'
                      ? (formData.pin.length !== 4 || formData.confirmPin.length !== 4 || loading)
                      : (formData.pin.length !== 4 || loading)
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm font-medium rounded-full shadow-lg"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{mode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
                    </div>
                  ) : (
                    mode === 'signup' ? 'Create Account' : 'Access Dashboard'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;