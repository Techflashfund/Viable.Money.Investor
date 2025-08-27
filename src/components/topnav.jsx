import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/auth';
import { 
  TrendingUp, 
  Target, 
  PieChart, 
  Activity, 
  Wallet, 
  Settings,
  User,
  LogOut,
  HelpCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserTopNav = ({ activeView, setActiveView }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(true);
  const navRef = useRef(null);
  const router = useRouter();
  
  // Get user data from auth store
  const { user, onboardingstatus, clearAuth } = useAuthStore();
  
  const userDisplayInfo = useMemo(() => {
    if (!user) {
      return { email: '', name: 'User', initial: 'U', shortName: 'User' };
    }
    
    const email = user.email || '';
    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : email.split('@')[0] || 'User';
    const initial = (user.firstName || name)[0]?.toUpperCase() || 'U';
    const shortName = name.length > 12 ? name.substring(0, 12) + '...' : name;
    
    return { email, name, initial, shortName };
  }, [user]);

  const menuItems = useMemo(() => [
    {
      id: 'portfolio',
      name: 'Portfolio',
      icon: <PieChart className="w-4 h-4 flex-shrink-0" />
    },
    {
      id: 'investments',
      name: 'Investments',
      icon: <TrendingUp className="w-4 h-4 flex-shrink-0" />
    },
    {
      id: 'transactions',
      name: 'Transactions',
      icon: <Activity className="w-4 h-4 flex-shrink-0" />
    },
    {
      id: 'goals',
      name: 'Goals',
      icon: <Target className="w-4 h-4 flex-shrink-0" />
    }
  ], []);

  const handleItemClick = useCallback((item) => {
    if (activeView !== item.id) {
      setIsTransitioning(true);
      setActiveView(item.id);
      setTimeout(() => setIsTransitioning(false), 400);
    }
  }, [activeView, setActiveView]);

  const handleLogout = useCallback(() => {
    clearAuth();
    router.push('/auth');
  }, [clearAuth, router]);

  const handleOnboardingClick = useCallback(() => {
    router.push('/onboarding');
  }, [router]);

  const handleCloseBanner = useCallback(() => {
    setShowOnboardingBanner(false);
  }, []);

  // Show onboarding notification if status is false or null
  console.log('Onboarding status:', onboardingstatus);
  const shouldShowOnboarding = (onboardingstatus === false ) && showOnboardingBanner;

  return (
    <div className="w-full relative">
      {/* Friendly Chat Popup for Onboarding */}
      {shouldShowOnboarding && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-white shadow-2xl border border-blue-200 p-4 relative animate-in slide-in-from-top-4 duration-500">
            {/* Chat bubble tail - pointing from right */}
            <div className="absolute top-6 -right-2 w-4 h-4 bg-white border-r border-t border-blue-200 rotate-45"></div>
            
            <div className="flex items-start space-x-3">
              {/* Avatar - Round Profile */}
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
                <span className="text-white text-base font-semibold">V</span>
              </div>
              
              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-base font-medium text-gray-900">InvestFund Assistant</p>
                  <button
                    onClick={handleCloseBanner}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <p className="text-base text-gray-700 leading-relaxed">
                    Hey there! I noticed you haven't completed your onboarding yet. 
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Let's get you all set up so you can start investing! It'll just take a few minutes.
                  </p>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={handleOnboardingClick}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-sm"
                    >
                      Let's do it!
                    </Button>
                    <Button
                      onClick={handleCloseBanner}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 text-sm px-3 py-2 rounded-lg"
                    >
                      Maybe later
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Typing indicator animation */}
            <div className="mt-3 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="border-b border-gray-200 bg-white">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="InvestFund Logo" 
                  className="h-14 object-contain"
                />
              </div>

              {/* Main Navigation */}
              <nav ref={navRef} className="relative">
                <div className="flex items-center gap-8 px-2 py-1">
                  {menuItems.map((item, index) => {
                    const isActive = activeView === item.id;
                    return (
                      <div 
                        key={item.id}
                        className={`
                          flex items-center space-x-2 cursor-pointer transition-all duration-300 py-2 px-3 relative
                          ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}
                          ${isTransitioning ? 'pointer-events-none' : ''}
                        `}
                        style={{ minWidth: '110px', justifyContent: 'center' }}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
                          {item.icon}
                        </div>
                        <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </nav>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 bg-white/50 hover:bg-white/70 hover:scale-105 transition-all duration-200 rounded-xl">
                  <HelpCircle className="w-4 h-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-11 w-11 p-0 bg-white/60 hover:bg-white/80 border border-blue-100/50 hover:scale-105 transition-all duration-200 rounded-xl">
                      <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-base font-medium">{userDisplayInfo.initial}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm w-48 rounded-xl border border-white/20">
                    <DropdownMenuItem className="flex items-center space-x-2 hover:bg-blue-50/50 rounded-lg">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center space-x-2 hover:bg-blue-50/50 rounded-lg">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    {shouldShowOnboarding && (
                      <DropdownMenuItem onClick={handleOnboardingClick} className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Complete Onboarding</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-lg">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {/* Desktop Moving Underline at Bottom Border */}
          <div 
            className={`
              absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full
              transition-all duration-400 ease-out
              ${isTransitioning ? 'opacity-70' : 'opacity-100'}
            `}
            style={{
              left: `calc(50% + ${(menuItems.findIndex(item => item.id === activeView) - 1.5) * 166}px - 50px)`,
              width: '110px',
              transform: isTransitioning ? 'scaleX(0.8)' : 'scaleX(1)'
            }}
          />
        </div>

        {/* Mobile/Tablet Header */}
        <div className="lg:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold text-lg text-gray-900">InvestSmart</div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Mobile Onboarding Button */}
                {shouldShowOnboarding && (
                  <Button
                    onClick={handleOnboardingClick}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2 py-1 rounded-lg font-medium"
                  >
                    Complete
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 bg-white/60 hover:bg-white/80 border border-blue-100/50 rounded-xl relative">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-medium">{userDisplayInfo.initial}</span>
                      </div>
                      {/* Notification dot for incomplete onboarding */}
                      {shouldShowOnboarding && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm w-48 rounded-xl border border-white/20">
                    <DropdownMenuItem className="flex items-center space-x-2 hover:bg-blue-50/50 rounded-lg">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center space-x-2 hover:bg-blue-50/50 rounded-lg">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    {shouldShowOnboarding && (
                      <DropdownMenuItem onClick={handleOnboardingClick} className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Complete Onboarding</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-lg">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="py-1">
                <div className="grid grid-cols-4 gap-2">
                  {menuItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`
                          flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-all duration-300
                          ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}
                        `}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
                          {item.icon}
                        </div>
                        <span className="font-medium text-xs">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Mobile Moving Underline at Bottom Border */}
            <div 
              className={`
                absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full
                transition-all duration-400 ease-out
                ${isTransitioning ? 'opacity-70' : 'opacity-100'}
              `}
              style={{
                left: `${(menuItems.findIndex(item => item.id === activeView) * 25) + 5}%`,
                width: '15%',
                transform: isTransitioning ? 'scaleX(0.8)' : 'scaleX(1)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTopNav;