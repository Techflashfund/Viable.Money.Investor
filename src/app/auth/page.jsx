'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Circle, X, ChevronDown, Check, AlertCircle, RefreshCw } from 'lucide-react';
import useAuthStore from '@/store/auth';
import createApiService from '@/services/api';

const AuthPage = () => {
  const router = useRouter();
  
  // Initialize API service - you can set your backend URL here
  const baseUrl ='https://viable-money-be.onrender.com';
  const apiService = createApiService(baseUrl);
  
  // Zustand auth store
  const { 
    user, 
    isAuthenticated, 
    setAuth, 
    clearAuth, 
    setLoading: setAuthLoading,
    isLoading: authLoading 
  } = useAuthStore();
  
  // Local component state
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [currentStep, setCurrentStep] = useState(1);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    identifier: '', // for login (username, email, or phone)
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
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  // Function definitions
  const handleLogout = () => {
    clearAuth();
    switchMode('login');
  };

  // Dismiss error
  const dismissError = () => {
    setError('');
  };

  // Dismiss success
  const dismissSuccess = () => {
    setSuccess('');
  };

  // Dismiss validation error
  const dismissValidationError = (field) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Add validation helper
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

  // Generate captcha question
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

  // Reset form when switching modes
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

  // Error handling helper
  const handleError = (error) => {
    setLoading(false);
    setAuthLoading(false);
    const errorMessage = error.message || 'An unexpected error occurred';
    setError(errorMessage);
    setSuccess('');
  };

  // Success handling helper
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

  // Enhanced Three.js background animation
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create flowing lines network with blue colors for user interface
    const lineGroups = [];
    const numLines = 8;
    
    for (let i = 0; i < numLines; i++) {
      const points = [];
      const numPoints = 50;
      
      for (let j = 0; j < numPoints; j++) {
        const t = j / (numPoints - 1);
        const x = (t - 0.5) * 20;
        const y = Math.sin(t * Math.PI * 2 + i) * 3 + (i - numLines / 2) * 2;
        const z = Math.cos(t * Math.PI + i * 0.5) * 2;
        points.push(new THREE.Vector3(x, y, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(0.6, 0.8, 0.6), // Blue color
        transparent: true,
        opacity: 0.4,
        linewidth: 2
      });
      
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      lineGroups.push({ line, points, phase: i * 0.3 });
    }

    const additionalLines = [];
    for (let i = 0; i < 6; i++) {
      const points = [];
      const numPoints = 30;
      
      for (let j = 0; j < numPoints; j++) {
        const t = j / (numPoints - 1);
        const x = (t - 0.5) * 18 + Math.sin(t * Math.PI * 3 + i) * 2;
        const y = Math.cos(t * Math.PI * 2 + i * 0.7) * 4 + (i - 3) * 1.5;
        const z = Math.sin(t * Math.PI * 1.5 + i * 0.4) * 3;
        points.push(new THREE.Vector3(x, y, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(0.55 + i * 0.02, 0.7, 0.7), // Blue gradient
        transparent: true,
        opacity: 0.25,
        linewidth: 1
      });
      
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      additionalLines.push({ 
        line, 
        points, 
        phase: i * 0.4,
        speed: 0.8 + i * 0.2
      });
    }

    camera.position.set(0, 0, 8);

    let time = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      time += 0.01;
      
      lineGroups.forEach((group, groupIndex) => {
        const { line, points, phase } = group;
        const positions = line.geometry.attributes.position.array;
        
        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          const t = i / (points.length - 1);
          
          positions[i * 3] = point.x;
          positions[i * 3 + 1] = point.y + Math.sin(time * 2 + phase + t * Math.PI * 4) * 0.5;
          positions[i * 3 + 2] = point.z + Math.cos(time + phase + t * Math.PI * 2) * 0.3;
        }
        
        line.geometry.attributes.position.needsUpdate = true;
        const opacity = 0.3 + Math.sin(time + phase) * 0.2;
        line.material.opacity = Math.max(0.1, opacity);
      });
      
      additionalLines.forEach((group, groupIndex) => {
        const { line, points, phase, speed } = group;
        const positions = line.geometry.attributes.position.array;
        
        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          const t = i / (points.length - 1);
          
          positions[i * 3] = point.x + Math.cos(time * speed + phase + t * Math.PI * 2) * 0.8;
          positions[i * 3 + 1] = point.y + Math.sin(time * speed * 1.2 + phase + t * Math.PI * 3) * 0.6;
          positions[i * 3 + 2] = point.z + Math.sin(time * speed * 0.8 + phase + t * Math.PI) * 0.4;
        }
        
        line.geometry.attributes.position.needsUpdate = true;
        const opacity = 0.2 + Math.sin(time * 1.5 + phase) * 0.15;
        line.material.opacity = Math.max(0.05, opacity);
      });
      
      camera.position.x = Math.sin(time * 0.2) * 0.5;
      camera.position.y = Math.cos(time * 0.15) * 0.3;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  // Typing animation text
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = "Start your investment journey with India's leading mutual fund platform. Discover, invest, and track your portfolio with personalized recommendations and real-time market insights.";

  useEffect(() => {
    let index = 0;
    let timer;

    const startTyping = () => {
      setIsTyping(true);
      timer = setInterval(() => {
        if (index <= fullText.length) {
          setDisplayText(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(timer);
          setIsTyping(false);
          setTimeout(() => {
            index = 0;
            setDisplayText('');
            startTyping();
          }, 2000);
        }
      }, 80);
    };

    startTyping();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate field on change
    validateField(field, value);
    
    if (field === 'captcha') {
      const isCorrect = parseInt(value) === captchaQuestion.answer;
      setCaptchaVerified(isCorrect);
    }

    // Clear errors when user starts typing
    if (error) {
      setError('');
    }
  };

  const refreshCaptcha = () => {
    generateCaptcha();
    setFormData(prev => ({ ...prev, captcha: '' }));
    setCaptchaVerified(false);
  };

  // Registration flow - Real API handlers
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

  // Login flow - Real API handlers
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
        // Set PIN - Complete registration
        if (formData.pin !== formData.confirmPin) {
          setError('PIN and Confirm PIN must match');
          return;
        }

        const response = await apiService.setPIN(formData.email, formData.pin, formData.confirmPin);
        
        // Save auth data to store
        setAuth(response.data, response.token, response.onboardingStatus);
        
        // Navigate directly to dashboard
        router.push('/');
        
      } else {
        // Login verification
        const response = await apiService.loginVerify(formData.identifier, formData.otp, formData.pin);
        
        // Save auth data to store
        setAuth(response.data, response.token, response.onboardingStatus);
        
        // Navigate directly to dashboard
        router.push('/');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  const getStepCount = () => {
    return 3; // Both signup and login have 3 steps
  };

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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col lg:flex-row font-sans relative overflow-hidden">
      {/* Subtle geometric background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-black rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-20 w-48 h-48 bg-black rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gray-800 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-gray-900 rounded-full blur-3xl"></div>
      </div>
      
      {/* Animated Background */}
      <div 
        ref={mountRef} 
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      
      <div className="relative z-10 flex flex-col lg:flex-row w-full">
        {/* Left Section - Animation and Text */}
        <div className={`flex-1 flex flex-col relative transition-all duration-500 min-h-screen lg:min-h-0 ${showMobileForm ? 'lg:flex hidden' : 'flex'}`}>
          {/* Logo Section */}
          <div className="absolute top-4 lg:top-8 left-4 lg:left-12 z-30 w-full">
            <div className="flex items-center justify-between w-full pr-4 lg:pr-0">
              <div className="flex items-center space-x-3">
               <img 
                  src="/logo.png" 
                  alt="InvestFund Logo" 
                  className="h-16 lg:h-22 object-contain"
                />
              </div>
              
              {/* User info if logged in */}
              {isAuthenticated && user && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-3 lg:px-4 py-2 ml-4 lg:ml-8 shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="text-xs lg:text-sm">
                      <p className="font-medium text-gray-800">
                        {user.username || user.email || 'User'}
                      </p>
                      <p className="text-gray-600 hidden lg:block">{user.email}</p>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 lg:px-3 py-1 rounded-xl border-gray-300 hover:border-red-400 hover:text-red-600"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center px-6 lg:p-12 pt-28 pb-8 lg:pt-32">
            <div className="relative z-20 max-w-lg w-full text-left space-y-12 lg:space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-semibold font-sans text-black mb-8 lg:mb-8 leading-tight">
                  Smart Investing
                  <span className="text-blue-600 block">Made Simple</span>
                </h1>
                
                <div className="h-32 sm:h-36 lg:h-24">
                  <p className="text-lg sm:text-xl lg:text-lg text-gray-700 leading-relaxed font-sans">
                    {displayText}
                    <span className={`${isTyping ? 'animate-pulse' : 'animate-pulse'}`}>|</span>
                  </p>
                </div>
              </div>

              <div className="space-y-6 lg:space-y-0">
                <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0 text-base sm:text-lg lg:text-sm text-gray-600 font-sans">
                  <div className="flex items-center space-x-3">
                    <Circle className='text-blue-600 w-3 h-3 lg:w-2 lg:h-2 fill-current'/>
                    <span>Zero Commission</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Circle className='text-blue-600 w-3 h-3 lg:w-2 lg:h-2 fill-current'/>
                    <span>Expert Guidance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                   <Circle className='text-blue-600 w-3 h-3 lg:w-2 lg:h-2 fill-current'/>
                    <span>Real-time Tracking</span>
                  </div>
                </div>

                {/* Additional features for mobile */}
                <div className="lg:hidden space-y-6 pt-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-base text-gray-600">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">1</span>
                      </div>
                      <span>Choose from 1000+ mutual funds</span>
                    </div>
                    <div className="flex items-center space-x-3 text-base text-gray-600">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">2</span>
                      </div>
                      <span>Start investing with just ₹100</span>
                    </div>
                    <div className="flex items-center space-x-3 text-base text-gray-600">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">3</span>
                      </div>
                      <span>Track portfolio performance 24/7</span>
                    </div>
                  </div>

                  
                </div>
              </div>

              {/* Mobile arrow to show form - positioned to the right */}
              <div className="lg:hidden flex justify-end pt-4">
                <Button
                  onClick={() => setShowMobileForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-5 shadow-2xl animate-bounce flex items-center space-x-3"
                  size="lg"
                >
                  <span className="text-base font-medium">Get Started</span>
                  <ChevronDown className="w-6 h-6 rotate-[-90deg]" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className={`flex-1 flex items-start lg:items-center justify-center p-4 lg:p-8 relative z-20 transition-all duration-500 ${
          showMobileForm ? 'flex' : 'hidden lg:flex'
        } ${showMobileForm ? 'min-h-screen' : ''}`}>
          <div className="w-full max-w-md">
            {/* Mobile close button */}
            {showMobileForm && (
              <div className="lg:hidden flex justify-between items-center mb-4">
                <Button
                  onClick={() => setShowMobileForm(false)}
                  variant="outline"
                  size="sm"
                  className="rounded-full p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="p-6 lg:p-8 space-y-6 lg:space-y-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200">
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 lg:mb-8">
                <button
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-xl text-sm font-medium font-sans transition-all ${
                    mode === 'login'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-xl text-sm font-medium font-sans transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center mb-6 lg:mb-8">
                {Array.from({ length: getStepCount() }, (_, i) => i + 1).map((step) => (
                  <React.Fragment key={step}>
                    <div className={`w-6 lg:w-8 h-6 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium font-sans ${
                      currentStep >= step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < getStepCount() && (
                      <div className={`w-8 lg:w-12 h-1 mx-1 lg:mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Enhanced Error/Success Messages */}
              {error && (
                <div className="rounded-2xl bg-red-50/90 backdrop-blur-sm border border-red-200 p-4 relative animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-red-800 font-sans">{error}</p>
                    </div>
                    <button
                      onClick={dismissError}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {success && (
                <div className="rounded-2xl bg-green-50/90 backdrop-blur-sm border border-green-200 p-4 relative animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-green-800 font-sans">{success}</p>
                    </div>
                    <button
                      onClick={dismissSuccess}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="text-center mb-4 lg:mb-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-black font-sans">{getStepTitle()}</h2>
                    <p className="text-gray-600 mt-2 font-sans text-sm lg:text-base">{getStepSubtitle()}</p>
                  </div>

                  {mode === 'signup' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium text-black font-sans">
                          Username
                        </Label>
                        <div className="relative">
                          <Input
                            id="username"
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            placeholder="johndoe123"
                            className={`rounded-2xl bg-white focus:border-blue-600 focus:ring-blue-500 py-4 lg:py-6 text-base lg:text-lg font-sans pr-10 ${
                              usernameAvailable === true ? 'border-green-400' : 
                              usernameAvailable === false ? 'border-red-400' : 'border-gray-300'
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {checkingUsername ? (
                              <div className="w-4 lg:w-5 h-4 lg:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : usernameAvailable === true ? (
                              <Check className="w-4 lg:w-5 h-4 lg:h-5 text-green-600" />
                            ) : usernameAvailable === false ? (
                              <X className="w-4 lg:w-5 h-4 lg:h-5 text-red-600" />
                            ) : null}
                          </div>
                        </div>
                        {validationErrors.username && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <p className="text-xs text-red-600 font-sans">{validationErrors.username}</p>
                            </div>
                            <button
                              onClick={() => dismissValidationError('username')}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {usernameAvailable === false && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <p className="text-xs text-red-600 font-sans">Username is already taken</p>
                            </div>
                          </div>
                        )}
                        {usernameAvailable === true && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <p className="text-xs text-green-600 font-sans">Username is available</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-black font-sans">
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="9876543210"
                            className="rounded-2xl bg-white border-gray-300 focus:border-blue-600 focus:ring-blue-500 py-4 lg:py-6 text-base lg:text-lg font-sans pr-10"
                          />
                          {formData.phone && !validationErrors.phone && /^[6-9]\d{9}$/.test(formData.phone) && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Check className="w-4 lg:w-5 h-4 lg:h-5 text-green-600" />
                            </div>
                          )}
                        </div>
                        {validationErrors.phone && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <p className="text-xs text-red-600 font-sans">{validationErrors.phone}</p>
                            </div>
                            <button
                              onClick={() => dismissValidationError('phone')}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 font-sans">Enter 10-digit mobile number starting with 6-9</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-black font-sans">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="your@email.com"
                            className="rounded-2xl bg-white border-gray-300 focus:border-blue-600 focus:ring-blue-500 py-4 lg:py-6 text-base lg:text-lg font-sans pr-10"
                          />
                          {formData.email && !validationErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Check className="w-4 lg:w-5 h-4 lg:h-5 text-green-600" />
                            </div>
                          )}
                        </div>
                        {validationErrors.email && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <p className="text-xs text-red-600 font-sans">{validationErrors.email}</p>
                            </div>
                            <button
                              onClick={() => dismissValidationError('email')}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {mode === 'login' && (
                    <div className="space-y-2">
                      <Label htmlFor="identifier" className="text-sm font-medium text-black font-sans">
                        Username, Email or Phone
                      </Label>
                      <div className="relative">
                        <Input
                          id="identifier"
                          type="text"
                          value={formData.identifier}
                          onChange={(e) => handleInputChange('identifier', e.target.value)}
                          placeholder="johndoe123 or your@email.com or 9876543210"
                          className="rounded-2xl bg-white border-gray-300 focus:border-blue-600 focus:ring-blue-500 py-4 lg:py-6 text-base lg:text-lg font-sans pr-10"
                        />
                        {formData.identifier && formData.identifier.trim().length > 0 && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Check className="w-4 lg:w-5 h-4 lg:h-5 text-green-600" />
                          </div>
                        )}
                      </div>
                      {validationErrors.identifier && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <p className="text-xs text-red-600 font-sans">{validationErrors.identifier}</p>
                          </div>
                          <button
                            onClick={() => dismissValidationError('identifier')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 font-sans">Enter your username, email address, or phone number</p>
                    </div>
                  )}

                  {/* Enhanced Captcha Verification */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <Label className="text-sm font-medium text-black font-sans">
                      Security Verification
                    </Label>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white px-3 lg:px-4 py-2 lg:py-3 rounded-xl border-2 border-dashed border-gray-300 font-mono text-base lg:text-lg font-bold text-black min-w-20 lg:min-w-24 text-center">
                          {captchaQuestion.question} = ?
                        </div>
                        <Button
                          type="button"
                          onClick={refreshCaptcha}
                          variant="outline"
                          size="sm"
                          className="p-2 rounded-xl border-gray-300 hover:border-blue-400 font-sans"
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
                          className={`rounded-xl py-3 text-center font-sans bg-white pr-10 ${
                            formData.captcha 
                              ? captchaVerified 
                                ? 'border-green-400 bg-green-50 text-green-700' 
                                : 'border-red-400 bg-red-50 text-red-700'
                              : 'border-gray-300'
                          }`}
                        />
                        {formData.captcha && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {captchaVerified ? (
                              <Check className="w-4 lg:w-5 h-4 lg:h-5 text-green-600" />
                            ) : (
                              <X className="w-4 lg:w-5 h-4 lg:h-5 text-red-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {formData.captcha && !captchaVerified && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <p className="text-xs text-red-600 font-sans">Incorrect answer. Please try again.</p>
                      </div>
                    )}
                    {captchaVerified && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-600 font-sans">Verification successful</p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={mode === 'signup' ? handleSendOTP : handleLoginRequest}
                    disabled={
                      mode === 'signup' 
                        ? (!formData.username || !formData.phone || !formData.email || !captchaVerified || usernameAvailable === false || loading)
                        : (!formData.identifier?.trim() || !captchaVerified || loading)
                    }
                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-4 lg:py-6 text-base font-medium font-sans transition-all transform hover:scale-105"
                    size="lg"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="text-center mb-4 lg:mb-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-black font-sans">{getStepTitle()}</h2>
                    <p className="text-gray-600 mt-2 font-sans text-sm lg:text-base">{getStepSubtitle()}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-black font-sans">
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
                        className="rounded-2xl bg-white border-gray-300 focus:border-blue-600 focus:ring-blue-500 text-center text-xl lg:text-2xl tracking-widest py-4 lg:py-6 font-sans pr-10"
                      />
                      {formData.otp && formData.otp.length === 6 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Check className="w-4 lg:w-5 h-4 lg:h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={mode === 'signup' ? handleVerifyOTP : () => setCurrentStep(3)}
                    disabled={formData.otp.length !== 6 || loading}
                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-4 lg:py-6 text-base font-medium font-sans transition-all transform hover:scale-105"
                    size="lg"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>

                  <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3">
                    <Button
                      onClick={mode === 'signup' ? handleResendOTP : handleResendLoginOTP}
                      disabled={loading}
                      variant="outline"
                      className="flex-1 rounded-2xl border-blue-600 text-blue-600 hover:bg-blue-50 py-4 lg:py-6 text-base font-medium font-sans"
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
                      className="flex-1 rounded-2xl border-gray-400 text-gray-600 hover:bg-gray-50 py-4 lg:py-6 text-base font-medium font-sans"
                      size="lg"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="text-center mb-4 lg:mb-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-black font-sans">{getStepTitle()}</h2>
                    <p className="text-gray-600 mt-2 font-sans text-sm lg:text-base">{getStepSubtitle()}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pin" className="text-sm font-medium text-black font-sans">
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
                        className="rounded-2xl bg-white border-gray-300 focus:border-blue-600 focus:ring-blue-500 text-center text-xl lg:text-2xl tracking-widest py-4 lg:py-6 font-sans pr-10"
                      />
                      {formData.pin && formData.pin.length === 4 && !validationErrors.pin && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Check className="w-4 lg:w-5 h-4 lg:h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                    {validationErrors.pin && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-xs text-red-600 font-sans">{validationErrors.pin}</p>
                        </div>
                        <button
                          onClick={() => dismissValidationError('pin')}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPin" className="text-sm font-medium text-black font-sans">
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
                          className="rounded-2xl bg-white border-gray-300 focus:border-blue-600 focus:ring-blue-500 text-center text-xl lg:text-2xl tracking-widest py-4 lg:py-6 font-sans pr-10"
                        />
                        {formData.confirmPin && formData.confirmPin.length === 4 && formData.pin === formData.confirmPin && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Check className="w-4 lg:w-5 h-4 lg:h-5 text-green-600" />
                          </div>
                        )}
                      </div>
                      {validationErrors.confirmPin && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <p className="text-xs text-red-600 font-sans">{validationErrors.confirmPin}</p>
                          </div>
                          <button
                            onClick={() => dismissValidationError('confirmPin')}
                            className="text-red-600 hover:text-red-800"
                          >
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
                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-4 lg:py-6 text-base font-medium font-sans transition-all transform hover:scale-105"
                    size="lg"
                  >
                    {loading 
                      ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...')
                      : (mode === 'signup' ? 'Create Account' : 'Access Dashboard')
                    }
                  </Button>

                  {mode === 'signup' && (
                    <div className="rounded-2xl bg-blue-50/90 border border-blue-200 p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-blue-800 font-sans">
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
    </div>
  );
};

export default AuthPage;