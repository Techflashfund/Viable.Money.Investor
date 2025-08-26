'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Calendar,
  IndianRupee,
  TrendingUp,
  Heart,
  BarChart3,
  Info
} from 'lucide-react';

// Fund Icon Component
const FundIcon = ({ fund, size = "w-16 h-16" }) => {
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

// Fund Details Component
const FundDetails = ({ fund, onBack, onInvest }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1 Year');

  // Extract AMC name with better logic
  const getAmcName = (fund) => {
    if (fund?.creator && fund.creator !== 'N/A') {
      return fund.creator; // Already processed by parent component
    }
    
    if (fund?.rawData?.amcName && fund.rawData.amcName.trim() !== '') {
      return fund.rawData.amcName;
    } else if (fund?.rawData?.schemeName || fund?.name) {
      const schemeName = fund?.rawData?.schemeName || fund?.name || '';
      if (schemeName.includes('360 ONE')) {
        return '360 ONE Mutual Fund';
      } else if (schemeName.includes('HDFC')) {
        return 'HDFC Mutual Fund';
      } else if (schemeName.includes('ICICI')) {
        return 'ICICI Prudential Mutual Fund';
      } else if (schemeName.includes('Axis')) {
        return 'Axis Mutual Fund';
      } else if (schemeName.includes('Kotak')) {
        return 'Kotak Mahindra Mutual Fund';
      } else if (schemeName.includes('Aditya Birla')) {
        return 'Aditya Birla Sun Life Mutual Fund';
      } else if (schemeName.includes('DSP')) {
        return 'DSP Mutual Fund';
      } else if (schemeName.includes('Motilal Oswal')) {
        return 'Motilal Oswal Mutual Fund';
      } else if (schemeName.includes('Nippon')) {
        return 'Nippon India Mutual Fund';
      } else if (schemeName.includes('Quant')) {
        return 'Quant Mutual Fund';
      } else if (schemeName.includes('UTI')) {
        return 'UTI Mutual Fund';
      }
    }
    return 'N/A';
  };

  // Extract data from the fund object, with N/A fallbacks
  const fundDetails = {
    name: fund?.name || 'N/A',
    creator: getAmcName(fund),
    category: fund?.category || 'N/A',
    isin: fund?.isin || 'N/A',
    status: fund?.status || 'N/A',
    
    // Investment details
    minSip: fund?.minSip ? `₹${fund.minSip.toLocaleString()}` : 'N/A',
    minLumpsum: fund?.minLumpsum ? `₹${fund.minLumpsum.toLocaleString()}` : 'N/A',
    maxSip: fund?.maxSip ? `₹${fund.maxSip.toLocaleString()}` : 'N/A',
    
    // Investment types
    investmentTypes: fund?.investmentTypes || [],
    fulfillments: fund?.fulfillments || [],
    
    // Plan details
    planType: fund?.planOptions?.plan || 'N/A',
    optionType: fund?.planOptions?.option || 'N/A',
    
    // Additional details from raw data
    expenseRatio: fund?.rawData?.expenseRatio || 'N/A',
    exitLoad: fund?.rawData?.exitLoad || 'N/A',
    launchDate: fund?.rawData?.launchDate || 'N/A',
    aum: fund?.rawData?.aum || 'N/A',
    navValue: fund?.rawData?.navValue || 'N/A'
  };

  const periods = ['1 Year', '3 Years', '5 Years', 'All'];

  const getInvestmentTypesList = () => {
    if (!fundDetails.investmentTypes || fundDetails.investmentTypes.length === 0) {
      return 'N/A';
    }
    return fundDetails.investmentTypes.join(', ');
  };

  const getFulfillmentDetails = (type) => {
    const fulfillment = fundDetails.fulfillments.find(f => f.type === type);
    if (!fulfillment || !fulfillment.thresholds) return 'N/A';
    
    const thresholds = fulfillment.thresholds;
    if (type === 'SIP') {
      return `Min: ₹${thresholds.amountMin || 'N/A'}, Max: ₹${thresholds.amountMax || 'N/A'}`;
    } else if (type === 'LUMPSUM') {
      return `Min: ₹${thresholds.amountMin || 'N/A'}`;
    }
    return 'N/A';
  };

  const canInvest = (type) => {
    return fundDetails.investmentTypes.includes(type) && fund?.status === 'active';
  };

  return (
    <div className="px-4 pt-0 pb-4 sm:px-4 sm:pt-0 lg:px-6 lg:pt-1 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="hover:bg-gray-100 mb-4 px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Funds
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0">
          {/* Left side - Fund info */}
          <div className="flex items-start space-x-4 flex-1">
            {/* Fund Icon */}
            <FundIcon fund={fund} />
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {fundDetails.name}
              </h1>
              <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600">
                <span>{fundDetails.planType}</span>
                <span>•</span>
                <span>{fundDetails.optionType}</span>
                <span>•</span>
                <span>{fundDetails.category}</span>
                <span>•</span>
                <span>by {fundDetails.creator}</span>
              </div>
              {fundDetails.isin !== 'N/A' && (
                <div className="mt-2 text-xs text-gray-500">
                  ISIN: {fundDetails.isin}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex flex-col space-y-3 lg:items-end lg:ml-4">
            {/* Watch and Compare buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="flex items-center space-x-2 rounded-full px-4 py-2 border-gray-300">
                <Heart className="w-4 h-4" />
                <span>Watch</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 rounded-full px-4 py-2 border-gray-300">
                <BarChart3 className="w-4 h-4" />
                <span>Compare</span>
              </Button>
            </div>
            
            {/* Investment buttons */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-80">
              <Button 
                className={`py-3 px-8 rounded-full font-medium transition-colors ${
                  canInvest('LUMPSUM') 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => canInvest('LUMPSUM') && onInvest(fund, 'purchase')}
                disabled={!canInvest('LUMPSUM')}
              >
                <IndianRupee className="w-4 h-4 mr-2" />
                Buy
              </Button>
              <Button 
                className={`py-3 px-8 rounded-full font-medium transition-colors ${
                  canInvest('SIP') 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => canInvest('SIP') && onInvest(fund, 'sip')}
                disabled={!canInvest('SIP')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                SIP
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status and Investment Types Alert */}
      {(fund?.status !== 'active' || !fundDetails.investmentTypes.length) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              {fund?.status !== 'active' && <p>This fund is currently inactive.</p>}
              {!fundDetails.investmentTypes.length && <p>No investment options available for this fund.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Key Metrics */}
        <div className="lg:col-span-1 space-y-4">
          {/* NAV Card */}
          <div className="bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <IndianRupee className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Current NAV</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {fundDetails.navValue !== 'N/A' ? `₹${fundDetails.navValue}` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">
              Data not available
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Fund Status</span>
            </div>
            <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              fund?.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {fundDetails.status}
            </div>
          </div>
        </div>

        {/* Right Column - Chart Placeholder */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 shadow-sm h-full">
            {/* Chart Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Fund Performance</h3>
                <div className="text-sm text-gray-600">
                  Performance data not available
                </div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="p-6">
              <div className="h-80 w-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Chart</h3>
                  <p className="text-gray-500">Historical performance data is not available for this fund</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Details Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Fund Details Card */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Fund Details</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fund Name</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-40 truncate" title={fundDetails.name}>
                  {fundDetails.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">AMC</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.creator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Category</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ISIN</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.isin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plan Type</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.planType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Option</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.optionType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Details Card */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Investment Info</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Investment Types</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-32">
                  {getInvestmentTypesList()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Min SIP Amount</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.minSip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Min Lumpsum</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.minLumpsum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Max SIP Amount</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.maxSip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expense Ratio</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.expenseRatio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Exit Load</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.exitLoad}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment Details Card */}
        <div className="bg-white border border-gray-200 shadow-sm md:col-span-2 lg:col-span-1">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Available Options</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {fundDetails.fulfillments.length > 0 ? (
                fundDetails.fulfillments.map((fulfillment, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{fulfillment.type}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        fundDetails.investmentTypes.includes(fulfillment.type)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {fundDetails.investmentTypes.includes(fulfillment.type) ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {getFulfillmentDetails(fulfillment.type)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No fulfillment options available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Fund Information */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Launch Date:</span>
            <span className="font-medium text-gray-900 ml-2">{fundDetails.launchDate}</span>
          </div>
          <div>
            <span className="text-gray-600">AUM:</span>
            <span className="font-medium text-gray-900 ml-2">{fundDetails.aum}</span>
          </div>
          <div>
            <span className="text-gray-600">Fund Status:</span>
            <span className="font-medium text-gray-900 ml-2">{fundDetails.status}</span>
          </div>
        </div>
        
        {!canInvest('SIP') && !canInvest('LUMPSUM') && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
            <p className="text-sm text-yellow-800">
              This fund is currently not available for investment. Please check back later or contact support for more information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundDetails;