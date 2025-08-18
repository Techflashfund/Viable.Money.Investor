import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAuthStore from '@/store/auth';
import { 
  TrendingUp, 
  Target, 
  PieChart, 
  Activity, 
  Wallet, 
  MoreHorizontal,
  Settings,
  Bell,
  User,
  LogOut,
  Search,
  HelpCircle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Tooltip Component
const Tooltip = ({ children, content, show }) => {
  if (!show || !content) return children;
  
  return (
    <div className="relative group">
      {children}
      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
        {content}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
          <div className="border-2 border-transparent border-b-gray-800"></div>
        </div>
      </div>
    </div>
  );
};

const UserTopNav = ({ activeView, setActiveView }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  
  // Get user data from auth store
  const { user, onboardingstatus } = useAuthStore();
  
  // Check if onboarding is needed
  const needsOnboarding = !onboardingstatus || onboardingstatus === false;

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
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [activeView, setActiveView]);

  const handleLogout = useCallback(() => {
    console.log('Logout clicked');
    alert('Logout functionality - would redirect to login page');
  }, []);

  const handleOnboardingClick = useCallback(() => {
    window.location.href = '/onboarding';
  }, []);

  return (
    <div className="w-full">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="InvestFund Logo" 
            className="h-16 object-contain"
          />
        </div>

        {/* Main Navigation */}
        <nav ref={navRef} className="flex items-center space-x-8 px-4">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <div 
                key={item.id}
                className={`
                  group flex items-center space-x-2 cursor-pointer transition-all duration-200 relative py-2 px-1
                  ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}
                  ${isTransitioning ? 'pointer-events-none' : ''}
                `}
                onClick={() => handleItemClick(item)}
              >
                <div className={`flex-shrink-0 transition-all duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
                  {item.icon}
                </div>
                <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                
                <div className={`
                  absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500 
                  transition-all duration-300 ease-out rounded-full
                  ${isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100'}
                `} />
              </div>
            );
          })}
        </nav>

        {/* Onboarding Notification */}
        {needsOnboarding && (
          <div 
            onClick={handleOnboardingClick}
            className="cursor-pointer mx-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-700">Complete your onboarding</span>
            </div>
          </div>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search investments..."
              className="pl-9 w-48 h-9 border-gray-200 bg-white/70 backdrop-blur-sm focus:bg-white transition-colors duration-200 text-sm"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 bg-white/50 hover:bg-white/70 hover:scale-105 transition-all duration-200">
            <HelpCircle className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative bg-white/50 hover:bg-white/70 hover:scale-105 transition-all duration-200">
            <Bell className="w-4 h-4" />
            <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -right-1 border border-white animate-pulse"></div>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-9 bg-white/60 hover:bg-white/80 border border-blue-100/50 hover:scale-105 transition-all duration-200">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-medium">{userDisplayInfo.initial}</span>
                </div>
                <span className="font-medium text-sm">{userDisplayInfo.shortName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm w-48">
              <DropdownMenuItem className="flex items-center space-x-2 hover:bg-blue-50/50">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center space-x-2 hover:bg-blue-50/50">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50/50">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile/Tablet Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="font-bold text-lg text-gray-900">InvestSmart</div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative bg-white/50 hover:bg-white/70">
              <Bell className="w-4 h-4" />
              <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -right-1 border border-white animate-pulse"></div>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-8 bg-white/60 hover:bg-white/80 border border-blue-100/50">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-medium">{userDisplayInfo.initial}</span>
                  </div>
                  <span className="font-medium text-sm hidden sm:block">{userDisplayInfo.shortName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm w-48">
                <DropdownMenuItem className="flex items-center space-x-2 hover:bg-blue-50/50">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2 hover:bg-blue-50/50">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50/50">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Onboarding Notification */}
        {needsOnboarding && (
          <div 
            onClick={handleOnboardingClick}
            className="cursor-pointer mx-4 mb-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-700">Complete your onboarding</span>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-4 gap-1 p-2">
            {menuItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  className={`
                    flex flex-col items-center justify-center space-y-1 p-3 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'}
                  `}
                  onClick={() => handleItemClick(item)}
                >
                  <div className={`transition-all duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-xs">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTopNav;