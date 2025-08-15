import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Wallet, 
  Calendar,
  Banknote,
  DollarSign,
  Filter,
  MoreHorizontal,
  PieChart,
  BarChart3
} from 'lucide-react';

// Sub Navigation Component for Portfolio
const SubNavigation = ({ activeSubView, setActiveSubView, subMenuItems, isTransitioning }) => {
  // User data for welcome message
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  };

  const userDisplayInfo = useMemo(() => {
    const email = user.email || '';
    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : email.split('@')[0] || 'User';
    const shortName = name.length > 12 ? name.substring(0, 12) + '...' : name;
    
    return { email, name, shortName };
  }, [user]);

  const handleSubViewClick = useCallback((itemId) => {
    if (activeSubView !== itemId) {
      setActiveSubView(itemId);
    }
  }, [activeSubView, setActiveSubView]);

  return (
    <div className="border-b border-gray-200 w-full relative">
      {/* Desktop Sub Navigation */}
      <div className="hidden md:flex items-center justify-between w-full px-4 lg:px-8 relative">
        {/* Welcome Message - Left Side */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Welcome back, {userDisplayInfo.shortName}
            </h1>
            <p className="text-gray-500 text-xs">
              Track your investments and achieve your financial goals
            </p>
          </div>
        </div>

        {/* Sub Navigation - Right Side */}
        <div className="flex items-center space-x-12 relative">
          {subMenuItems.map((item) => {
            const isActive = activeSubView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSubViewClick(item.id)}
                className={`
                  flex items-center space-x-2 px-1 py-4 transition-all duration-200 font-medium text-sm whitespace-nowrap relative z-10
                  ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}
                  ${isTransitioning ? 'pointer-events-none' : ''}
                  hover:scale-105
                `}
                disabled={isTransitioning}
              >
                <div className={`flex-shrink-0 transition-all duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
                  {item.icon}
                </div>
                <span className="transition-all duration-200">{item.name}</span>
                
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Sub Navigation */}
      <div className="md:hidden px-4 py-2">
        {/* Welcome Message - Mobile */}
        <div className="mb-3">
          <h1 className="text-base font-semibold text-gray-900">
            Welcome back, {userDisplayInfo.shortName}
          </h1>
          <p className="text-gray-500 text-xs">
            Track your investments and achieve your financial goals
          </p>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto">
          {subMenuItems.map((item) => {
            const isActive = activeSubView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSubViewClick(item.id)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm whitespace-nowrap
                  ${isActive ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'}
                  ${isTransitioning ? 'pointer-events-none' : ''}
                `}
                disabled={isTransitioning}
              >
                <div className={`flex-shrink-0 transition-all duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
                  {item.icon}
                </div>
                <span className="transition-all duration-200">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Enhanced border with gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </div>
  );
};

// Portfolio Overview Component
const PortfolioOverview = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
      {/* Portfolio Summary Cards */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
        <div className="absolute -top-3 left-4 sm:left-8 bg-white px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Portfolio Overview
        </div>
        
        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x divide-blue-400/60 p-4 lg:p-0">
          {/* Total Portfolio Value */}
          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-blue-600 truncate">₹2,45,680</p>
              <p className="text-sm text-gray-600 truncate">Total Portfolio Value</p>
              <p className="text-xs text-green-600 mt-1 truncate">↑ 12.5% overall returns</p>
            </div>
          </div>
          
          {/* Current SIPs */}
          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <Target className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-gray-900 truncate">₹8,500</p>
              <p className="text-sm text-gray-600 truncate">Monthly SIP Amount</p>
              <p className="text-xs text-black mt-1 truncate">5 active SIPs</p>
            </div>
          </div>
          
          {/* Today's Gain/Loss */}
          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-green-600 truncate">+₹2,340</p>
              <p className="text-sm text-gray-600 truncate">Today's Gain</p>
              <p className="text-xs text-green-600 mt-1 truncate">+0.95% today</p>
            </div>
          </div>
          
          {/* Invested Amount */}
          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-gray-900 truncate">₹2,18,450</p>
              <p className="text-sm text-gray-600 truncate">Total Invested</p>
              <p className="text-xs text-black mt-1 truncate">XIRR: 15.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Portfolio Performance Chart */}
        <div className="xl:col-span-2 backdrop-blur-sm rounded-xl border border-blue-200/40 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Performance</h3>
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Portfolio Value</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                  <span className="text-sm text-gray-600">Invested Amount</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/70 rounded border border-blue-200/40 w-fit">6M</Button>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">As of today</p>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">₹2,45,680</p>
            <p className="text-sm text-green-600">+₹27,230 (+12.5%)</p>
          </div>
          
          {/* Portfolio Chart - Responsive */}
          <div className="h-48 lg:h-64 w-full bg-gradient-to-r from-blue-50/50 to-black/5 rounded border border-blue-100/50 flex items-center justify-center relative overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 600 250" preserveAspectRatio="xMidYMid meet">
              <defs>
                <pattern id="portfolioGrid" width="50" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#portfolioGrid)" />
              
              {/* Portfolio value line */}
              <path d="M 50 200 Q 100 190 150 180 Q 200 165 250 150 Q 300 140 350 130 Q 400 125 450 115 Q 500 105 550 95" 
                    stroke="#2563EB" strokeWidth="3" fill="none"/>
              {/* Invested amount line */}
              <path d="M 50 210 Q 100 205 150 200 Q 200 195 250 190 Q 300 185 350 180 Q 400 175 450 170 Q 500 165 550 160" 
                    stroke="#000000" strokeWidth="3" fill="none"/>
              
              {/* Month labels */}
              <text x="80" y="240" textAnchor="middle" className="fill-gray-500 text-xs">Jun</text>
              <text x="150" y="240" textAnchor="middle" className="fill-gray-500 text-xs">Jul</text>
              <text x="220" y="240" textAnchor="middle" className="fill-gray-500 text-xs">Aug</text>
              <text x="290" y="240" textAnchor="middle" className="fill-gray-500 text-xs">Sep</text>
              <text x="360" y="240" textAnchor="middle" className="fill-gray-500 text-xs">Oct</text>
              <text x="430" y="240" textAnchor="middle" className="fill-gray-500 text-xs">Nov</text>
              <text x="500" y="240" textAnchor="middle" className="fill-gray-500 text-xs">Dec</text>
            </svg>
          </div>
        </div>

        {/* Quick Actions - Responsive */}
        <div className="space-y-4">
          {/* Start SIP */}
          <div className="bg-white border border-blue-300 p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <div className="flex items-start space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 border border-blue-300 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm lg:text-base font-semibold text-gray-900 mb-1">Start New SIP</h4>
                <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4 leading-relaxed">Begin systematic investing with as little as ₹500 per month.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-3xl transition-colors">
                  Start SIP
                </Button>
              </div>
            </div>
          </div>

          {/* One-time Investment */}
          <div className="bg-white border border-blue-300 p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <div className="flex items-start space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 flex border border-blue-300 rounded-full items-center justify-center flex-shrink-0">
                <Banknote className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm lg:text-base font-semibold text-gray-900 mb-1">Lumpsum Investment</h4>
                <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4 leading-relaxed">Make a one-time investment in your favorite mutual funds.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-3xl transition-colors">
                  Invest Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings - Responsive Table */}
      <div className="backdrop-blur-sm rounded-3xl border border-blue-200/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4 lg:p-6 border-b border-blue-100/40">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Holdings</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/70 rounded border border-blue-200/40">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">View All</Button>
            </div>
          </div>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-48">Fund Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Investment</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Current Value</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Returns</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">SIP Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'HDFC Equity Fund', category: 'Large Cap • Equity', investment: '₹85,000', current: '₹98,450', returns: '+₹13,450 (+15.8%)', sip: '₹3,000', positive: true },
                { name: 'SBI Small Cap Fund', category: 'Small Cap • Equity', investment: '₹45,000', current: '₹52,340', returns: '+₹7,340 (+16.3%)', sip: '₹2,000', positive: true },
                { name: 'ICICI Prudential Bluechip', category: 'Large Cap • Equity', investment: '₹60,000', current: '₹66,780', returns: '+₹6,780 (+11.3%)', sip: '₹2,500', positive: true },
                { name: 'Axis Debt Fund', category: 'Debt • Medium Duration', investment: '₹28,450', current: '₹28,110', returns: '-₹340 (-1.2%)', sip: '₹1,000', positive: false }
              ].map((fund, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                  <td className="p-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{fund.name}</p>
                      <p className="text-gray-500">{fund.category}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-900">{fund.investment}</td>
                  <td className="p-4 text-sm text-gray-900">{fund.current}</td>
                  <td className="p-4 text-sm">
                    <span className={fund.positive ? 'text-green-600' : 'text-red-600'}>{fund.returns}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-900">{fund.sip}</td>
                  <td className="p-4 text-sm text-gray-900">
                    <Button variant="ghost" size="sm" className="hover:bg-white/50">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {[
            { name: 'HDFC Equity Fund', category: 'Large Cap • Equity', investment: '₹85,000', current: '₹98,450', returns: '+₹13,450 (+15.8%)', sip: '₹3,000', positive: true },
            { name: 'SBI Small Cap Fund', category: 'Small Cap • Equity', investment: '₹45,000', current: '₹52,340', returns: '+₹7,340 (+16.3%)', sip: '₹2,000', positive: true },
            { name: 'ICICI Prudential Bluechip', category: 'Large Cap • Equity', investment: '₹60,000', current: '₹66,780', returns: '+₹6,780 (+11.3%)', sip: '₹2,500', positive: true },
            { name: 'Axis Debt Fund', category: 'Debt • Medium Duration', investment: '₹28,450', current: '₹28,110', returns: '-₹340 (-1.2%)', sip: '₹1,000', positive: false }
          ].map((fund, index) => (
            <div key={index} className="p-4 hover:bg-white/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{fund.name}</h4>
                  <p className="text-sm text-gray-500">{fund.category}</p>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-white/50 ml-2">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Investment</p>
                  <p className="font-medium text-gray-900">{fund.investment}</p>
                </div>
                <div>
                  <p className="text-gray-500">Current Value</p>
                  <p className="font-medium text-gray-900">{fund.current}</p>
                </div>
                <div>
                  <p className="text-gray-500">Returns</p>
                  <p className={`font-medium ${fund.positive ? 'text-green-600' : 'text-red-600'}`}>{fund.returns}</p>
                </div>
                <div>
                  <p className="text-gray-500">SIP Amount</p>
                  <p className="font-medium text-gray-900">{fund.sip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Portfolio Analytics Component
const PortfolioAnalytics = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white border border-blue-200/40 p-4 lg:p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">15.2%</h3>
          <p className="text-sm text-gray-600">Annual Returns (XIRR)</p>
        </div>

        <div className="bg-white border border-blue-200/40 p-4 lg:p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-black/10 rounded-full flex items-center justify-center">
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-black" />
            </div>
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Low</span>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">8.4%</h3>
          <p className="text-sm text-gray-600">Portfolio Volatility</p>
        </div>

        <div className="bg-white border border-blue-200/40 p-4 lg:p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-black/10 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 lg:w-5 lg:h-5 text-black" />
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Excellent</span>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">1.82</h3>
          <p className="text-sm text-gray-600">Sharpe Ratio</p>
        </div>

        <div className="bg-white border border-blue-200/40 p-4 lg:p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600 transform rotate-180" />
            </div>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">-5.2%</span>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">-8.5%</h3>
          <p className="text-sm text-gray-600">Max Drawdown</p>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white border border-blue-200/40 p-4 lg:p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Asset Allocation</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-700">Equity Funds</span>
              </div>
              <span className="text-sm font-medium text-gray-900">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-black rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-700">Debt Funds</span>
              </div>
              <span className="text-sm font-medium text-gray-900">20%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-black h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-700">Gold ETF</span>
              </div>
              <span className="text-sm font-medium text-gray-900">5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '5%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-blue-200/40 p-4 lg:p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Top Holdings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-gray-900 truncate">HDFC Equity Fund</p>
                <p className="text-xs text-gray-500">Large Cap</p>
              </div>
              <span className="text-sm font-medium text-gray-900 flex-shrink-0">40.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-gray-900 truncate">SBI Small Cap Fund</p>
                <p className="text-xs text-gray-500">Small Cap</p>
              </div>
              <span className="text-sm font-medium text-gray-900 flex-shrink-0">21.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-gray-900 truncate">ICICI Prudential Bluechip</p>
                <p className="text-xs text-gray-500">Large Cap</p>
              </div>
              <span className="text-sm font-medium text-gray-900 flex-shrink-0">27.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-gray-900 truncate">Axis Debt Fund</p>
                <p className="text-xs text-gray-500">Debt</p>
              </div>
              <span className="text-sm font-medium text-gray-900 flex-shrink-0">11.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Portfolio Component with Sub-Navigation
const Portfolio = () => {
  const [activeSubView, setActiveSubView] = useState('overview');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const subMenuItems = useMemo(() => [
    {
      id: 'overview',
      name: 'Overview',
      icon: <PieChart className="w-5 h-5 flex-shrink-0" />
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: <BarChart3 className="w-5 h-5 flex-shrink-0" />
    }
  ], []);

  const handleSubViewChange = useCallback((subView) => {
    setIsTransitioning(true);
    setActiveSubView(subView);
    setTimeout(() => setIsTransitioning(false), 300);
  }, []);

  const renderSubContent = useCallback(() => {
    const content = (() => {
      switch (activeSubView) {
        case 'overview':
          return <PortfolioOverview />;
        case 'analytics':
          return <PortfolioAnalytics />;
        default:
          return <PortfolioOverview />;
      }
    })();

    return (
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}>
        {content}
      </div>
    );
  }, [activeSubView, isTransitioning]);

  return (
    <div className="space-y-6 w-full">
      <SubNavigation 
        activeSubView={activeSubView}
        setActiveSubView={handleSubViewChange}
        subMenuItems={subMenuItems}
        isTransitioning={isTransitioning}
      />
      
      <div className="min-h-[600px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(37 99 235) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="relative z-10">
          {renderSubContent()}
        </div>
        
        {isTransitioning && (
          <div className="absolute top-4 right-4 z-20">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;