'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Circle } from 'lucide-react';
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
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  // Function definitions
  const handleLogout = () => {
    clearAuth();
    switchMode('login');
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

//   // Initialize captcha on component mount
//   useEffect(() => {
//     generateCaptcha();
    
//     // If already authenticated, redirect to dashboard
//     if (isAuthenticated) {
//       router.push('/');
//     }
//   }, [isAuthenticated, router]);

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
        
        handleSuccess(response.message || 'Account created successfully');
        setCurrentStep(4);
        
        // Navigate to dashboard after short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
      } else {
        // Login verification
        const response = await apiService.loginVerify(formData.identifier, formData.otp, formData.pin);
        
        // Save auth data to store
        setAuth(response.data, response.token, response.onboardingStatus);
        
        handleSuccess(response.message || 'Login successful');
        setCurrentStep(4);
        
        // Navigate to dashboard after short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/');
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
        case 4: return 'Welcome to Investing!';
        default: return '';
      }
    } else {
      switch (currentStep) {
        case 1: return 'Welcome Back';
        case 2: return 'Verify Your Identity';
        case 3: return 'Enter Your PIN';
        case 4: return 'Access Your Portfolio';
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
        case 4: return 'Your investment account is ready to use';
        default: return '';
      }
    } else {
      switch (currentStep) {
        case 1: return 'Sign in to access your investment portfolio';
        case 2: return `Enter the OTP sent to your registered email`;
        case 3: return 'Enter your 4-digit security PIN';
        case 4: return 'Welcome back to your investment dashboard';
        default: return '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex font-sans relative overflow-hidden">
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
      
      <div className="relative z-10 flex w-full">
        {/* Left Section - Animation and Text */}
        <div className="flex-1 flex flex-col relative">
          {/* Logo Section */}
          <div className="absolute top-8 left-12 z-30">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
               <img 
                  src="/logo.png" 
                  alt="InvestFund Logo" 
                  className="h-22 object-contain"
                />
              </div>
              
              {/* User info if logged in */}
              {isAuthenticated && user && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 ml-8 shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">
                        {user.username || user.email || 'User'}
                      </p>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1 rounded-xl border-gray-300 hover:border-red-400 hover:text-red-600"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-12 pt-32">
            <div className="relative z-20 max-w-lg">
              <h1 className="text-5xl font-semibold font-sans text-black mb-8 leading-tight">
                Smart Investing
                <span className="text-blue-600 block">Made Simple</span>
              </h1>
              
              <div className="h-24 mb-8">
                <p className="text-lg text-gray-700 leading-relaxed font-sans">
                  {displayText}
                  <span className={`${isTyping ? 'animate-pulse' : 'animate-pulse'}`}>|</span>
                </p>
              </div>

              <div className="flex space-x-8 text-sm text-gray-600 font-sans">
                <div className="flex items-center space-x-2">
                  <Circle className='text-blue-600 w-2 h-2 fill-current'/>
                  <span>Zero Commission</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Circle className='text-blue-600 w-2 h-2 fill-current'/>
                  <span>Expert Guidance</span>
                </div>
                <div className="flex items-center space-x-2">
                 <Circle className='text-blue-600 w-2 h-2 fill-current'/>
                  <span>Real-time Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 flex items-center justify-center p-8 relative z-20">
          <div className="w-full max-w-md">
            <div className="p-8 space-y-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200">
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                <button
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium font-sans transition-all ${
                    mode === 'login'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium font-sans transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center mb-8">
                {Array.from({ length: getStepCount() }, (_, i) => i + 1).map((step) => (
                  <React.Fragment key={step}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium font-sans ${
                      currentStep >= step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < getStepCount() && (
                      <div className={`w-12 h-1 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert className="rounded-2xl bg-red-50/80 backdrop-blur-sm border-red-200">
                  <AlertDescription className="text-sm text-red-800 font-sans">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="rounded-2xl bg-blue-50/80 backdrop-blur-sm border-blue-200">
                  <AlertDescription className="text-sm text-blue-800 font-sans">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-black font-sans">{getStepTitle()}</h2>
                    <p className="text-gray-600 mt-2 font-sans">{getStepSubtitle()}</p>
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
                            className={`rounded-2xl bg-white focus:border-blue-600 focus:ring-blue-500 py-6 text-lg font-sans pr-10 ${
                              usernameAvailable === true ? 'border-green-400' : 
                              usernameAvailable === false ? 'border-red-400' : 'border-blue-300'
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {checkingUsername ? (
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : usernameAvailable === true ? (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : usernameAvailable === false ? (
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : null}
                          </div>
                        </div>
                        {usernameAvailable === false && (
                          <p className="text-xs text-red-600 font-sans">Username is already taken</p>
                        )}
                        {usernameAvailable === true && (
                          <p className="text-xs text-green-600 font-sans">Username is available</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-black font-sans">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="9876543210"
                          className="rounded-2xl bg-white border-blue-300 focus:border-blue-600 focus:ring-blue-500 py-6 text-lg font-sans"
                        />
                        <p className="text-xs text-gray-500 font-sans">Enter 10-digit mobile number starting with 6-9</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-black font-sans">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your@email.com"
                          className="rounded-2xl bg-white border-blue-300 focus:border-blue-600 focus:ring-blue-500 py-6 text-lg font-sans"
                        />
                      </div>
                    </>
                  )}

                  {mode === 'login' && (
                    <div className="space-y-2">
                      <Label htmlFor="identifier" className="text-sm font-medium text-black font-sans">
                        Username, Email or Phone
                      </Label>
                      <Input
                        id="identifier"
                        type="text"
                        value={formData.identifier}
                        onChange={(e) => handleInputChange('identifier', e.target.value)}
                        placeholder="johndoe123 or your@email.com or 9876543210"
                        className="rounded-2xl bg-white border-blue-300 focus:border-blue-600 focus:ring-blue-500 py-6 text-lg font-sans"
                      />
                      <p className="text-xs text-gray-500 font-sans">Enter your username, email address, or phone number</p>
                    </div>
                  )}

                  {/* Captcha Verification */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <Label className="text-sm font-medium text-black font-sans">
                      Security Verification
                    </Label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="bg-white px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 font-mono text-lg font-bold text-black min-w-24 text-center">
                            {captchaQuestion.question} = ?
                          </div>
                          <Button
                            type="button"
                            onClick={refreshCaptcha}
                            variant="outline"
                            size="sm"
                            className="p-2 rounded-xl border-gray-300 hover:border-blue-400 font-sans"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </Button>
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            value={formData.captcha}
                            onChange={(e) => handleInputChange('captcha', e.target.value)}
                            placeholder="Enter answer"
                            className={`rounded-xl py-3 text-center font-sans bg-white ${
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
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {formData.captcha && !captchaVerified && (
                      <p className="text-xs text-red-600 font-sans">Incorrect answer. Please try again.</p>
                    )}
                    {captchaVerified && (
                      <p className="text-xs text-green-600 font-sans">✓ Verification successful</p>
                    )}
                  </div>

                  <Button
                    onClick={mode === 'signup' ? handleSendOTP : handleLoginRequest}
                    disabled={
                      mode === 'signup' 
                        ? (!formData.username || !formData.phone || !formData.email || !captchaVerified || usernameAvailable === false || loading)
                        : (!formData.identifier?.trim() || !captchaVerified || loading)
                    }
                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium font-sans transition-all transform hover:scale-105"
                    size="lg"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-black font-sans">{getStepTitle()}</h2>
                    <p className="text-gray-600 mt-2 font-sans">{getStepSubtitle()}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-black font-sans">
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={formData.otp}
                      onChange={(e) => handleInputChange('otp', e.target.value)}
                      placeholder="123456"
                      maxLength="6"
                      className="rounded-2xl bg-white border-blue-300 focus:border-blue-600 focus:ring-blue-500 text-center text-2xl tracking-widest py-6 font-sans"
                    />
                  </div>

                  <Button
                    onClick={mode === 'signup' ? handleVerifyOTP : () => setCurrentStep(3)}
                    disabled={formData.otp.length !== 6 || loading}
                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium font-sans transition-all transform hover:scale-105"
                    size="lg"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>

                  <div className="flex space-x-3">
                    <Button
                      onClick={mode === 'signup' ? handleResendOTP : handleResendLoginOTP}
                      disabled={loading}
                      variant="outline"
                      className="flex-1 rounded-2xl border-blue-600 text-blue-600 hover:bg-blue-50 py-6 text-base font-medium font-sans"
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
                      className="flex-1 rounded-2xl border-gray-400 text-gray-600 hover:bg-gray-50 py-6 text-base font-medium font-sans"
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
                    <h2 className="text-2xl font-bold text-black font-sans">{getStepTitle()}</h2>
                    <p className="text-gray-600 mt-2 font-sans">{getStepSubtitle()}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pin" className="text-sm font-medium text-black font-sans">
                      4-Digit PIN
                    </Label>
                    <Input
                      id="pin"
                      type="password"
                      value={formData.pin}
                      onChange={(e) => handleInputChange('pin', e.target.value)}
                      placeholder="••••"
                      maxLength="4"
                      className="rounded-2xl bg-white border-blue-300 focus:border-blue-600 focus:ring-blue-500 text-center text-2xl tracking-widest py-6 font-sans"
                    />
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPin" className="text-sm font-medium text-black font-sans">
                        Confirm PIN
                      </Label>
                      <Input
                        id="confirmPin"
                        type="password"
                        value={formData.confirmPin}
                        onChange={(e) => handleInputChange('confirmPin', e.target.value)}
                        placeholder="••••"
                        maxLength="4"
                        className="rounded-2xl bg-white border-blue-300 focus:border-blue-600 focus:ring-blue-500 text-center text-2xl tracking-widest py-6 font-sans"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={
                      mode === 'signup'
                        ? (formData.pin.length !== 4 || formData.confirmPin.length !== 4 || loading)
                        : (formData.pin.length !== 4 || loading)
                    }
                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium font-sans transition-all transform hover:scale-105"
                    size="lg"
                  >
                    {loading 
                      ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...')
                      : (mode === 'signup' ? 'Create Account' : 'Access Dashboard')
                    }
                  </Button>

                  {mode === 'signup' && (
                    <Alert className="rounded-2xl bg-blue-50 border-blue-200">
                      <AlertDescription className="text-sm text-blue-800 font-sans">
                        <strong>Security Note:</strong> Your PIN will be used to access your account and authorize transactions. 
                        Keep it secure and don't share it with anyone.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-black font-sans">
                    {mode === 'signup' ? 'Account Created Successfully!' : 'Welcome Back!'}
                  </h2>
                  <p className="text-gray-600 font-sans">
                    {mode === 'signup' 
                      ? 'Congratulations! Your investment account has been created successfully. Redirecting you to the dashboard...'
                      : 'Welcome back to your investment dashboard! Redirecting you to your portfolio...'
                    }
                  </p>
                  
                  <Alert className="rounded-2xl bg-green-50 border-green-200">
                    <AlertDescription className="text-sm text-green-800 font-sans">
                      <strong>Success!</strong><br />
                      {mode === 'signup' 
                        ? 'You can now start exploring mutual funds and building your portfolio.'
                        : 'Access your portfolio, discover new funds, and track your investment performance.'
                      }
                    </AlertDescription>
                  </Alert>

                  {user && (
                    <div className="text-left bg-gray-50 rounded-2xl p-4 space-y-2">
                      <h3 className="font-semibold text-black">Account Details:</h3>
                      <p className="text-sm text-gray-600">Username: {user.username}</p>
                      <p className="text-sm text-gray-600">Email: {user.email}</p>
                      {user.phone && <p className="text-sm text-gray-600">Phone: {user.phone}</p>}
                      <p className="text-sm text-gray-600">Status: <span className="text-green-600">Active</span></p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      onClick={handleGoToDashboard}
                      className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium font-sans transition-all transform hover:scale-105"
                      size="lg"
                    >
                      Go to Dashboard
                    </Button>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
                        variant="outline"
                        className="flex-1 rounded-2xl border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-6 text-sm font-medium font-sans"
                      >
                        {mode === 'signup' ? 'Already have account?' : 'Create New Account'}
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="flex-1 rounded-2xl border-gray-400 text-gray-600 hover:bg-gray-50 py-3 px-6 text-sm font-medium font-sans"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
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