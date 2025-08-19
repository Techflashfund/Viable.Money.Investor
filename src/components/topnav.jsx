import React, { useState, useRef, useMemo, useCallback } from 'react';
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
  HelpCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserTopNav = ({ activeView, setActiveView }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navRef = useRef(null);
  
  // Get user data from auth store
  const { user } = useAuthStore();
  
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
    console.log('Logout clicked');
    alert('Logout functionality - would redirect to login page');
  }, []);

  return (
    <div className="w-full border-b border-gray-200">
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

        {/* Main Navigation with Moving Underline */}
        <nav ref={navRef} className="relative">
          <div className="flex items-center space-x-8 px-4 py-2">
            {/* Moving underline indicator */}
            <div 
              className={`
                absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full
                transition-all duration-400 ease-out
                ${isTransitioning ? 'opacity-70' : 'opacity-100'}
              `}
              style={{
                left: `${(menuItems.findIndex(item => item.id === activeView) * 140) + 16}px`,
                width: '120px',
                transform: isTransitioning ? 'scaleX(0.8)' : 'scaleX(1)'
              }}
            />
            
            {menuItems.map((item, index) => {
              const isActive = activeView === item.id;
              return (
                <div 
                  key={item.id}
                  className={`
                    flex items-center space-x-2 cursor-pointer transition-all duration-300 py-1 px-1 relative
                    ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}
                    ${isTransitioning ? 'pointer-events-none' : ''}
                  `}
                  style={{ width: '120px', justifyContent: 'center' }}
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
              <Button variant="ghost" className="flex items-center space-x-2 h-9 bg-white/60 hover:bg-white/80 border border-blue-100/50 hover:scale-105 transition-all duration-200 rounded-xl">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-medium">{userDisplayInfo.initial}</span>
                </div>
                <span className="font-medium text-sm">{userDisplayInfo.shortName}</span>
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
              <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-lg">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-8 bg-white/60 hover:bg-white/80 border border-blue-100/50 rounded-xl">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-medium">{userDisplayInfo.initial}</span>
                  </div>
                  <span className="font-medium text-sm hidden sm:block">{userDisplayInfo.shortName}</span>
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
                <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-lg">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation with Moving Underline */}
        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="relative px-2 py-2">
            {/* Mobile moving underline */}
            <div 
              className={`
                absolute bottom-2 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full
                transition-all duration-400 ease-out
                ${isTransitioning ? 'opacity-70' : 'opacity-100'}
              `}
              style={{
                left: `${(menuItems.findIndex(item => item.id === activeView) * 25) + 2}%`,
                width: '21%',
                transform: isTransitioning ? 'scaleX(0.8)' : 'scaleX(1)'
              }}
            />
            
            <div className="grid grid-cols-4 gap-1">
              {menuItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    className={`
                      flex flex-col items-center justify-center space-y-1 p-3 rounded-lg transition-all duration-300
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
      </div>
    </div>
  );
};

export default UserTopNav;