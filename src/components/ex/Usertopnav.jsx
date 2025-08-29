'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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

const UserTopNav = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(true);
  const navRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  
  // Force re-render when pathname changes
  useEffect(() => {
    console.log('Pathname changed to:', pathname);
    setIsTransitioning(false); // Ensure transition state is cleared
  }, [pathname]);
  
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
      icon: <PieChart className="w-4 h-4 flex-shrink-0" />,
      href: '/dashboard/portfolio'
    },
    {
      id: 'investments',
      name: 'Investments',
      icon: <TrendingUp className="w-4 h-4 flex-shrink-0" />,
      href: '/dashboard/investments'
    },
    {
      id: 'transactions',
      name: 'Transactions',
      icon: <Activity className="w-4 h-4 flex-shrink-0" />,
      href: '/dashboard/transactions'
    },
    {
      id: 'goals',
      name: 'Goals',
      icon: <Target className="w-4 h-4 flex-shrink-0" />,
      href: '/dashboard/goals'
    }
  ], []);

  const handleItemClick = useCallback((item) => {
    if (pathname !== item.href) {
      setIsTransitioning(true);
      router.push(item.href);
      setTimeout(() => setIsTransitioning(false), 400);
    }
  }, [pathname, router]);

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

  // Determine active view based on pathname - memoized for reactivity
  const activeView = useMemo(() => {
    console.log('Current pathname:', pathname); // Debug log
    if (pathname === '/dashboard/investments' || pathname.startsWith('/dashboard/investments/')) return 'investments';
    if (pathname === '/dashboard/transactions' || pathname.startsWith('/dashboard/transactions/')) return 'transactions';
    if (pathname === '/dashboard/goals' || pathname.startsWith('/dashboard/goals/')) return 'goals';
    if (pathname === '/dashboard/portfolio' || pathname.startsWith('/dashboard/portfolio/') || pathname === '/dashboard' || pathname === '/') return 'portfolio';
    return 'portfolio'; // default
  }, [pathname]);

  // Show onboarding notification if status is false or null
  console.log('Onboarding status:', onboardingstatus);
  const shouldShowOnboarding = (onboardingstatus === false ) && showOnboardingBanner;

  return (
    <div className="w-full relative">
      {/* Responsive Onboarding Notification */}
      {shouldShowOnboarding && (
        <div className="fixed top-12 right-2 lg:top-14 lg:right-12 z-50 max-w-[280px] sm:max-w-[300px] lg:max-w-sm">
          <div className="bg-white shadow-lg lg:shadow-xl border border-blue-200 p-2 sm:p-3 lg:p-4 relative animate-in slide-in-from-top-2 duration-300">
            {/* Chat bubble tail - responsive positioning */}
            <div className="absolute -top-1.5 right-4 lg:-top-2 lg:right-6 w-3 h-3 lg:w-4 lg:h-4 bg-white border-l border-t border-blue-200 rotate-45"></div>
            
            <div className="flex items-start space-x-2 lg:space-x-3">
              {/* Logo Icon - smaller on mobile */}
              <div className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200 rounded-lg bg-white">
                <img 
                  src="/icon.png" 
                  alt="Viable.Money Logo" 
                  className="w-4 h-4 lg:w-6 lg:h-6 object-contain"
                />
              </div>
              
              {/* Message Content - responsive text and spacing */}
              <div className="flex-1 min-w-0">
                <div className="space-y-1.5 lg:space-y-2">
                  <p className="text-xs sm:text-xs lg:text-sm text-gray-700 leading-relaxed">
                    Hey! You haven't completed onboarding yet.
                  </p>
                  <p className="text-xs sm:text-xs lg:text-sm text-gray-700 leading-relaxed">
                    <span className="hidden sm:inline">Let's get you all set up so you can start investing!</span>
                    <span className="sm:hidden">Let's get you set up!</span>
                  </p>
                  
                  <div className="flex space-x-1.5 lg:space-x-2 pt-0.5 lg:pt-1">
                    <Button
                      onClick={handleOnboardingClick}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm px-2 py-1.5 lg:px-3 lg:py-2 rounded-md lg:rounded-lg font-medium shadow-sm h-auto"
                    >
                      <span className="hidden sm:inline">Let's do it!</span>
                      <span className="sm:hidden">Start</span>
                    </Button>
                    <Button
                      onClick={handleCloseBanner}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 text-xs lg:text-sm px-2 py-1.5 lg:px-3 lg:py-2 rounded-md lg:rounded-lg h-auto"
                    >
                      Later
                    </Button>
                  </div>
                </div>
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
                 <img 
                  src="/logo.png" 
                  alt="Viable.Money Logo" 
                  className="w-28 h-9 object-contain"
                />
                
              </div>

              <div className="flex items-center space-x-2">
                
                
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