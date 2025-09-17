'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Wallet, 
  Calendar,
  Banknote,
  IndianRupee,
  Filter,
  MoreHorizontal,
  PieChart,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  X,
  Eye,
  ShoppingCart,
  GitCompare,
  Clock,CreditCard
} from 'lucide-react';
import useAuthStore from '@/store/auth';
import { useRouter } from 'next/navigation';

// Skeleton Loading Components
const SkeletonCard = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-300 rounded-lg h-full animate-pulse"></div>
  </div>
);

const SkeletonPortfolioSummary = () => (
  <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-4 md:mb-6 lg:mb-8 relative mx-2 md:mx-4 lg:mx-8">
    <div className="absolute -top-2 md:-top-3 left-2 md:left-4 lg:left-8 bg-blue-50 px-2 md:px-4 py-0.5 md:py-1 text-xs md:text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
      <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-0 lg:divide-x divide-blue-400/60 p-2 md:p-4 lg:p-0">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 md:p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
          <div className="absolute -left-2 md:-left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full animate-pulse z-10 shadow-sm">
          </div>
          <div className="pl-4 md:pl-6 lg:pl-8">
            <div className="w-24 h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
            <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonHoldings = () => (
  <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm mx-2 md:mx-4 lg:mx-8">
    <div className="p-3 md:p-4 lg:p-6 border-b border-blue-100/40">
      <div className="flex flex-col space-y-3 md:space-y-4 lg:space-y-0 lg:flex-row lg:items-center justify-between">
        <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
        <div className="flex items-center space-x-2">
          <div className="w-16 h-8 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-20 h-8 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
    
    <div className="lg:hidden divide-y divide-gray-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 md:p-4">
          <div className="flex items-center space-x-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="w-40 h-4 bg-gray-300 rounded animate-pulse mb-1"></div>
              <div className="w-24 h-3 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j}>
                <div className="w-16 h-3 bg-gray-300 rounded animate-pulse mb-1"></div>
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {['Fund Name', 'Investment', 'Current Value', 'Returns', 'Units', 'Action'].map((header, i) => (
              <th key={i} className="text-left p-4">
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-300 rounded animate-pulse mb-1"></div>
                    <div className="w-24 h-3 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              </td>
              {[1, 2, 3, 4, 5].map((j) => (
                <td key={j} className="p-4">
                  <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Fund Icon Component
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

// Sub Navigation Component for Portfolio
const SubNavigation = ({ activeSubView, setActiveSubView, subMenuItems, isTransitioning }) => {
  const handleSubViewClick = useCallback((itemId) => {
    if (activeSubView !== itemId) {
      setActiveSubView(itemId);
    }
  }, [activeSubView, setActiveSubView]);

  return (
    <div className="border-b border-gray-200 w-full relative">
      {/* Desktop Sub Navigation */}
      <div className="hidden md:flex items-center justify-start w-full px-4 lg:px-8 relative">
        {/* Sub Navigation - Left Side */}
        <div className="flex items-center space-x-12 relative">
          {subMenuItems.map((item) => {
            const isActive = activeSubView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSubViewClick(item.id)}
                className={`
                  flex items-center space-x-2 px-1 py-4 transition-all duration-200 font-medium text-sm whitespace-nowrap relative
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
      <div className="md:hidden px-2 py-2">
        <div className="flex space-x-1 overflow-x-auto">
          {subMenuItems.map((item) => {
            const isActive = activeSubView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSubViewClick(item.id)}
                className={`
                  flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm whitespace-nowrap
                  ${isActive ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'}
                  ${isTransitioning ? 'pointer-events-none' : ''}
                `}
                disabled={isTransitioning}
              >
                <div className={`flex-shrink-0 transition-all duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
                  {React.cloneElement(item.icon, { className: 'w-4 h-4' })}
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






const BottomQuickActions = () => {
  const router = useRouter();

  const quickActions = [
    {
      title: "Start New SIP",
      description: "Starting from ₹500 per month",
      buttonText: "Start SIP",
      route: "/dashboard/explore"
    },
    {
      title: "Lumpsum Investment", 
      description: "Make a one-time investment",
      buttonText: "Invest Now",
      route: "/dashboard/explore"
    },
    {
      title: "View Cart",
      description: "Review selected funds before investing",
      buttonText: "View Cart", 
      route: "/dashboard/cart"
    },
    {
      title: "Compare Funds",
      description: "Compare performance of mutual funds",
      buttonText: "Compare Now",
      route: "/dashboard/compare"
    }
  ];

  return (
    <section className="w-full border-t border-blue-200/40 mt-8" role="region" aria-label="Quick Actions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Actions</h2>
          <p className="text-gray-600">Start your investment journey with these simple steps</p>
        </div>
        
        {/* Actions Grid */}
        <div className="bg-white border-1 border-blue-400/50 transition-all duration-300 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const isNotFirst = index > 0;
              
              return (
                <div 
                  key={action.title}
                  className={`
                    relative p-5 flex flex-col min-h-[120px] text-center
                    border-b sm:border-b-0 last:border-b-0
                    ${isNotFirst ? 'sm:border-l border-blue-200/60' : ''}
                    hover:bg-blue-50/30 transition-colors duration-200
                    group
                  `}
                >
                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-900 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex justify-center">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-5 rounded-full transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                      onClick={() => router.push(action.route)}
                      aria-label={`${action.buttonText} - ${action.description}`}
                    >
                      {action.buttonText}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Optional Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need help? <button className="text-blue-600 hover:text-blue-700 underline font-medium">Contact our support team</button>
          </p>
        </div>
      </div>
    </section>
  );
};

// Empty Portfolio Component
const EmptyPortfolio = () => {
  const router = useRouter();

  return (
    <div className="px-4 py-8 md:p-8 lg:p-16 flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Wallet className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Investment Journey</h3>
      <p className="text-gray-600 mb-6 max-w-md">
        You haven't made any investments yet. Begin building wealth with our curated mutual fund selection.
      </p>
      <Button 
        onClick={() => router.push('/dashboard/explore')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3  font-semibold rounded-full"
      >
        Start Investment
      </Button>
    </div>
  );
};

// Portfolio Overview Component with Real Data
const PortfolioOverview = ({ portfolioData, navData, loading, error, onRefresh }) => {
  const [expandedHolding, setExpandedHolding] = useState(null);
  const router = useRouter();

  const toggleExpansion = (folioNumber, holdingIndex) => {
    const key = `${folioNumber}-${holdingIndex}`;
    setExpandedHolding(expandedHolding === key ? null : key);
  };

  // Calculate portfolio metrics
  const calculatePortfolioMetrics = () => {
    if (!portfolioData) return { totalValue: 0, totalInvested: 0, totalGain: 0, gainPercentage: 0 };

    let totalValue = 0;
    let totalInvested = portfolioData.totalInvestment || 0;

    portfolioData.folios?.forEach(folio => {
      folio.fundHoldings?.forEach(holding => {
        const navInfo = navData[holding.schemeCode];
        if (navInfo && navInfo.nav && holding.totalUnits) {
          totalValue += holding.totalUnits * parseFloat(navInfo.nav);
        }
      });
    });

    const totalGain = totalValue - totalInvested;
    const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return { totalValue, totalInvested, totalGain, gainPercentage };
  };

  const { totalValue, totalInvested, totalGain, gainPercentage } = calculatePortfolioMetrics();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('₹', '₹');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-full mt-0 lg:mt-3.5">
        <SkeletonPortfolioSummary />
        <SkeletonHoldings />
      </div>
    );
  }

  if (error || !portfolioData || portfolioData.totalFunds === 0) {
    return <EmptyPortfolio />;
  }

  return (
    <div className="w-full max-w-full mt-3.5">
      {/* Portfolio Summary Cards - Full Width */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-4 md:mb-6 lg:mb-8 relative mx-2 md:mx-4 lg:mx-8">
        <div className="absolute -top-2 md:-top-3 left-2 md:left-4 lg:left-8 bg-blue-50 px-2 md:px-4 py-0.5 md:py-1 text-xs md:text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Portfolio Overview
        </div>
        
        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-0 lg:divide-x divide-blue-400/60 p-2 md:p-4 lg:p-0">
          {/* Total Portfolio Value */}
          <div className="p-3 md:p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
            <div className="absolute -left-2 md:-left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <Wallet className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="pl-4 md:pl-6 lg:pl-8">
              <p className="text-lg md:text-xl lg:text-2xl font-medium font-sans text-blue-600 truncate">{formatCurrency(totalValue)}</p>
              <p className="text-xs md:text-sm text-gray-600 truncate">Total Portfolio Value</p>
            </div>
          </div>
          
          {/* Total Gained Percentage */}
          <div className="p-3 md:p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
            <div className="absolute -left-2 md:-left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="pl-4 md:pl-6 lg:pl-8">
              <p className="text-lg md:text-xl lg:text-2xl font-medium font-sans text-green-600 truncate">
                {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
              </p>
              <p className="text-xs md:text-sm text-gray-600 truncate">Total Gained</p>
            </div>
          </div>
          
          {/* Invested Amount */}
          <div className="p-3 md:p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
            <div className="absolute -left-2 md:-left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <IndianRupee className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-black" />
            </div>
            <div className="pl-4 md:pl-6 lg:pl-8">
              <p className="text-lg md:text-xl lg:text-2xl font-medium font-sans text-gray-900 truncate">{formatCurrency(totalInvested)}</p>
              <p className="text-xs md:text-sm text-gray-600 truncate">Total Invested</p>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings - Real Data - Full Width */}
      <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow mx-2 md:mx-4 lg:mx-8">
        <div className="p-3 md:p-4 lg:p-6 border-b border-blue-100/40">
          <div className="flex flex-col space-y-3 md:space-y-4 lg:space-y-0 lg:flex-row lg:items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Your Holdings</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/70 rounded border border-blue-200/40 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2">
                <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Filter
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2">View All</Button>
            </div>
          </div>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm font-medium text-gray-900">Fund Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900">Investment</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900">Current Value</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900">Returns</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900">Units</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.folios?.map(folio => 
                folio.fundHoldings?.map((holding, index) => {
                  const navInfo = navData[holding.schemeCode];
                  const currentValue = navInfo && navInfo.nav ? holding.totalUnits * parseFloat(navInfo.nav) : holding.totalInvested;
                  const returns = currentValue - holding.totalInvested;
                  const returnsPercentage = holding.totalInvested > 0 ? (returns / holding.totalInvested) * 100 : 0;
                  const key = `${folio.folioNumber}-${index}`;
                  const isExpanded = expandedHolding === key;
                  
                  return (
                    <React.Fragment key={key}>
                      <tr className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                        <td className="p-4 text-sm">
                          <div className="flex items-center space-x-3">
                            <FundIcon fund={{ name: navInfo?.scheme_name || `Scheme ${holding.schemeCode}` }} size="w-8 h-8" />
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900">
                                {navInfo?.scheme_name || `Scheme ${holding.schemeCode}`}
                              </div>
                              <p className="text-gray-500 text-xs">
                                {navInfo?.fund_house || ''} • Folio: {folio.folioNumber}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-900">{formatCurrency(holding.totalInvested)}</td>
                        <td className="p-4 text-sm text-gray-900">{formatCurrency(currentValue)}</td>
                        <td className="p-4 text-sm">
                          <span className={returns >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {returns >= 0 ? '+' : ''}{formatCurrency(returns)} ({returnsPercentage >= 0 ? '+' : ''}{returnsPercentage.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-900">{holding.totalUnits.toFixed(3)}</td>
                        <td className="p-4 text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-blue-50 p-1"
                              onClick={() => toggleExpansion(folio.folioNumber, index)}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-white/50 p-1">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Transaction History */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="px-4 py-0">
                            <div className=" rounded-lg p-4 mb-2">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Transaction History ({holding.transactions?.length || 0} transactions)
                              </h4>
                              
                              {holding.transactions && holding.transactions.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full border border-gray-200 rounded-lg bg-white">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="text-left p-3 text-xs font-medium text-gray-700">Date</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-700">Amount</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-700">NAV</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-700">Units</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-700">Type</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {holding.transactions.map((transaction, txIndex) => (
                                        <tr key={txIndex} className="border-b border-gray-100 last:border-b-0">
                                          <td className="p-3 text-xs text-gray-900">
                                            {formatDate(transaction.date)}
                                          </td>
                                          <td className="p-3 text-xs text-gray-900">
                                            {formatCurrency(transaction.purchaseAmount)}
                                          </td>
                                          <td className="p-3 text-xs text-gray-900">
                                            ₹{transaction.nav.toFixed(3)}
                                          </td>
                                          <td className="p-3 text-xs text-gray-900">
                                            {transaction.units.toFixed(3)}
                                          </td>
                                          <td className="p-3 text-xs">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                              Purchase
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                  No transactions found
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {portfolioData.folios?.map(folio => 
            folio.fundHoldings?.map((holding, index) => {
              const navInfo = navData[holding.schemeCode];
              const currentValue = navInfo && navInfo.nav ? holding.totalUnits * parseFloat(navInfo.nav) : holding.totalInvested;
              const returns = currentValue - holding.totalInvested;
              const returnsPercentage = holding.totalInvested > 0 ? (returns / holding.totalInvested) * 100 : 0;
              const key = `${folio.folioNumber}-${index}`;
              const isExpanded = expandedHolding === key;
              
              return (
                <div key={key} className="hover:bg-white/50 transition-colors">
                  <div className="p-3 md:p-4">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FundIcon fund={{ name: navInfo?.scheme_name || `Scheme ${holding.schemeCode}` }} size="w-8 h-8 md:w-10 md:h-10" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm md:font-medium text-gray-900 truncate">
                            {navInfo?.scheme_name || `Scheme ${holding.schemeCode}`}
                          </div>
                          <p className="text-xs md:text-sm text-gray-500">
                            {navInfo?.fund_house || ''} • Folio: {folio.folioNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-blue-50 p-1 md:p-2"
                          onClick={() => toggleExpansion(folio.folioNumber, index)}
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /> : <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-white/50 p-1 md:p-2">
                          <MoreHorizontal className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                      <div>
                        <p className="text-gray-500">Investment</p>
                        <p className="font-medium text-gray-900">{formatCurrency(holding.totalInvested)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Current Value</p>
                        <p className="font-medium text-gray-900">{formatCurrency(currentValue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Returns</p>
                        <p className={`font-medium ${returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {returns >= 0 ? '+' : ''}{formatCurrency(returns)} ({returnsPercentage >= 0 ? '+' : ''}{returnsPercentage.toFixed(2)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Units</p>
                        <p className="font-medium text-gray-900">{holding.totalUnits.toFixed(3)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Transaction History for Mobile */}
                  {isExpanded && (
                    <div className="px-3 pb-3 md:px-4 md:pb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Transaction History ({holding.transactions?.length || 0})
                        </h4>
                        
                        {holding.transactions && holding.transactions.length > 0 ? (
                          <div className="space-y-2">
                            {holding.transactions.map((transaction, txIndex) => (
                              <div key={txIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <p className="text-gray-500">Date</p>
                                    <p className="font-medium text-gray-900">{formatDate(transaction.date)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Amount</p>
                                    <p className="font-medium text-gray-900">{formatCurrency(transaction.purchaseAmount)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">NAV</p>
                                    <p className="font-medium text-gray-900">₹{transaction.nav.toFixed(3)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Units</p>
                                    <p className="font-medium text-gray-900">{transaction.units.toFixed(3)}</p>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Purchase
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No transactions found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Portfolio Analytics Component - Coming Soon
const PortfolioAnalytics = () => {
  return (
    <div className="w-full max-w-full mt-0 lg:mt-3.5">
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We're working on advanced portfolio analytics including performance metrics, 
            risk analysis, and detailed insights to help you make better investment decisions.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Advanced Analytics Dashboard</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">Expected Launch: Q2 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Portfolio Component with API Integration
const Portfolio = () => {
  const [activeView, setActiveView] = useState('portfolio');
  const [activeSubView, setActiveSubView] = useState('overview');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [navData, setNavData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const { user, getAuthHeaders } = useAuthStore();

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

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://viable-money-be.onrender.com/api/portfolio/${user.userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setPortfolioData(null);
          setError('No portfolio found');
          return;
        }
        throw new Error(`Failed to fetch portfolio: ${response.status}`);
      }

      const result = await response.json();
      console.log('result',result)
      if (result.success) {
        setPortfolioData(result.data);
        
        // Fetch NAV data for all scheme codes
        const schemeCodes = [];
        result.data.folios?.forEach(folio => {
          folio.fundHoldings?.forEach(holding => {
            if (!schemeCodes.includes(holding.schemeCode)) {
              schemeCodes.push(holding.schemeCode);
            }
          });
        });

        // Fetch NAV data and metadata for each scheme
        const navPromises = schemeCodes.map(async (schemeCode) => {
          try {
            const navResponse = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`);
            const navResult = await navResponse.json();
            
            if (navResult.status === 'SUCCESS' && navResult.data?.[0]?.nav) {
              return [schemeCode, {
                nav: navResult.data[0].nav,
                scheme_name: navResult.meta?.scheme_name || `Scheme ${schemeCode}`,
                fund_house: navResult.meta?.fund_house || '',
                scheme_category: navResult.meta?.scheme_category || '',
                scheme_type: navResult.meta?.scheme_type || ''
              }];
            }
            return [schemeCode, null];
          } catch (error) {
            console.error(`Error fetching NAV for scheme ${schemeCode}:`, error);
            return [schemeCode, null];
          }
        });

        const navResults = await Promise.all(navPromises);
        const navMap = Object.fromEntries(navResults);
        setNavData(navMap);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, getAuthHeaders]);

  // Initial data fetch
  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const handleSubViewChange = useCallback((subView) => {
    setIsTransitioning(true);
    setActiveSubView(subView);
    setTimeout(() => setIsTransitioning(false), 300);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const renderSubContent = useCallback(() => {
    const content = (() => {
      switch (activeSubView) {
        case 'overview':
          return (
            <PortfolioOverview 
              portfolioData={portfolioData}
              navData={navData}
              loading={loading}
              error={error}
              onRefresh={handleRefresh}
            />
          );
        case 'analytics':
          return <PortfolioAnalytics />;
        default:
          return (
            <PortfolioOverview 
              portfolioData={portfolioData}
              navData={navData}
              loading={loading}
              error={error}
              onRefresh={handleRefresh}
            />
          );
      }
    })();

    return (
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}>
        {content}
      </div>
    );
  }, [activeSubView, isTransitioning, portfolioData, navData, loading, error, handleRefresh]);

  return (
    <div className="w-full">
      {/* Full Width Layout */}
      <div className="space-y-0 md:space-y-6 w-full">
        <SubNavigation 
          activeSubView={activeSubView}
          setActiveSubView={handleSubViewChange}
          subMenuItems={subMenuItems}
          isTransitioning={isTransitioning}
        />
        
        <div className="relative overflow-hidden">
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
            <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20">
              <div className="w-4 h-4 md:w-6 md:h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          
         

          {/* Bottom Quick Actions for Desktop */}
          <BottomQuickActions />
        </div>
      </div>
    </div>
  );
};

export default Portfolio;