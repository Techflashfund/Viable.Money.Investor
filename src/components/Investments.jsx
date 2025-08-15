import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Lightbulb, 
  Star, 
  TrendingUp,
  Filter,
  ArrowUpRight
} from 'lucide-react';

const Investments = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Explore Investments</h1>
        <p className="text-gray-600">Discover and invest in top-performing mutual funds</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              type="search"
              placeholder="Search mutual funds..."
              className="pl-10 h-11"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button variant="outline" className="h-11 px-6">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Quick Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-blue-200 p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Equity Funds</h3>
          <p className="text-sm text-gray-600">High growth potential</p>
        </div>

        <div className="bg-white border border-green-200 p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <Star className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Top Rated</h3>
          <p className="text-sm text-gray-600">Best performers</p>
        </div>

        <div className="bg-white border border-purple-200 p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <Lightbulb className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Recommended</h3>
          <p className="text-sm text-gray-600">For you</p>
        </div>

        <div className="bg-white border border-orange-200 p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <ArrowUpRight className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Tax Saving</h3>
          <p className="text-sm text-gray-600">ELSS funds</p>
        </div>
      </div>

      {/* Featured Funds */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Mutual Funds</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {[
            {
              name: 'Mirae Asset Large Cap Fund',
              category: 'Large Cap',
              returns: { '1y': '18.5%', '3y': '15.2%', '5y': '12.8%' },
              rating: 5,
              risk: 'Moderate',
              minInvestment: '₹500'
            },
            {
              name: 'Axis Small Cap Fund',
              category: 'Small Cap',
              returns: { '1y': '24.8%', '3y': '18.9%', '5y': '16.3%' },
              rating: 4,
              risk: 'High',
              minInvestment: '₹500'
            },
            {
              name: 'HDFC Hybrid Equity Fund',
              category: 'Hybrid',
              returns: { '1y': '14.2%', '3y': '12.6%', '5y': '11.1%' },
              rating: 4,
              risk: 'Low to Moderate',
              minInvestment: '₹100'
            },
            {
              name: 'SBI Blue Chip Fund',
              category: 'Large Cap',
              returns: { '1y': '16.7%', '3y': '13.9%', '5y': '11.5%' },
              rating: 4,
              risk: 'Moderate',
              minInvestment: '₹500'
            }
          ].map((fund, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{fund.name}</h3>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {fund.category}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < fund.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">1Y Returns</p>
                      <p className="text-sm font-semibold text-green-600">{fund.returns['1y']}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">3Y Returns</p>
                      <p className="text-sm font-semibold text-green-600">{fund.returns['3y']}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">5Y Returns</p>
                      <p className="text-sm font-semibold text-green-600">{fund.returns['5y']}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Risk: {fund.risk}</span>
                    <span>Min: {fund.minInvestment}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Invest Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 text-center">
          <Button variant="outline" className="px-8">
            View All Funds
          </Button>
        </div>
      </div>

      {/* Investment Categories */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Equity Funds</h3>
            <p className="text-sm text-gray-600 mb-4">Invest in stocks for long-term wealth creation</p>
            <Button variant="outline" size="sm">Explore</Button>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Debt Funds</h3>
            <p className="text-sm text-gray-600 mb-4">Stable returns with lower risk</p>
            <Button variant="outline" size="sm">Explore</Button>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Hybrid Funds</h3>
            <p className="text-sm text-gray-600 mb-4">Balanced approach with equity and debt</p>
            <Button variant="outline" size="sm">Explore</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investments;