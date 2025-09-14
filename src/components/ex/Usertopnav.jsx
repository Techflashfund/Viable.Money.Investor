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
  X,
  Search,
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// FundIcon component
const FundIcon = ({ fund, size = "w-10 h-10" }) => {
  const getGradientColors = (name) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-red-500 to-pink-600',
      'from-teal-500 to-green-600'
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  return (
    <div className={`${size} bg-gradient-to-br ${getGradientColors(fund?.name)} rounded-full flex items-center justify-center flex-shrink-0`}>
      <div className="w-1/2 h-1/2 bg-white rounded-full opacity-80"></div>
    </div>
  );
};

// Helper function to convert to camelCase
const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

// Helper function to convert to Title Case
const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(2)} Cr.`;
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(2)} L.`;
  } else if (amount >= 10000) { // 10 thousand and above
    return `₹${(amount / 1000).toFixed(0)}K`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

const UserTopNav = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const popupRef = useRef(null);
  const searchInputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  
  // Force re-render when pathname changes
  useEffect(() => {
    console.log('Pathname changed to:', pathname);
    setIsTransitioning(false); // Ensure transition state is cleared
  }, [pathname]);

  // Close search popup when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowSearchPopup(false);
        setSearchQuery('');
        setSelectedIndex(-1);
      }
    };

    const handleKeyDown = (event) => {
      if (!showSearchPopup) return;

      switch (event.key) {
        case 'Escape':
          setShowSearchPopup(false);
          setSearchQuery('');
          setSelectedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
            handleFundClick(filteredResults[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearchPopup, filteredResults, selectedIndex]);

  // Focus search input when popup opens
  useEffect(() => {
    if (showSearchPopup && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showSearchPopup]);
  
  // Get user data from auth store
  const { user, onboardingstatus, clearAuth,transactionId } = useAuthStore();
  
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

  // Updated menuItems without investments
  const menuItems = useMemo(() => [
    {
      id: 'portfolio',
      name: 'Portfolio',
      icon: <PieChart className="w-4 h-4 flex-shrink-0" />,
      href: '/dashboard/portfolio'
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

  // Filter results based on minimum investment amounts
  useEffect(() => {
    const filtered = searchResults.filter(fund => {
      const hasMinSip = fund.minSipAmount && fund.minSipAmount > 0;
      const hasMinLumpsum = fund.minLumpsumAmount && fund.minLumpsumAmount > 0;
      return hasMinSip || hasMinLumpsum;
    });
    setFilteredResults(filtered);
    setSelectedIndex(-1); // Reset selection when results change
  }, [searchResults]);

  // Search API function
  const searchFunds = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError('');
    
    try {
      const response = await fetch(`https://investment.flashfund.in/api/ondc/funds/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data || []);
      } else {
        setSearchError('Failed to search funds');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Something went wrong. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchFunds(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFunds]);

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
     router.push(`/onboarding/${transactionId}`);
  }, [router]);

  const handleCloseBanner = useCallback(() => {
    setShowOnboardingBanner(false);
  }, []);

  const handleSearchClick = useCallback(() => {
    setShowSearchPopup(true);
  }, []);

  const handleFundClick = useCallback((fund) => {
    setShowSearchPopup(false);
    setSearchQuery('');
    setSelectedIndex(-1);
    router.push(`/dashboard/explore/${fund.itemId}`);
  }, [router]);

  // Determine active view based on pathname - memoized for reactivity
  const activeView = useMemo(() => {
    console.log('Current pathname:', pathname); // Debug log
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
      {/* Search Popup Modal */}
      {showSearchPopup && (
        <div className="fixed inset-0 bg-white/70  z-50 flex items-start justify-center pt-20">
          <div 
            ref={popupRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[70vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200"
          >
            {/* Search Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for Mutual Funds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {isSearching ? (
                  <Loader2 className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" />
                ) : (
                  <button
                    onClick={() => {
                      setShowSearchPopup(false);
                      setSearchQuery('');
                      setSelectedIndex(-1);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {searchError ? (
                <div className="p-8 text-center text-red-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p>{searchError}</p>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="py-2">
                  {filteredResults.map((fund, index) => {
                    const minAmount = fund.minSipAmount || fund.minLumpsumAmount;
                    const isSelected = index === selectedIndex;
                    
                    return (
                      <div
                        key={fund._id}
                        onClick={() => handleFundClick(fund)}
                        className={`
                          flex items-center space-x-4 px-6 py-4 cursor-pointer transition-all duration-200
                          ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}
                        `}
                      >
                        {/* Green indicator dot */}
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        
                        {/* Fund Icon */}
                        <FundIcon fund={{ name: fund.fundName }} size="w-10 h-10" />
                        
                        {/* Fund Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 font-medium text-base truncate">
                            {toTitleCase(fund.fundName)}
                          </h3>
                          <div className="flex items-center space-x-6 mt-1 text-sm text-gray-500">
                            <span>Min: {formatCurrency(minAmount)}</span>
                            <span className="capitalize">
                              {fund.primaryCategory?.replace(/_/g, ' ').toLowerCase()}
                            </span>
                            <span>Others</span>
                            <span className="text-blue-600 font-medium">
                              {fund.fundType}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No funds found for "{searchQuery}"</p>
                  <p className="text-sm mt-1">Try searching with different keywords</p>
                </div>
              ) : !searchQuery ? (
                <div className="p-8 text-center text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg mb-1">Search Mutual Funds</p>
                  <p className="text-sm">Start typing to find your perfect investment</p>
                </div>
              ) : null}
            </div>

            {/* Navigation Instructions */}
            <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <ArrowUp className="w-3 h-3" />
                    <ArrowDown className="w-3 h-3" />
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">↵</div>
                    <span>Select</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">esc</div>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Onboarding Notification */}
      {shouldShowOnboarding && (
        <div className="fixed top-12 right-2 lg:top-14 lg:right-12 z-40 max-w-[280px] sm:max-w-[300px] lg:max-w-sm">
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

              {/* Navigation and Search Container - moved left */}
              <div className="flex items-center space-x-8 flex-1 justify-start ml-16">
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

                {/* Search Bar */}
                <div className="relative" ref={searchRef}>
                  <div 
                    onClick={handleSearchClick}
                    className="relative cursor-pointer"
                  >
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <div className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200 text-sm text-gray-500">
                        Search funds, transactions...
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
          
          {/* Desktop Moving Underline at Bottom Border - adjusted for 3 items */}
          <div 
            className={`
              absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full
              transition-all duration-400 ease-out
              ${isTransitioning ? 'opacity-70' : 'opacity-100'}
            `}
            style={{
              left: `calc(50% + ${(menuItems.findIndex(item => item.id === activeView) - 1) * 166 - 166}px - 50px)`,
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

              {/* Mobile Search and User Actions */}
              <div className="flex items-center space-x-2">
                {/* Mobile Search */}
                <div className="relative" ref={searchRef}>
                  <div 
                    onClick={handleSearchClick}
                    className="relative cursor-pointer"
                  >
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <div className="w-32 sm:w-40 pl-8 pr-8 py-1.5 border border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200 text-sm text-gray-400">
                        Search...
                      </div>
                    </div>
                  </div>
                </div>
                
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
                <div className="grid grid-cols-3 gap-2">
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
            
            {/* Mobile Moving Underline at Bottom Border - updated for 3 items */}
            <div 
              className={`
                absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full
                transition-all duration-400 ease-out
                ${isTransitioning ? 'opacity-70' : 'opacity-100'}
              `}
              style={{
                left: `${(menuItems.findIndex(item => item.id === activeView) * 33.33) + 8.33}%`,
                width: '16.67%',
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