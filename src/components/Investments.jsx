'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Lightbulb, 
  Star, 
  TrendingUp,
  Filter,
  ArrowUpRight,
  Target,
  Shield,
  PieChart,
  BarChart3,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  Eye
} from 'lucide-react';

// Fund Icon Component (matching your existing theme)
const FundIcon = ({ fund, size = "w-12 h-12" }) => {
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

const Investments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    {
      icon: TrendingUp,
      title: 'Equity Funds',
      description: 'High growth potential',
      color: 'blue',
      count: 245
    },
    {
      icon: Star,
      title: 'Top Rated',
      description: 'Best performers',
      color: 'green',
      count: 180
    },
    {
      icon: Lightbulb,
      title: 'Recommended',
      description: 'For you',
      color: 'purple',
      count: 120
    },
    {
      icon: ArrowUpRight,
      title: 'Tax Saving',
      description: 'ELSS funds',
      color: 'orange',
      count: 85
    }
  ];

  const funds = [
    {
      name: 'Mirae Asset Large Cap Fund',
      category: 'Large Cap',
      returns: { '1y': '18.5%', '3y': '15.2%', '5y': '12.8%' },
      rating: 5,
      risk: 'Moderate',
      minInvestment: '₹500',
      nav: '156.43',
      aum: '₹25,847 Cr',
      expenseRatio: '1.57%'
    },
    {
      name: 'Axis Small Cap Fund',
      category: 'Small Cap',
      returns: { '1y': '24.8%', '3y': '18.9%', '5y': '16.3%' },
      rating: 4,
      risk: 'High',
      minInvestment: '₹500',
      nav: '89.12',
      aum: '₹8,942 Cr',
      expenseRatio: '1.89%'
    },
    {
      name: 'HDFC Hybrid Equity Fund',
      category: 'Hybrid',
      returns: { '1y': '14.2%', '3y': '12.6%', '5y': '11.1%' },
      rating: 4,
      risk: 'Low to Moderate',
      minInvestment: '₹100',
      nav: '78.65',
      aum: '₹15,234 Cr',
      expenseRatio: '1.32%'
    },
    {
      name: 'SBI Blue Chip Fund',
      category: 'Large Cap',
      returns: { '1y': '16.7%', '3y': '13.9%', '5y': '11.5%' },
      rating: 4,
      risk: 'Moderate',
      minInvestment: '₹500',
      nav: '134.21',
      aum: '₹32,156 Cr',
      expenseRatio: '1.45%'
    }
  ];

  const handleInvest = (fund) => {
    console.log('Invest in:', fund);
  };

  const handleViewDetails = (fund) => {
    console.log('View details for:', fund);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-3">Explore Investments</h1>
        <p className="text-gray-600 text-base lg:text-lg">Discover and invest in top-performing mutual funds</p>
      </div>

      {/* Search and Filters */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
        <div className="absolute -top-3 left-4 sm:left-8 bg-blue-50 px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Search & Filter
        </div>
        
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                type="search"
                placeholder="Search mutual funds by name, category, or AMC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Button variant="outline" className="h-12 px-6 border-gray-300 hover:border-gray-400">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Available Mutual Funds */}
      <div className="bg-white border border-gray-200 overflow-hidden mb-6 lg:mb-8">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Available Mutual Funds</h2>
          <Button variant="outline" className="border-gray-300 hover:border-gray-400">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-4 text-xs font-medium text-gray-700">Fund Details</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">Category</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">Returns (1Y/3Y/5Y)</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">Risk</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">Status</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((fund, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <FundIcon fund={fund} size="w-8 h-8" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{fund.name}</h3>
                        <p className="text-xs text-gray-500">by ABC Mutual Fund</p>
                        <p className="text-xs text-gray-400">1 plans available</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-600 text-xs font-medium">{fund.category}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-4 text-xs">
                      <span className="text-green-600 font-medium">{fund.returns['1y']}</span>
                      <span className="text-green-600 font-medium">{fund.returns['3y']}</span>
                      <span className="text-green-600 font-medium">{fund.returns['5y']}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium ${
                      fund.risk === 'Low' ? 'text-green-600' :
                      fund.risk === 'Moderate' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {fund.risk}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-green-600 text-xs font-medium">active</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <Button 
                        size="sm"
                        onClick={() => handleInvest(fund)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs flex items-center"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        SIP
                      </Button>
                      <button 
                        onClick={() => handleViewDetails(fund)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {funds.map((fund, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3 mb-3">
                <FundIcon fund={fund} size="w-8 h-8" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{fund.name}</h3>
                  <p className="text-xs text-gray-500">by ABC Mutual Fund</p>
                  <p className="text-xs text-gray-400">1 plans available</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="text-blue-600 font-medium ml-2">{fund.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Risk:</span>
                  <span className={`font-medium ml-2 ${
                    fund.risk === 'Low' ? 'text-green-600' :
                    fund.risk === 'Moderate' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {fund.risk}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-500 text-xs mb-1">Returns (1Y/3Y/5Y):</p>
                <div className="flex space-x-4 text-xs">
                  <span className="text-green-600 font-medium">{fund.returns['1y']}</span>
                  <span className="text-green-600 font-medium">{fund.returns['3y']}</span>
                  <span className="text-green-600 font-medium">{fund.returns['5y']}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-green-600 font-medium text-xs">active</span>
                <div className="flex items-center space-x-3">
                  <Button 
                    size="sm"
                    onClick={() => handleInvest(fund)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs flex items-center"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    SIP
                  </Button>
                  <button 
                    onClick={() => handleViewDetails(fund)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Insights */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 relative">
        <div className="absolute -top-3 left-4 sm:left-8 bg-blue-50 px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Investment Insights
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-0 lg:divide-x divide-blue-400/60 p-4 lg:p-0">
          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <h3 className="font-semibold text-gray-900 mb-2">Market Insights</h3>
              <p className="text-sm text-gray-600 mb-4">Get detailed analysis and market trends to make informed investment decisions.</p>
              <Button variant="outline" size="sm" className="border-green-300 hover:bg-green-50">
                View Insights
              </Button>
            </div>
          </div>

          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <Target className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <h3 className="font-semibold text-gray-900 mb-2">Goal Planning</h3>
              <p className="text-sm text-gray-600 mb-4">Plan your investments based on your financial goals and risk appetite.</p>
              <Button variant="outline" size="sm" className="border-blue-300 hover:bg-blue-50">
                Start Planning
              </Button>
            </div>
          </div>

          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <Lightbulb className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <h3 className="font-semibold text-gray-900 mb-2">Expert Advice</h3>
              <p className="text-sm text-gray-600 mb-4">Get personalized investment recommendations from our financial experts.</p>
              <Button variant="outline" size="sm" className="border-purple-300 hover:bg-purple-50">
                Get Advice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investments;