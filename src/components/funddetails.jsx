'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Calendar,
  IndianRupee,
  TrendingUp,
  Heart,
  BarChart3,
  Info,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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
  const [navData, setNavData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [availablePeriods, setAvailablePeriods] = useState(['1 Year']);

  // Extract AMC name with better logic
  const getAmcName = (fund) => {
    if (fund?.creator && fund.creator !== 'N/A') {
      return fund.creator;
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

  // Calculate date range based on selected period
  const getDateRange = (period) => {
    const today = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1 Year':
        startDate.setFullYear(today.getFullYear() - 1);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          limit: 400 // Ensure we get enough data
        };
      case '2 Years':
        startDate.setFullYear(today.getFullYear() - 2);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          limit: 800
        };
      case '3 Years':
        startDate.setFullYear(today.getFullYear() - 3);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          limit: 1200
        };
      case '5 Years':
        startDate.setFullYear(today.getFullYear() - 5);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          limit: 2000
        };
      default:
        return { limit: 2000 }; // All data
    }
  };

  // Find NAV for exact date or next available date after target date
  const findNavForExactDate = (data, targetDate) => {
    if (!data || data.length === 0) return null;
    
    // Convert target date to timestamp for comparison
    const targetTime = new Date(targetDate).getTime();
    
    // Sort data by date ascending
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // First, try to find exact date match
    const exactMatch = sortedData.find(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === targetDate.getFullYear() &&
             itemDate.getMonth() === targetDate.getMonth() &&
             itemDate.getDate() === targetDate.getDate();
    });
    
    if (exactMatch) return exactMatch;
    
    // If no exact match, find the first date on or after target date
    const nextAvailable = sortedData.find(item => 
      new Date(item.date).getTime() >= targetTime
    );
    
    return nextAvailable;
  };

  // Check data availability and set available periods
  const checkDataAvailability = (data) => {
    if (!data || data.length === 0) {
      setAvailablePeriods(['1 Year']);
      return;
    }

    const today = new Date();
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const oldestDate = new Date(sortedData[0].date);
    
    const periods = ['1 Year'];
    
    // Check if we have 2+ years of data
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    if (oldestDate <= twoYearsAgo) {
      periods.push('2 Years');
    }
    
    // Check if we have 3+ years of data
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(today.getFullYear() - 3);
    if (oldestDate <= threeYearsAgo) {
      periods.push('3 Years');
    }
    
    // Check if we have 5+ years of data
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);
    if (oldestDate <= fiveYearsAgo) {
      periods.push('5 Years');
    }
    
    periods.push('All');
    setAvailablePeriods(periods);
    
    // If current selected period is not available, switch to available one
    if (!periods.includes(selectedPeriod)) {
      setSelectedPeriod(periods[0]);
    }
  };

  // Fetch NAV data
  const fetchNavData = async (period = selectedPeriod) => {
    if (!fund?.amfiId && !fund?.isin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const itemId = fund.id
      let url = `https://investment.flashfund.in/api/fund/history/${itemId}`;
      
      const dateRange = getDateRange(period);
      const params = new URLSearchParams();
      
      if (dateRange.startDate && dateRange.endDate) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }
      
      params.append('limit', dateRange.limit.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch NAV data');
      }
      
      const data = await response.json();
      
      if (data.success && data.navData) {
        // Sort data by date (oldest first for chart)
        const sortedData = data.navData
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(item => ({
            ...item,
            date: new Date(item.date).getTime(),
            displayDate: new Date(item.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),
            originalDate: item.date
          }));
        
        setNavData(sortedData);
        checkDataAvailability(data.navData);
        calculatePerformanceMetrics(sortedData, data.metadata, period);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      setError(err.message);
      setNavData([]);
      setPerformanceMetrics({});
    } finally {
      setLoading(false);
    }
  };

  // Calculate performance metrics with accurate date matching
  const calculatePerformanceMetrics = (data, metadata, period) => {
    if (!data || data.length === 0) return;
    
    const currentNav = data[data.length - 1]?.nav || 0;
    const currentDate = new Date(data[data.length - 1]?.originalDate || new Date());
    
    // Calculate return for selected period
    let startNav = data[0]?.nav || 0;
    const absoluteReturn = currentNav - startNav;
    const percentageReturn = startNav > 0 ? ((currentNav - startNav) / startNav) * 100 : 0;
    
    const metrics = {
      currentNav: metadata?.latestNav || currentNav,
      latestNavDate: metadata?.latestNavDate,
      absoluteReturn,
      percentageReturn,
      isPositive: percentageReturn >= 0,
      selectedPeriodReturn: percentageReturn
    };
    
    // Calculate accurate returns for 1, 2, 3 years using exact date matching
    const today = new Date(currentDate);
    
    // 1 Year Return
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const oneYearNavData = findNavForExactDate(data.map(d => ({ ...d, date: d.originalDate })), oneYearAgo);
    if (oneYearNavData && oneYearNavData.nav > 0) {
      metrics.oneYearReturn = ((currentNav - oneYearNavData.nav) / oneYearNavData.nav) * 100;
      metrics.oneYearStartDate = new Date(oneYearNavData.date).toLocaleDateString('en-IN');
    }
    
    // 2 Year Return
    const twoYearAgo = new Date(today);
    twoYearAgo.setFullYear(today.getFullYear() - 2);
    const twoYearNavData = findNavForExactDate(data.map(d => ({ ...d, date: d.originalDate })), twoYearAgo);
    if (twoYearNavData && twoYearNavData.nav > 0) {
      metrics.twoYearReturn = ((currentNav - twoYearNavData.nav) / twoYearNavData.nav) * 100;
      metrics.twoYearStartDate = new Date(twoYearNavData.date).toLocaleDateString('en-IN');
    }
    
    // 3 Year Return
    const threeYearAgo = new Date(today);
    threeYearAgo.setFullYear(today.getFullYear() - 3);
    const threeYearNavData = findNavForExactDate(data.map(d => ({ ...d, date: d.originalDate })), threeYearAgo);
    if (threeYearNavData && threeYearNavData.nav > 0) {
      metrics.threeYearReturn = ((currentNav - threeYearNavData.nav) / threeYearNavData.nav) * 100;
      metrics.threeYearStartDate = new Date(threeYearNavData.date).toLocaleDateString('en-IN');
    }
    
    // 5 Year Return
    const fiveYearAgo = new Date(today);
    fiveYearAgo.setFullYear(today.getFullYear() - 5);
    const fiveYearNavData = findNavForExactDate(data.map(d => ({ ...d, date: d.originalDate })), fiveYearAgo);
    if (fiveYearNavData && fiveYearNavData.nav > 0) {
      metrics.fiveYearReturn = ((currentNav - fiveYearNavData.nav) / fiveYearNavData.nav) * 100;
      metrics.fiveYearStartDate = new Date(fiveYearNavData.date).toLocaleDateString('en-IN');
    }
    
    setPerformanceMetrics(metrics);
  };

  // Load NAV data on component mount and when period changes
  useEffect(() => {
    fetchNavData();
  }, [fund, selectedPeriod]);

  // Extract fund details
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
    navValue: fund?.rawData?.navValue || performanceMetrics.currentNav || 'N/A'
  };

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

  // Enhanced tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-1">{data.displayDate}</p>
          <p className="text-lg font-semibold text-blue-600">
            ₹{payload[0].value.toFixed(4)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get min and max values for better Y-axis scaling
  const getYAxisDomain = () => {
    if (navData.length === 0) return ['auto', 'auto'];
    
    const values = navData.map(d => d.nav);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.05; // 5% padding
    
    return [Math.max(0, min - padding), max + padding];
  };

  return (
    <div className="px-4 pt-0 pb-4 sm:px-4 sm:pt-0 lg:px-6 lg:pt-1 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="hover:bg-gray-100 mb-4 px-4 py-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Funds
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0">
          {/* Left side - Fund info */}
          <div className="flex items-start space-x-4 flex-1">
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
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="flex items-center space-x-2 rounded-full px-4 py-2 border-gray-300 hover:bg-gray-50 transition-colors">
                <Heart className="w-4 h-4" />
                <span>Watch</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 rounded-full px-4 py-2 border-gray-300 hover:bg-gray-50 transition-colors">
                <BarChart3 className="w-4 h-4" />
                <span>Compare</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full lg:w-80">
              <Button 
                className={`py-3 px-8 rounded-full font-medium transition-all duration-200 ${
                  canInvest('LUMPSUM') 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => canInvest('LUMPSUM') && onInvest(fund, 'purchase')}
                disabled={!canInvest('LUMPSUM')}
              >
                <IndianRupee className="w-4 h-4 mr-2" />
                Buy
              </Button>
              <Button 
                className={`py-3 px-8 rounded-full font-medium transition-all duration-200 ${
                  canInvest('SIP') 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]' 
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

      {/* Status Alert */}
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
          <div className=" border-blue-600 bg-white p-6 shadow-sm rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              
              <span className="text-sm font-medium text-blue-700">Current NAV</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {performanceMetrics.currentNav ? `₹${performanceMetrics.currentNav.toFixed(4)}` : 'N/A'}
            </div>
            <div className="text-sm text-blue-600">
              {performanceMetrics.latestNavDate ? 
                new Date(performanceMetrics.latestNavDate).toLocaleDateString('en-IN') : 
                'Date not available'
              }
            </div>
          </div>

          {/* Selected Period Performance Card */}
          <div className={`bg-gradient-to-br p-6 shadow-sm rounded-lg border ${
            performanceMetrics.isPositive 
              ? 'from-green-50 to-green-100 border-green-200' 
              : 'from-red-50 to-red-100 border-red-200'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              {performanceMetrics.isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                performanceMetrics.isPositive ? 'text-green-700' : 'text-red-700'
              }`}>
                {selectedPeriod} Return
              </span>
            </div>
            <div className={`text-2xl font-bold mb-1 ${
              performanceMetrics.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {performanceMetrics.selectedPeriodReturn !== undefined ? 
                `${performanceMetrics.selectedPeriodReturn >= 0 ? '+' : ''}${performanceMetrics.selectedPeriodReturn.toFixed(2)}%` : 
                'N/A'
              }
            </div>
            <div className={`text-sm ${
              performanceMetrics.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {performanceMetrics.absoluteReturn !== undefined ? 
                `₹${performanceMetrics.absoluteReturn.toFixed(4)}` : 
                'Data not available'
              }
            </div>
          </div>



          {/* Status Card */}
          <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
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

        {/* Right Column - Chart */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg h-full">
            {/* Chart Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-lg font-semibold text-gray-900">NAV Performance</h3>
                
                {/* Period Selection */}
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-full">
                  {availablePeriods.map((period) => (
                    <Button
                      key={period}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                        selectedPeriod === period 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart Content */}
            <div className="p-6">
              {loading ? (
                <div className="h-96 w-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading performance data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-96 w-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Chart</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <Button 
                      onClick={() => fetchNavData()}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : navData.length > 0 ? (
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={navData} 
                      margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          year: '2-digit' 
                        })}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickCount={6}
                      />
                      <YAxis 
                        domain={getYAxisDomain()}
                        tickFormatter={(value) => `₹${value.toFixed(2)}`}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        width={60}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="nav" 
                        stroke="#2563eb" 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ 
                          r: 6, 
                          stroke: '#2563eb', 
                          strokeWidth: 2, 
                          fill: '#fff',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                        fill="url(#colorNav)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-96 w-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
                    <p className="text-gray-500">Historical performance data is not available for this fund</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Details Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Fund Details Card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
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
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
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
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg md:col-span-2 lg:col-span-1">
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