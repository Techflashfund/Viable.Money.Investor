'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Filter,
  Loader2,
  AlertCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

// Utility function to convert text to camelCase
const toCamelCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
};

// Utility function to format fund name for display (capitalize first letter of each word)
const formatFundName = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Skeleton Components
const FundTableSkeleton = () => {
  return (
    <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm mx-0 md:mx-0">
      <div className="p-3 md:p-4 lg:p-6 border-b border-blue-100/40">
        <div className="flex items-center justify-between">
          <div className="h-5 md:h-6 bg-gray-200 rounded w-32 md:w-48 animate-pulse"></div>
          <div className="h-6 md:h-8 bg-gray-200 rounded w-16 md:w-20 animate-pulse"></div>
        </div>
      </div>
      
      {/* Desktop Skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 text-sm font-medium text-gray-900">Fund Name</th>
              <th className="text-left p-4 text-sm font-medium text-gray-900">Category</th>
              <th className="text-left p-4 text-sm font-medium text-gray-900">Min Amount</th>
              <th className="text-left p-4 text-sm font-medium text-gray-900">Current NAV</th>
              <th className="text-left p-4 text-sm font-medium text-gray-900">1Yr NAV</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Skeleton */}
      <div className="lg:hidden">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fund Icon Component
const FundIcon = ({ fund, size = "w-8 h-8" }) => {
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

// Main Explore Component
const Explore = () => {
  // Navigation function (placeholder - replace with your actual router)
  const navigateToFund = (itemId) => {
    // Replace this with your actual navigation logic
    if (typeof window !== 'undefined') {
      window.location.href = `/dashboard/explore/${itemId}`;
    }
    console.log(`Navigating to /dashboard/explore/${itemId}`);
  };

  // State management for filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'fundName',
    sortOrder: 'asc'
  });
  
  // Separate search term state for immediate UI updates
  const [searchTerm, setSearchTerm] = useState('');
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalFunds: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const [loading, setLoading] = useState(false);
  const [fundSearchLoading, setFundSearchLoading] = useState(false);
  const [funds, setFunds] = useState([]);
  const [errors, setErrors] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'equity', name: 'Equity' },
    { id: 'debt', name: 'Debt' },
    { id: 'hybrid', name: 'Hybrid' },
    { id: 'elss', name: 'ELSS' }
  ];

  const sortOptions = [
    { value: 'fundName', label: 'Fund Name' },
    { value: 'minSipAmount', label: 'Min SIP Amount' },
    { value: 'minLumpsumAmount', label: 'Min Lumpsum Amount' }
  ];

  // Fetch funds on component mount
  useEffect(() => {
    fetchFunds();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (filters.search !== searchTerm) {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(searchDebounce);
  }, [searchTerm]);

  // Fetch funds when filters or pagination change
  useEffect(() => {
    fetchFunds();
  }, [filters, pagination.page, pagination.limit]);

  const fetchFunds = async () => {
    try {
      setFundSearchLoading(true);
      setErrors({});
      
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      
      // Add filters only if they have values
      if (filters.search && filters.search.trim() !== '') {
        queryParams.append('search', filters.search.trim());
      }
      
      if (filters.category && filters.category !== '') {
        queryParams.append('category', filters.category);
      }
      
      if (filters.minAmount && filters.minAmount !== '') {
        queryParams.append('minAmount', filters.minAmount);
      }
      
      if (filters.maxAmount && filters.maxAmount !== '') {
        queryParams.append('maxAmount', filters.maxAmount);
      }
      
      if (filters.sortBy && filters.sortBy !== '') {
        queryParams.append('sortBy', filters.sortBy);
      }
      
      if (filters.sortOrder && filters.sortOrder !== '') {
        queryParams.append('sortOrder', filters.sortOrder);
      }
      
      const requestUrl = `https://investment.flashfund.in/api/ondc/funds?${queryParams.toString()}`;
      
      console.log('Fetching funds with URL:', requestUrl);
      
      const response = await fetch(requestUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success && data.data) {
        const activeFunds = data.data.filter(fund => 
          fund.fulfillments && fund.fulfillments.length > 0
        );
        
        const processedFunds = processFundsData(activeFunds);
        setFunds(processedFunds);
        
        // Update pagination info
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: data.pagination.totalPages || 1,
            totalFunds: data.pagination.totalFunds || 0,
            hasNext: data.pagination.hasNext || false,
            hasPrev: data.pagination.hasPrev || false
          }));
        }
      } else {
        console.error('API returned unsuccessful response:', data);
        setErrors({ fundSearch: 'Failed to load funds. Please try again.' });
      }
      
    } catch (error) {
      console.error('Error fetching funds:', error);
      setErrors({ fundSearch: `Failed to load funds: ${error.message}` });
    } finally {
      setFundSearchLoading(false);
    }
  };

  const processFundsData = (rawFunds) => {
    return rawFunds.map(fund => {
      return {
        id: fund.fundId || fund.itemId || fund._id,
        name: formatFundName(fund.fundName || fund.schemeName || 'N/A'),
        camelCaseName: toCamelCase(fund.fundName || fund.schemeName || 'N/A'),
        category: getCategoryDisplayName(fund.primaryCategory),
        type: fund.primaryCategory || 'mixed',
        providerId: fund.providerId,
        fulfillments: fund.fulfillments || [],
        investmentTypes: fund.investmentTypes || [],
        minSip: fund.minSipAmount || null,
        minLumpsum: fund.minLumpsumAmount || null,
        maxSip: fund.maxSipAmount || null,
        rawData: fund
      };
    });
  };

  const getCategoryDisplayName = (primaryCategory) => {
    if (!primaryCategory) return 'Mixed';
    
    if (primaryCategory.includes('equity') || primaryCategory.includes('EQUITY')) return 'Equity';
    if (primaryCategory.includes('debt') || primaryCategory.includes('DEBT')) return 'Debt';
    if (primaryCategory.includes('hybrid') || primaryCategory.includes('HYBRID')) return 'Hybrid';
    if (primaryCategory.includes('elss') || primaryCategory.includes('ELSS')) return 'ELSS';
    
    return 'Mixed';
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    if (key === 'search') {
      setSearchTerm(value);
      return;
    }
    
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle pagination changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handlePageSizeChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Handle fund click to navigate to details page
  const handleFundClick = (fund) => {
    navigateToFund(fund.id);
  };

  const getMinAmountDisplay = (fund) => {
    const amounts = [];
    if (fund.minSip) amounts.push(`SIP: ₹${fund.minSip.toLocaleString()}`);
    if (fund.minLumpsum) amounts.push(`Lumpsum: ₹${fund.minLumpsum.toLocaleString()}`);
    return amounts.length > 0 ? amounts.join(' | ') : 'N/A';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      search: '',
      category: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'fundName',
      sortOrder: 'asc'
    });
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
    if (!showFilters === false) {
      setShowAdvancedFilters(false);
    }
  };

  return (
    <div className="px-0 py-2 md:p-4 lg:p-8 overflow-x-auto">
      {/* Loading line animation */}
      {fundSearchLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            style={{
              animation: 'loading-sweep 1.5s ease-in-out infinite'
            }}
          />
        </div>
      )}

      {/* Header */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-3 md:mb-4 lg:mb-6 relative mx-2 md:mx-0">
        <div className="absolute -top-2 md:-top-3 left-2 md:left-4 lg:left-8 bg-white px-2 md:px-4 py-0.5 md:py-1 text-xs md:text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Explore Mutual Funds
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div>
              <h1 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">
                Mutual Fund Investments
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                Browse and explore our curated list of mutual funds
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 md:space-y-3 lg:items-end">
            <div className="flex items-center space-x-2 bg-blue-50 px-3 md:px-4 py-1.5 md:py-2 border border-blue-200/40">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
              <span className="text-xs md:text-sm font-medium text-blue-600">
                Click to view details
              </span>
            </div>
            
            <Button
              onClick={toggleFilters}
              className="bg-white hover:bg-blue-100 text-black border border-blue-200 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm"
            >
              <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.fundSearch && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 mx-2 md:mx-0">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-400 mr-2 md:mr-3" />
            <div>
              <p className="text-xs md:text-sm font-medium text-red-800">{errors.fundSearch}</p>
              <button 
                onClick={fetchFunds}
                className="text-xs md:text-sm text-red-600 hover:text-red-700 underline mt-1"
              >
                Retry loading funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters - Collapsible */}
      {showFilters && (
        <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow p-3 md:p-4 lg:p-6 mb-4 md:mb-6 mx-2 md:mx-0">
          <div className="flex flex-col space-y-3 md:space-y-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search funds by name..."
                className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border border-blue-200/40 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={fundSearchLoading}
              />
            </div>
            
            {/* Quick Filters Row */}
            <div className="flex flex-wrap gap-2 md:gap-4">
              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 md:px-4 py-1.5 md:py-2 border border-blue-200/40 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm text-xs md:text-sm"
                disabled={fundSearchLoading}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Advanced Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="bg-white/50 hover:bg-white/70 border border-blue-200/40 text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5"
              >
                <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Advanced Filters
              </Button>

              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="bg-white/50 hover:bg-white/70 border border-blue-200/40 text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5"
              >
                Clear All
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                  <input
                    type="number"
                    placeholder="Min amount"
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                  <input
                    type="number"
                    placeholder="Max amount"
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Count and Pagination Info */}
      {showFilters && !fundSearchLoading && funds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 space-y-2 sm:space-y-0 mx-2 md:mx-0">
          <div className="flex items-center space-x-3 md:space-x-4">
            <p className="text-xs md:text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalFunds)} of {pagination.totalFunds} funds
            </p>
            <select
              value={pagination.limit}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 md:px-3 py-1 border border-gray-300 rounded text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading State - Show Skeleton */}
      {fundSearchLoading && <FundTableSkeleton />}

      {/* Funds Table - NEW STRUCTURE WITHOUT ACTION BUTTONS */}
      {!fundSearchLoading && funds.length > 0 && (
        <div className="backdrop-blur-sm overflow-hidden mx-0 md:mx-0">
          <div className="p-3 md:p-4 lg:p-6 border-b border-blue-400/50 mx-2 md:mx-0" style={{ borderBottomWidth: '1px' }}>
            <div className="flex flex-col space-y-3 md:space-y-4 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Available Mutual Funds</h3>
            </div>
          </div>
          
          {/* Desktop Table - WITH NAV COLUMNS */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-200/50" style={{ borderBottomWidth: '1px' }}>
                  <th className="text-left p-4 text-sm font-medium text-gray-900">Fund Name</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900">Min Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900">Current NAV</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900">1Yr NAV</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((fund, index) => (
                  <tr 
                    key={fund.id} 
                    className="border-b border-blue-300/50 hover:bg-white/50 transition-colors cursor-pointer" 
                    style={{ borderBottomWidth: '1px' }}
                    onClick={() => handleFundClick(fund)}
                  >
                    <td className="p-4 text-sm">
                      <div className="flex items-center space-x-3">
                        <FundIcon fund={fund} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 hover:text-blue-600 truncate">{fund.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {fund.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="text-xs text-gray-600">
                        {getMinAmountDisplay(fund)}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="text-xs text-gray-500">Data not available</span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="text-xs text-gray-500">Data not available</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - WITH NAV INFO */}
          <div className="lg:hidden">
            {funds.map((fund, index) => (
              <div 
                key={fund.id} 
                className="px-4 py-4 hover:bg-white/50 transition-colors border-b border-gray-200 cursor-pointer"
                style={{ 
                  borderBottomWidth: '1px',
                  marginLeft: 0,
                  marginRight: 0
                }} 
                onClick={() => handleFundClick(fund)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FundIcon fund={fund} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate">{fund.name}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          {fund.category}
                        </span>
                        <span className="text-xs text-gray-600">{getMinAmountDisplay(fund)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1 ml-3 text-right">
                    <div className="text-xs text-gray-500">
                      <div>Current NAV: N/A</div>
                      <div>1Yr NAV: N/A</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!fundSearchLoading && funds.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 md:mt-6 p-3 md:p-4 bg-white border border-gray-200 rounded-lg shadow-sm mx-2 md:mx-0">
          <div className="flex items-center space-x-1 md:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm"
            >
              <ChevronsLeft className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm ${pagination.page === pageNum ? "bg-blue-600 text-white" : ""}`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm"
            >
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm"
            >
              <ChevronsRight className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* No Results */}
      {!fundSearchLoading && funds.length === 0 && (
        <div className="text-center py-8 md:py-12 mx-2 md:mx-0">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Search className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
          </div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No funds found</h3>
          <p className="text-sm md:text-base text-gray-600">Try adjusting your search or filter criteria</p>
          <Button 
            onClick={clearFilters}
            className="mt-3 md:mt-4 text-sm md:text-base"
            variant="outline"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes loading-sweep {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default Explore;