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
  Target
} from 'lucide-react';

// Import transaction components
import SIPTransaction from './siptransaction';
import LumpsumTransaction from './lumpsumtransaction';

// Explore Component with Real API Integration
const Explore = ({ onBack, investmentType }) => {
  // State management
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fundSearchLoading, setFundSearchLoading] = useState(false);
  const [funds, setFunds] = useState([]);
  const [searchTransactionId, setSearchTransactionId] = useState('');
  const [apiResponseData, setApiResponseData] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Transaction flow states
  const [showSIPFlow, setShowSIPFlow] = useState(false);
  const [showLumpsumFlow, setShowLumpsumFlow] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [transactionSuccess, setTransactionSuccess] = useState(null);
  
  // Hard-coded values for investor (transaction ID comes from API)
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
    { id: 'all', name: 'All Funds', count: 0 },
    { id: 'equity', name: 'Equity', count: 0 },
    { id: 'debt', name: 'Debt', count: 0 },
    { id: 'hybrid', name: 'Hybrid', count: 0 },
    { id: 'tax-saver', name: 'Tax Saver', count: 0 }
  ];

  // Fetch funds on component mount
  useEffect(() => {
    searchFunds();
  }, []);

  const searchFunds = async () => {
    try {
      setFundSearchLoading(true);
      setFunds([]);
      setErrors({});
      
      // First, initiate search
      const searchResponse = await fetch('https://preprod.wyable.in/api/ondc/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           userId: HARDCODED_VALUES.userId
        })
      });
      
      const searchData = await searchResponse.json();
      
      if (searchData.success && searchData.data.transactionId) {
        setSearchTransactionId(searchData.data.transactionId);
        
        // Poll for results
        await pollForFundResults(searchData.data.transactionId);
      } else {
        throw new Error('Failed to initiate fund search');
      }
    } catch (error) {
      console.error('Error searching funds:', error);
      setErrors({ fundSearch: 'Failed to load funds. Please try again.' });
      setFundSearchLoading(false);
    }
  };

  const pollForFundResults = async (transactionId, maxAttempts = 10, currentAttempt = 0) => {
    try {
      const response = await fetch('https://preprod.wyable.in/api/fund/find-select-response-by-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: transactionId
        })
      });
      
      const data = await response.json();
      
      if (data && data.message && data.message.catalog) {
        // Store the complete API response for transaction details extraction
        setApiResponseData(data);
        
        // Successfully got fund data
        const extractedFunds = extractFundsFromResponse(data);
        setFunds(extractedFunds);
        setFundSearchLoading(false);
      } else if (currentAttempt < maxAttempts) {
        // Retry after 2 seconds
        setTimeout(() => {
          pollForFundResults(transactionId, maxAttempts, currentAttempt + 1);
        }, 2000);
      } else {
        // Max attempts reached
        throw new Error('Fund search timeout');
      }
    } catch (error) {
      console.error('Error polling for fund results:', error);
      setErrors({ fundSearch: 'Failed to fetch fund results. Please try again.' });
      setFundSearchLoading(false);
    }
  };

  const extractFundsFromResponse = (responseData) => {
    const extractedFunds = [];
    
    if (responseData.message?.catalog?.providers) {
      responseData.message.catalog.providers.forEach(provider => {
        if (provider.items) {
          provider.items.forEach(item => {
            if (item.descriptor?.code === 'SCHEME') {
              // Extract scheme information
              const fund = {
                id: item.id,
                name: item.descriptor.name,
                creator: item.creator?.descriptor?.name || 'Unknown',
                categoryIds: item.category_ids || [],
                status: 'active',
                providerId: provider.id,
                category: 'Mixed', // Default category
                type: 'Mixed', // Default type
                returns: {
                  '1y': 'N/A',
                  '3y': 'N/A',
                  '5y': 'N/A'
                },
                minSip: 500,
                minLumpsum: 5000,
                expenseRatio: 'N/A',
                aum: 'N/A',
                risk: 'Moderate'
              };

              // Extract additional details from tags
              if (item.tags) {
                item.tags.forEach(tag => {
                  if (tag.descriptor?.code === 'SCHEME_INFORMATION') {
                    tag.list?.forEach(listItem => {
                      switch (listItem.descriptor?.code) {
                        case 'STATUS':
                          fund.status = listItem.value;
                          break;
                        case 'LOCKIN_PERIOD_IN_DAYS':
                          fund.lockInPeriod = listItem.value;
                          break;
                        case 'ENTRY_LOAD':
                          fund.entryLoad = listItem.value;
                          break;
                        case 'EXIT_LOAD':
                          fund.exitLoad = listItem.value;
                          break;
                      }
                    });
                  }
                });
              }

              extractedFunds.push(fund);
            } else if (item.descriptor?.code === 'SCHEME_PLAN') {
              // Find parent scheme and add plan details
              const parentFund = extractedFunds.find(f => f.id === item.parent_item_id);
              if (parentFund) {
                if (!parentFund.plans) parentFund.plans = [];
                
                const plan = {
                  id: item.id,
                  name: item.descriptor.name,
                  fulfillmentIds: item.fulfillment_ids || []
                };

                // Extract plan details from tags
                if (item.tags) {
                  item.tags.forEach(tag => {
                    if (tag.descriptor?.code === 'PLAN_IDENTIFIERS') {
                      tag.list?.forEach(listItem => {
                        switch (listItem.descriptor?.code) {
                          case 'ISIN':
                            plan.isin = listItem.value;
                            break;
                          case 'AMFI_IDENTIFIER':
                            plan.amfiId = listItem.value;
                            break;
                        }
                      });
                    } else if (tag.descriptor?.code === 'PLAN_OPTIONS') {
                      tag.list?.forEach(listItem => {
                        switch (listItem.descriptor?.code) {
                          case 'PLAN':
                            plan.planType = listItem.value;
                            break;
                          case 'OPTION':
                            plan.option = listItem.value;
                            break;
                        }
                      });
                    }
                  });
                }

                parentFund.plans.push(plan);
              }
            }
          });
        }

        // Extract fulfillment information
        if (provider.fulfillments) {
          provider.fulfillments.forEach(fulfillment => {
            const relatedFunds = extractedFunds.filter(fund => 
              fund.plans?.some(plan => plan.fulfillmentIds.includes(fulfillment.id))
            );
            
            relatedFunds.forEach(fund => {
              if (!fund.fulfillments) fund.fulfillments = [];
              
              const fulfillmentInfo = {
                id: fulfillment.id,
                type: fulfillment.type,
                thresholds: {}
              };

              // Extract thresholds
              if (fulfillment.tags) {
                fulfillment.tags.forEach(tag => {
                  if (tag.descriptor?.code === 'THRESHOLDS') {
                    tag.list?.forEach(listItem => {
                      fulfillmentInfo.thresholds[listItem.descriptor?.code] = listItem.value;
                    });
                  }
                });
              }

              fund.fulfillments.push(fulfillmentInfo);
            });
          });
        }
      });
    }
    
    return extractedFunds;
  };

  // Extract transaction data needed for API call
  const extractTransactionData = (selectedFundId, transactionType) => {
    if (!apiResponseData || !selectedFundId) return null;

    const selectedFund = funds.find(f => f.id === selectedFundId);
    if (!selectedFund) return null;

    let fulfillment;
    
    if (transactionType === 'sip') {
      // Get SIP fulfillment ID (prioritize monthly SIP)
      fulfillment = selectedFund.fulfillments?.find(f => 
        f.type === 'SIP' && (f.id.includes('MONTH') || f.id.includes('P1M'))
      ) || selectedFund.fulfillments?.find(f => f.type === 'SIP');
    } else if (transactionType === 'purchase') {
      // Get LUMPSUM fulfillment ID
      fulfillment = selectedFund.fulfillments?.find(f => f.type === 'LUMPSUM');
    }

    return {
      transactionId: apiResponseData.context?.transaction_id || searchTransactionId,
      providerId: selectedFund.providerId,
      itemId: selectedFundId,
      fulfillmentId: fulfillment?.id || ''
    };
  };

  // Handle fund investment
  const handleInvestment = (fund, type) => {
    setSelectedFund(fund);
    const transactionData = extractTransactionData(fund.id, type);
    
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

  // Filter funds
  const filteredFunds = funds.filter(fund => {
    const matchesCategory = selectedCategory === 'all' || 
      fund.type.toLowerCase().includes(selectedCategory) || 
      fund.category.toLowerCase().includes(selectedCategory);
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.creator.toLowerCase().includes(searchTerm.toLowerCase());
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

  // If showing transaction flows, render them
  if (showSIPFlow) {
    return (
      <SIPTransaction
        clientData={HARDCODED_VALUES.clientData}
        fundData={selectedFund}
        transactionData={extractTransactionData(selectedFund?.id, 'sip')}
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
        transactionData={extractTransactionData(selectedFund?.id, 'purchase')}
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
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
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
                onClick={searchFunds}
                className="text-sm text-red-600 hover:text-red-700 underline mt-1"
              >
                Retry loading funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-sm border border-blue-200/40 p-4 lg:p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search funds by name, AMC..."
              className="w-full pl-10 pr-4 py-3 border border-blue-200/40 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={fundSearchLoading}
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative flex space-x-2 overflow-x-auto pb-2">
            {/* Moving background indicator */}
            <div 
              className={`
                absolute top-0 bottom-2 bg-blue-600 rounded-full
                transition-all duration-400 ease-out z-0
                ${fundSearchLoading ? 'opacity-70' : 'opacity-100'}
              `}
              style={{
                left: `${categories.findIndex(cat => cat.id === selectedCategory) * 120}px`,
                width: '112px',
                transform: fundSearchLoading ? 'scale(0.95)' : 'scale(1)'
              }}
            />
            
            {categories.map((category, index) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={fundSearchLoading}
                  className={`
                    relative z-10 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                    ${isActive
                      ? 'text-white border-blue-600'
                      : 'bg-white/70 text-gray-700 hover:bg-blue-50 border-blue-200/40 hover:border-blue-400'
                    }
                    ${fundSearchLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  style={{ minWidth: '112px' }}
                >
                  {category.name} ({filteredFunds.length})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {fundSearchLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading mutual funds...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!fundSearchLoading && funds.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredFunds.length} of {funds.length} funds
          </p>
          <Button variant="outline" size="sm" className="hidden sm:flex border-blue-200/40">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      )}

      {/* Funds Table */}
      {!fundSearchLoading && filteredFunds.length > 0 && (
        <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 lg:p-6 border-b border-blue-100/40">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Available Mutual Funds</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/70 border border-blue-200/40">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-64">Fund Details</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Returns (1Y/3Y/5Y)</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-24">Risk</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 min-w-32">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-900 w-32">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFunds.map((fund, index) => (
                  <tr key={fund.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                    <td className="p-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">{fund.name}</p>
                        <p className="text-gray-500 text-xs">by {fund.creator}</p>
                        {fund.plans && (
                          <p className="text-gray-400 text-xs mt-1">{fund.plans.length} plans available</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium">
                        {fund.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex space-x-4 text-xs">
                          <span className="text-green-600 font-medium">{fund.returns['1y']}</span>
                          <span className="text-green-600 font-medium">{fund.returns['3y']}</span>
                          <span className="text-green-600 font-medium">{fund.returns['5y']}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium ${getRiskColor(fund.risk)}`}>
                        {fund.risk}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium ${
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
                          onClick={() => handleInvestment(fund, investmentType === 'sip' ? 'sip' : 'purchase')}
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
                        <Button variant="ghost" size="sm" className="hover:bg-white/50 p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-100">
            {filteredFunds.map((fund, index) => (
              <div key={fund.id} className="p-4 hover:bg-white/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1">{fund.name}</h4>
                    <p className="text-sm text-gray-500">by {fund.creator}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="hover:bg-white/50 ml-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">Category</p>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium">
                      {fund.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Risk Level</p>
                    <span className={`px-2 py-1 text-xs font-medium ${getRiskColor(fund.risk)}`}>
                      {fund.risk}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Returns (1Y/3Y/5Y)</p>
                    <div className="flex space-x-2 text-xs">
                      <span className="text-green-600 font-medium">{fund.returns['1y']}</span>
                      <span className="text-green-600 font-medium">{fund.returns['3y']}</span>
                      <span className="text-green-600 font-medium">{fund.returns['5y']}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <span className={`px-2 py-1 text-xs font-medium ${
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
                  onClick={() => handleInvestment(fund, investmentType === 'sip' ? 'sip' : 'purchase')}
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

      {/* Load More */}
      {!fundSearchLoading && filteredFunds.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" className="bg-white/60 hover:bg-white/80 border-blue-200/40">
            Load More Funds
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* No Results */}
      {!fundSearchLoading && filteredFunds.length === 0 && funds.length > 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No funds found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* No Funds Available */}
      {!fundSearchLoading && funds.length === 0 && !errors.fundSearch && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No funds available</h3>
          <p className="text-gray-600">Please try again later or contact support</p>
          <Button 
            onClick={searchFunds}
            className="mt-4"
            variant="outline"
          >
            Retry Loading Funds
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