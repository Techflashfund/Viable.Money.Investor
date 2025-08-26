'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Banknote,
  MoreHorizontal,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  FileText,
  Wallet,
  Target,
  IndianRupee,
  BarChart3,
  PieChart,
  Info,
  Star,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

// Import transaction components
import SIPTransaction from './siptransaction';
import LumpsumTransaction from './lumpsumtransaction';
import FundDetails from './funddetails';

// Skeleton Components
const FundTableSkeleton = () => {
  return (
    <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm">
      <div className="p-4 lg:p-6 border-b border-blue-100/40">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>
      
      {/* Desktop Skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-64">Fund Details</th>
              <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Category</th>
              <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Investment Types</th>
              <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-24">Min Amount</th>
              <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-900 w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Skeleton */}
      <div className="lg:hidden divide-y divide-gray-100">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              ))}
            </div>

            <div className="h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

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

// Main Explore Component
const Explore = ({ onBack, investmentType }) => {
  // State management for filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    amc: '',
    investmentType: '',
    minAmount: '',
    maxAmount: '',
    isin: '',
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
  const [amcs, setAmcs] = useState([]);
  const [errors, setErrors] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fund details view
  const [showFundDetails, setShowFundDetails] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  
  // Transaction flow states
  const [showSIPFlow, setShowSIPFlow] = useState(false);
  const [showLumpsumFlow, setShowLumpsumFlow] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(null);
  
  // Hard-coded values for investor
  const HARDCODED_VALUES = {
    userId: "68788d1562333d9d86a53daf",
    clientData: {
      name: "John Doe",
      pan: "AHUFG2929U"
    },
    distributor: {
      arn: "ARN-123456",
      euin: "E12345"
    }
  };

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'equity', name: 'Equity' },
    { id: 'debt', name: 'Debt' },
    { id: 'hybrid', name: 'Hybrid' },
    { id: 'elss', name: 'ELSS' }
  ];

  const investmentTypes = [
    { id: '', name: 'All Types' },
    { id: 'SIP', name: 'SIP' },
    { id: 'LUMPSUM', name: 'Lumpsum' },
    { id: 'REDEMPTION', name: 'Redemption' }
  ];

  const sortOptions = [
    { value: 'fundName', label: 'Fund Name' },
    { value: 'amcName', label: 'AMC Name' },
    { value: 'minSipAmount', label: 'Min SIP Amount' },
    { value: 'minLumpsumAmount', label: 'Min Lumpsum Amount' }
  ];

  // Fetch AMCs and funds on component mount
  useEffect(() => {
    fetchAmcs();
    fetchFunds();
  }, []);

  // Debounced search effect - update filters.search after user stops typing
  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (filters.search !== searchTerm) {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
      }
    }, 500); // 500ms delay

    return () => clearTimeout(searchDebounce);
  }, [searchTerm]);

  // Fetch funds when filters or pagination change
  useEffect(() => {
    fetchFunds();
  }, [filters, pagination.page, pagination.limit]);

  const fetchAmcs = async () => {
    try {
      const response = await fetch('https://investment.flashfund.in/api/ondc/amcs');
      const data = await response.json();
      
      if (data.success && data.data) {
        const amcOptions = [
          { id: '', name: 'All AMCs' },
          ...data.data
            .filter(amc => amc._id && amc._id.trim() !== '') // Filter out empty AMC names
            .map(amc => ({
              id: amc._id,
              name: `${amc._id} (${amc.count})`,
              value: amc._id // Store the actual value to send to API
            }))
        ];
        setAmcs(amcOptions);
      }
    } catch (error) {
      console.error('Error fetching AMCs:', error);
    }
  };

  const fetchFunds = async () => {
    try {
      setFundSearchLoading(true);
      setErrors({});
      
      // Build query parameters with AMC filtering workaround
      let queryParams = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      };
      
      // Add other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') {
          if (key === 'amc') {
            // For AMC filtering, use both amc parameter and search parameter
            // This helps catch funds where amcName is empty but scheme name contains AMC name
            queryParams[key] = value;
            
            // Also add search parameter to catch funds by scheme name
            const amcSearchTerms = {
              '360 ONE Mutual Fund': '360 ONE',
              'HDFC Mutual Fund': 'HDFC',
              'ICICI Prudential Mutual Fund': 'ICICI',
              'Axis Mutual Fund': 'Axis',
              'Kotak Mahindra Mutual Fund': 'Kotak',
              'Aditya Birla Sun Life Mutual Fund': 'Aditya Birla',
              'DSP Mutual Fund': 'DSP',
              'Motilal Oswal Mutual Fund': 'Motilal Oswal',
              'Nippon India Mutual Fund': 'Nippon',
              'Quant Mutual Fund': 'Quant',
              'UTI Mutual Fund': 'UTI'
            };
            
            // If we have a search term for this AMC, add it (only if no explicit search is set)
            if (amcSearchTerms[value] && !filters.search) {
              queryParams.search = amcSearchTerms[value];
            }
          } else {
            queryParams[key] = value;
          }
        }
      });
      
      const params = new URLSearchParams(queryParams);
      
      // Debug: Log the request URL
      const requestUrl = `https://investment.flashfund.in/api/ondc/funds?${params}`;
      console.log('Fetching funds with URL:', requestUrl);
      console.log('Applied filters:', filters);
      
      const response = await fetch(requestUrl);
      const data = await response.json();
      
      console.log('API Response data length:', data.data?.length || 0);
      
      if (data.success && data.data) {
        // Filter out funds with empty fulfillments array
        const activeFunds = data.data.filter(fund => 
          fund.fulfillments && fund.fulfillments.length > 0
        );
        
        console.log('Active funds count:', activeFunds.length);
        console.log('Filtered by AMC:', filters.amc);
        
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
        setErrors({ fundSearch: 'Failed to load funds. Please try again.' });
      }
      
      setFundSearchLoading(false);
    } catch (error) {
      console.error('Error fetching funds:', error);
      setErrors({ fundSearch: 'Failed to load funds. Please try again.' });
      setFundSearchLoading(false);
    }
  };

  const processFundsData = (rawFunds) => {
    return rawFunds.map(fund => {
      // Extract AMC name with better logic
      let amcName = 'N/A';
      
      if (fund.amcName && fund.amcName.trim() !== '') {
        amcName = fund.amcName;
      } else if (fund.schemeName) {
        // Try to extract AMC name from scheme name
        const schemeName = fund.schemeName;
        if (schemeName.includes('360 ONE')) {
          amcName = '360 ONE Mutual Fund';
        } else if (schemeName.includes('HDFC')) {
          amcName = 'HDFC Mutual Fund';
        } else if (schemeName.includes('ICICI')) {
          amcName = 'ICICI Prudential Mutual Fund';
        } else if (schemeName.includes('Axis')) {
          amcName = 'Axis Mutual Fund';
        } else if (schemeName.includes('Kotak')) {
          amcName = 'Kotak Mahindra Mutual Fund';
        } else if (schemeName.includes('Aditya Birla')) {
          amcName = 'Aditya Birla Sun Life Mutual Fund';
        } else if (schemeName.includes('DSP')) {
          amcName = 'DSP Mutual Fund';
        } else if (schemeName.includes('Motilal Oswal')) {
          amcName = 'Motilal Oswal Mutual Fund';
        } else if (schemeName.includes('Nippon')) {
          amcName = 'Nippon India Mutual Fund';
        } else if (schemeName.includes('Quant')) {
          amcName = 'Quant Mutual Fund';
        } else if (schemeName.includes('UTI')) {
          amcName = 'UTI Mutual Fund';
        }
      }

      return {
        id: fund.fundId || fund.itemId || fund._id,
        name: fund.fundName || fund.schemeName || 'N/A',
        creator: amcName,
        category: getCategoryDisplayName(fund.primaryCategory),
        type: fund.primaryCategory || 'mixed',
        status: fund.isActive ? 'active' : 'inactive',
        providerId: fund.providerId,
        fulfillments: fund.fulfillments || [],
        investmentTypes: fund.investmentTypes || [],
        minSip: fund.minSipAmount || null,
        minLumpsum: fund.minLumpsumAmount || null,
        maxSip: fund.maxSipAmount || null,
        isin: fund.isin || fund.planIdentifiers?.isin || null,
        planOptions: fund.planOptions || null,
        categories: fund.categories || [],
        rawData: fund // Store original data for transaction processing
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
      // Handle search separately to avoid focus issues
      setSearchTerm(value);
      return;
    }
    
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
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

  // Handle fund details view
  const handleFundClick = (fund) => {
    setSelectedFund(fund);
    setShowFundDetails(true);
  };

  // Handle investment from details page
  const handleInvestmentFromDetails = (fund, type) => {
    if (type === 'sip') {
      setShowSIPFlow(true);
    } else if (type === 'purchase') {
      setShowLumpsumFlow(true);
    }
    setShowFundDetails(false);
  };

  // Handle fund investment
  const handleInvestment = (fund, type) => {
    setSelectedFund(fund);
    
    if (type === 'sip') {
      setShowSIPFlow(true);
    } else if (type === 'purchase') {
      setShowLumpsumFlow(true);
    }
  };

  // Handle back from transaction flows
  const handleBackFromTransaction = () => {
    setShowSIPFlow(false);
    setShowLumpsumFlow(false);
    setSelectedFund(null);
    setTransactionSuccess(null);
  };

  // Handle back from fund details
  const handleBackFromDetails = () => {
    setShowFundDetails(false);
    setSelectedFund(null);
  };

  // Handle folio selection completion for both SIP and Lumpsum
  const handleFolioSelection = (responseData, folioType) => {
    console.log('Folio selection complete:', folioType, responseData);
    
    // Set success state with transaction details
    setTransactionSuccess({
      type: showSIPFlow ? 'SIP' : 'LUMPSUM',
      folioType: folioType,
      data: responseData,
      fund: selectedFund
    });

    // Hide transaction flows
    setShowSIPFlow(false);
    setShowLumpsumFlow(false);
    
    // Show success message for 3 seconds then reset
    setTimeout(() => {
      setTransactionSuccess(null);
      setSelectedFund(null);
    }, 3000);
  };

  const getInvestmentTypeBadges = (investmentTypes) => {
    if (!investmentTypes || investmentTypes.length === 0) return null;
    
    return investmentTypes.slice(0, 2).map(type => (
      <span key={type} className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full mr-1">
        {type}
      </span>
    ));
  };

  const getMinAmountDisplay = (fund) => {
    const amounts = [];
    if (fund.minSip) amounts.push(`SIP: ₹${fund.minSip}`);
    if (fund.minLumpsum) amounts.push(`Lumpsum: ₹${fund.minLumpsum}`);
    return amounts.length > 0 ? amounts.join(', ') : 'N/A';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm(''); // Clear search term
    setFilters({
      search: '',
      category: '',
      amc: '',
      investmentType: '',
      minAmount: '',
      maxAmount: '',
      isin: '',
      sortBy: 'fundName',
      sortOrder: 'asc'
    });
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
    // Close advanced filters if main filters are hidden
    if (!showFilters === false) {
      setShowAdvancedFilters(false);
    }
  };

  // If showing fund details, render fund details component
  if (showFundDetails) {
    return (
      <FundDetails
        fund={selectedFund}
        onBack={handleBackFromDetails}
        onInvest={handleInvestmentFromDetails}
      />
    );
  }

  // If showing transaction flows, render them
  if (showSIPFlow) {
    return (
      <SIPTransaction
        clientData={HARDCODED_VALUES.clientData}
        fundData={selectedFund}
        transactionData={{
          providerId: selectedFund?.providerId,
          itemId: selectedFund?.id,
          fulfillmentId: selectedFund?.fulfillments?.find(f => f.type === 'SIP')?.fulfillmentId
        }}
        onBack={handleBackFromTransaction}
        onFolioSelection={handleFolioSelection}
      />
    );
  }

  if (showLumpsumFlow) {
    return (
      <LumpsumTransaction
        clientData={HARDCODED_VALUES.clientData}
        fundData={selectedFund}
        transactionData={{
          providerId: selectedFund?.providerId,
          itemId: selectedFund?.id,
          fulfillmentId: selectedFund?.fulfillments?.find(f => f.type === 'LUMPSUM')?.fulfillmentId
        }}
        onBack={handleBackFromTransaction}
        onFolioSelection={handleFolioSelection}
      />
    );
  }

  // Success Animation Overlay
  if (transactionSuccess) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {transactionSuccess.type === 'SIP' ? 'SIP Setup Complete!' : 'Investment Submitted!'}
            </h3>
            <p className="text-gray-600 mb-4">
              {transactionSuccess.folioType === 'new' 
                ? 'New folio created successfully. You can now proceed with payment.'
                : 'Transaction processed successfully.'
              }
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-900 font-medium">{transactionSuccess.fund?.name}</p>
              <p className="text-xs text-blue-700">by {transactionSuccess.fund?.creator}</p>
            </div>
            
            <div className="flex justify-center mt-4 space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
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
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-4 lg:mb-6 relative">
        <div className="absolute -top-3 left-4 sm:left-8 bg-white px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Explore Mutual Funds
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:p-6 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                {investmentType === 'sip' ? 'Start SIP Investment' : 'Make Lumpsum Investment'}
              </h1>
              <p className="text-sm text-gray-600">
                Choose from our curated list of top-performing mutual funds
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3 lg:items-end">
            {investmentType && (
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 border border-blue-200/40">
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
            
            {/* Filter Toggle Button */}
            <Button
              onClick={toggleFilters}
              className="bg-white hover:bg-blue-100 text-black border border-blue-200 px-4 py-2 rounded-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.fundSearch && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-800">{errors.fundSearch}</p>
              <button 
                onClick={fetchFunds}
                className="text-sm text-red-600 hover:text-red-700 underline mt-1"
              >
                Retry loading funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters - Collapsible */}
      {showFilters && (
        <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 lg:p-6 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search funds by name, AMC, ISIN..."
                className="w-full pl-10 pr-4 py-3 border border-blue-200/40 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={fundSearchLoading}
              />
            </div>
            
            {/* Quick Filters Row */}
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-2 border border-blue-200/40 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm"
                disabled={fundSearchLoading}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* AMC Filter */}
              {amcs.length > 0 && (
                <select
                  value={filters.amc}
                  onChange={(e) => handleFilterChange('amc', e.target.value)}
                  className="px-4 py-2 border border-blue-200/40 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm"
                  disabled={fundSearchLoading}
                >
                  {amcs.map(amc => (
                    <option key={amc.id} value={amc.value || amc.id}>
                      {amc.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Investment Type Filter */}
              <select
                value={filters.investmentType}
                onChange={(e) => handleFilterChange('investmentType', e.target.value)}
                className="px-4 py-2 border border-blue-200/40 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm"
                disabled={fundSearchLoading}
              >
                {investmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>

              {/* Advanced Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="bg-white/50 hover:bg-white/70 border border-blue-200/40"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>

              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="bg-white/50 hover:bg-white/70 border border-blue-200/40"
              >
                Clear All
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                  <input
                    type="number"
                    placeholder="Min amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                  <input
                    type="number"
                    placeholder="Max amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Count and Pagination Info - Only show when filters are visible */}
      {showFilters && !fundSearchLoading && funds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalFunds)} of {pagination.totalFunds} funds
            </p>
            <select
              value={pagination.limit}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Funds Table */}
      {!fundSearchLoading && funds.length > 0 && (
        <div className="backdrop-blur-sm overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-blue-400/50" style={{ borderBottomWidth: '1px' }}>
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Available Mutual Funds</h3>
            </div>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-200/50" style={{ borderBottomWidth: '1px' }}>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-64">Fund Details</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Investment Types</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-24">Min Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 w-32">Action</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((fund, index) => (
                  <tr key={fund.id} className="border-b border-blue-300/50 hover:bg-white/50 transition-colors" style={{ borderBottomWidth: '1px' }}>
                    <td className="p-4 text-sm">
                      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleFundClick(fund)}>
                        <FundIcon fund={fund} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1 hover:text-blue-600">{fund.name}</p>
                          <p className="text-gray-500 text-xs">by {fund.creator}</p>
                          {fund.isin && (
                            <p className="text-gray-400 text-xs mt-1">ISIN: {fund.isin}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {fund.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {getInvestmentTypeBadges(fund.investmentTypes)}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="text-xs text-gray-600">
                        {getMinAmountDisplay(fund)}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        fund.status === 'active' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        {fund.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvestment(fund, investmentType === 'sip' ? 'sip' : 'purchase');
                          }}
                          disabled={fund.status !== 'active'}
                        >
                          {investmentType === 'sip' ? (
                            <>
                              <Calendar className="w-3 h-3 mr-1" />
                              SIP
                            </>
                          ) : (
                            <>
                              <Wallet className="w-3 h-3 mr-1" />
                              Invest
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-white/50 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFundClick(fund);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden" style={{ borderTop: '1px solid rgb(96 165 250 / 0.5)' }}>
            {funds.map((fund, index) => (
              <div key={fund.id} className="p-4 hover:bg-white/50 transition-colors border-b border-blue-400/50" style={{ borderBottomWidth: '1px' }} onClick={() => handleFundClick(fund)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FundIcon fund={fund} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1 hover:text-blue-600 truncate">{fund.name}</h4>
                      <p className="text-sm text-gray-500 truncate">by {fund.creator}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="hover:bg-white/50 ml-2 flex-shrink-0">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">Category</p>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                      {fund.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Investment Types</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getInvestmentTypeBadges(fund.investmentTypes)}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Min Amount</p>
                    <div className="text-xs text-gray-600">
                      {getMinAmountDisplay(fund)}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      fund.status === 'active' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {fund.status}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInvestment(fund, investmentType === 'sip' ? 'sip' : 'purchase');
                  }}
                  disabled={fund.status !== 'active'}
                >
                  {investmentType === 'sip' ? (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Start SIP
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Invest Now
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!fundSearchLoading && funds.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Page numbers */}
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
                  className={pagination.page === pageNum ? "bg-blue-600 text-white" : ""}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* No Results */}
      {!fundSearchLoading && funds.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No funds found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          <Button 
            onClick={clearFilters}
            className="mt-4"
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