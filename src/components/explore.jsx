import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Star,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Banknote,
  MoreHorizontal,
  Filter
} from 'lucide-react';

// Explore Component
const Explore = ({ onBack, investmentType }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Funds', count: 125 },
    { id: 'equity', name: 'Equity', count: 45 },
    { id: 'debt', name: 'Debt', count: 32 },
    { id: 'hybrid', name: 'Hybrid', count: 28 },
    { id: 'tax-saver', name: 'Tax Saver', count: 20 }
  ];

  const funds = [
    {
      id: 1,
      name: 'HDFC Top 100 Fund',
      category: 'Large Cap',
      type: 'Equity',
      rating: 4,
      returns: {
        '1y': '12.5%',
        '3y': '15.8%',
        '5y': '13.2%'
      },
      minSip: 500,
      minLumpsum: 5000,
      expenseRatio: '1.25%',
      aum: '₹12,450 Cr',
      risk: 'High'
    },
    {
      id: 2,
      name: 'SBI Small Cap Fund',
      category: 'Small Cap',
      type: 'Equity',
      rating: 5,
      returns: {
        '1y': '18.2%',
        '3y': '22.1%',
        '5y': '19.5%'
      },
      minSip: 500,
      minLumpsum: 5000,
      expenseRatio: '1.75%',
      aum: '₹8,230 Cr',
      risk: 'Very High'
    },
    {
      id: 3,
      name: 'ICICI Prudential Bluechip Fund',
      category: 'Large Cap',
      type: 'Equity',
      rating: 4,
      returns: {
        '1y': '11.8%',
        '3y': '14.2%',
        '5y': '12.9%'
      },
      minSip: 1000,
      minLumpsum: 5000,
      expenseRatio: '1.05%',
      aum: '₹15,670 Cr',
      risk: 'High'
    },
    {
      id: 4,
      name: 'Axis Liquid Fund',
      category: 'Liquid',
      type: 'Debt',
      rating: 4,
      returns: {
        '1y': '6.8%',
        '3y': '7.2%',
        '5y': '6.9%'
      },
      minSip: 1000,
      minLumpsum: 1000,
      expenseRatio: '0.20%',
      aum: '₹45,890 Cr',
      risk: 'Low'
    },
    {
      id: 5,
      name: 'Mirae Asset Tax Saver Fund',
      category: 'ELSS',
      type: 'Tax Saver',
      rating: 5,
      returns: {
        '1y': '16.5%',
        '3y': '18.9%',
        '5y': '16.2%'
      },
      minSip: 500,
      minLumpsum: 500,
      expenseRatio: '1.15%',
      aum: '₹9,450 Cr',
      risk: 'High'
    },
    {
      id: 6,
      name: 'HDFC Balanced Advantage Fund',
      category: 'Dynamic Asset Allocation',
      type: 'Hybrid',
      rating: 4,
      returns: {
        '1y': '9.8%',
        '3y': '12.1%',
        '5y': '11.5%'
      },
      minSip: 1000,
      minLumpsum: 5000,
      expenseRatio: '1.35%',
      aum: '₹23,120 Cr',
      risk: 'Moderate'
    },
    {
      id: 7,
      name: 'UTI Flexi Cap Fund',
      category: 'Flexi Cap',
      type: 'Equity',
      rating: 4,
      returns: {
        '1y': '14.2%',
        '3y': '16.8%',
        '5y': '14.5%'
      },
      minSip: 500,
      minLumpsum: 5000,
      expenseRatio: '1.45%',
      aum: '₹11,230 Cr',
      risk: 'High'
    },
    {
      id: 8,
      name: 'Kotak Corporate Bond Fund',
      category: 'Corporate Bond',
      type: 'Debt',
      rating: 3,
      returns: {
        '1y': '7.5%',
        '3y': '8.1%',
        '5y': '7.8%'
      },
      minSip: 1000,
      minLumpsum: 5000,
      expenseRatio: '0.45%',
      aum: '₹6,780 Cr',
      risk: 'Low'
    }
  ];

  const filteredFunds = funds.filter(fund => {
    const matchesCategory = selectedCategory === 'all' || 
      fund.type.toLowerCase() === selectedCategory || 
      (selectedCategory === 'tax-saver' && fund.category === 'ELSS');
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Very High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Explore Mutual Funds
            </h1>
            <p className="text-sm text-gray-600">
              {investmentType === 'sip' ? 'Start your SIP journey' : 'Make a lumpsum investment'}
            </p>
          </div>
        </div>
        
        {investmentType && (
          <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
            {investmentType === 'sip' ? (
              <Calendar className="w-4 h-4 text-blue-600" />
            ) : (
              <Banknote className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm font-medium text-blue-600">
              {investmentType === 'sip' ? 'SIP Investment' : 'Lumpsum Investment'}
            </span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-blue-200/40 rounded-xl p-4 lg:p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search funds by name, category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredFunds.length} funds
        </p>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Funds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredFunds.map((fund) => (
          <div
            key={fund.id}
            className="bg-white border border-blue-200/40 rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            {/* Fund Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{fund.name}</h3>
                <p className="text-sm text-gray-600">{fund.category} • {fund.type}</p>
              </div>
              <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                {renderStars(fund.rating)}
              </div>
            </div>

            {/* Performance */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Returns (Annualized)</span>
                <span className={`px-2 py-1 rounded text-xs ${getRiskColor(fund.risk)}`}>
                  {fund.risk} Risk
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">1Y</p>
                  <p className="font-medium text-green-600">{fund.returns['1y']}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">3Y</p>
                  <p className="font-medium text-green-600">{fund.returns['3y']}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">5Y</p>
                  <p className="font-medium text-green-600">{fund.returns['5y']}</p>
                </div>
              </div>
            </div>

            {/* Fund Details */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Min {investmentType === 'sip' ? 'SIP' : 'Investment'}:</span>
                <span className="font-medium">₹{investmentType === 'sip' ? fund.minSip : fund.minLumpsum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expense Ratio:</span>
                <span className="font-medium">{fund.expenseRatio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">AUM:</span>
                <span className="font-medium">{fund.aum}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm">
                {investmentType === 'sip' ? 'Start SIP' : 'Invest Now'}
              </Button>
              <Button variant="outline" size="sm" className="px-3">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {filteredFunds.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" className="bg-white hover:bg-gray-50">
            Load More Funds
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* No Results */}
      {filteredFunds.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No funds found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Explore;