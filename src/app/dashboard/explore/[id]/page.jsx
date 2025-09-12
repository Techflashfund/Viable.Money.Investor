'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Heart,
  BarChart3,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  IndianRupee
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import transaction components
import SIPTransaction from '../../../../components/siptransaction';
import LumpsumTransaction from '../../../../components/lumpsumtransaction';

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
    <div className={`${size} bg-gradient-to-br ${getGradientColors(fund?.fundName)} rounded-full flex items-center justify-center flex-shrink-0`}>
      <div className="w-1/2 h-1/2 bg-white rounded-full opacity-80"></div>
    </div>
  );
};

// Helper function to convert text to Title Case
const toTitleCase = (str) => {
  if (!str) return 'N/A';
  return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Loading Skeleton for just the fund details
const FundDetailsSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="lg:col-span-3 h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

// Separate NAV Chart component with its own loading
const NAVChart = ({ amfiIdentifier, chartTimeframe, setChartTimeframe, onNavDataChange }) => {
  const [navHistory, setNavHistory] = useState([]);
  const [currentNav, setCurrentNav] = useState(null);
  const [navLoading, setNavLoading] = useState(true);
  const [navError, setNavError] = useState(null);
  const [allNavData, setAllNavData] = useState([]);

  useEffect(() => {
    if (amfiIdentifier) {
      fetchNavData(amfiIdentifier);
    }
  }, [amfiIdentifier]);

  const fetchNavData = async (amfiIdentifier) => {
    try {
      setNavLoading(true);
      setNavError(null);

      const [historyResponse, currentResponse] = await Promise.all([
        fetch(`https://api.mfapi.in/mf/${amfiIdentifier}`),
        fetch(`https://api.mfapi.in/mf/${amfiIdentifier}/latest`)
      ]);

      let processedData = [];
      let navData = null;

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.data) {
          processedData = historyData.data
            .map(item => ({
              date: item.date,
              nav: parseFloat(item.nav),
              formattedDate: formatDateForChart(item.date),
              jsDate: parseDate(item.date)
            }))
            .filter(item => !isNaN(item.nav) && item.jsDate)
            .sort((a, b) => a.jsDate - b.jsDate);
          
          setAllNavData(processedData);
        }
      }

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        if (currentData.data && currentData.data.length > 0) {
          navData = {
            value: parseFloat(currentData.data[0].nav),
            date: currentData.data[0].date
          };
          setCurrentNav(navData);
        }
      }

      // After both data are loaded, filter and update parent
      if (processedData.length > 0 && navData) {
        filterDataByTimeframe(processedData, chartTimeframe, navData);
      }

    } catch (error) {
      console.error('Error fetching NAV data:', error);
      setNavError(error.message);
    } finally {
      setNavLoading(false);
    }
  };

  const parseDate = (dateStr) => {
    try {
      const [day, month, year] = dateStr.split('-');
      return new Date(year, month - 1, day);
    } catch (error) {
      return null;
    }
  };

  const formatDateForChart = (dateStr) => {
    try {
      const [day, month, year] = dateStr.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return dateStr;
    }
  };

  const calculateReturns = (data) => {
    if (!data || data.length < 2) return { change: 0, percentage: 0 };
    
    const latest = data[data.length - 1]?.nav;
    const earliest = data[0]?.nav;
    
    if (!latest || !earliest) return { change: 0, percentage: 0 };
    
    const change = latest - earliest;
    const percentage = ((change / earliest) * 100);
    
    return { change, percentage };
  };

  const filterDataByTimeframe = (data, timeframe, navDataToUse = null) => {
    if (!data.length) return;

    const now = new Date();
    let cutoffDate;
    const currentNavData = navDataToUse || currentNav;

    switch (timeframe) {
      case '1M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1Y':
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '2Y':
        cutoffDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
        break;
      case '3Y':
        cutoffDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
        break;
      case '5Y':
        cutoffDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        break;
      case 'All':
      default:
        setNavHistory(data);
        if (onNavDataChange && currentNavData) {
          const returns = calculateReturns(data);
          onNavDataChange({ currentNav: currentNavData, returns, timeframe });
        }
        return;
    }

    const filteredData = data.filter(item => item.jsDate >= cutoffDate);
    setNavHistory(filteredData);
    
    if (onNavDataChange && currentNavData) {
      const returns = calculateReturns(filteredData);
      onNavDataChange({ currentNav: currentNavData, returns, timeframe });
    }
  };

  const handleTimeframeChange = (timeframe) => {
    setChartTimeframe(timeframe);
    filterDataByTimeframe(allNavData, timeframe);
  };

  const getAvailableTimeframes = () => {
    if (!allNavData.length) return ['1Y'];
    
    const oldestDate = allNavData[0]?.jsDate;
    const now = new Date();
    const timeframes = ['1M', '3M', '6M', '1Y'];
    
    if (oldestDate) {
      const diffYears = (now - oldestDate) / (1000 * 60 * 60 * 24 * 365);
      if (diffYears >= 2) timeframes.push('2Y');
      if (diffYears >= 3) timeframes.push('3Y');
      if (diffYears >= 5) timeframes.push('5Y');
      timeframes.push('All');
    }
    
    return timeframes;
  };

  const availableTimeframes = getAvailableTimeframes();

  return (
    <div className="lg:col-span-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">NAV Performance</h3>
        </div>
        <div className="flex space-x-1">
          {availableTimeframes.map((timeframe) => (
            <Button 
              key={timeframe}
              variant={chartTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeframeChange(timeframe)}
              className={`text-xs ${chartTimeframe === timeframe ? 'bg-blue-600 text-white' : ''}`}
              disabled={navLoading}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      {navLoading ? (
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading NAV data...</p>
          </div>
        </div>
      ) : navError ? (
        <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p>Failed to load chart data</p>
            <p className="text-sm">{navError}</p>
          </div>
        </div>
      ) : navHistory.length > 0 ? (
        <div className="h-96 bg-white border rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={navHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 10 }}
                stroke="#666"
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                stroke="#666"
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
              />
              <Tooltip 
                formatter={(value) => [`₹${value.toFixed(4)}`, 'NAV']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="nav" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#1d4ed8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <p>No chart data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

const FundDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  // State management - separated nav loading from main loading
  const [fundDetails, setFundDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartTimeframe, setChartTimeframe] = useState('1Y');
  const [navData, setNavData] = useState({ 
    currentNav: null, 
    returns: { change: 0, percentage: 0 }, 
    timeframe: '1Y' 
  });

  // Transaction flow states
  const [showSIPFlow, setShowSIPFlow] = useState(false);
  const [showLumpsumFlow, setShowLumpsumFlow] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(null);

  // Hard-coded values
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

  useEffect(() => {
    if (id) {
      fetchFundDetails();
    }
  }, [id]);

  const fetchFundDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const fundResponse = await fetch(`https://investment.flashfund.in/api/ondc/funds/${id}`);
      
      if (!fundResponse.ok) {
        throw new Error(`Failed to fetch fund details: ${fundResponse.status}`);
      }

      const fundData = await fundResponse.json();
      
      if (!fundData.success) {
        throw new Error('Failed to load fund details');
      }

      setFundDetails(fundData.data);

    } catch (error) {
      console.error('Error fetching fund details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const processFundForTransaction = (fundData) => {
    return {
      id: fundData.fundId || fundData.itemId,
      name: fundData.fundName,
      creator: fundData.providerName || 'N/A',
      providerId: fundData.providerId,
      fulfillments: fundData.fulfillments || [],
      investmentTypes: fundData.investmentTypes || [],
      minSip: fundData.minSipAmount,
      minLumpsum: fundData.minLumpsumAmount,
      isin: fundData.isin,
      rawData: fundData
    };
  };

  const handleInvestment = (type) => {
    const processedFund = processFundForTransaction(fundDetails);
    
    if (type === 'sip') {
      setShowSIPFlow(true);
    } else if (type === 'lumpsum') {
      setShowLumpsumFlow(true);
    }
  };

  const handleBackFromTransaction = () => {
    setShowSIPFlow(false);
    setShowLumpsumFlow(false);
    setTransactionSuccess(null);
  };

  const handleFolioSelection = (responseData, folioType) => {
    setTransactionSuccess({
      type: showSIPFlow ? 'SIP' : 'LUMPSUM',
      folioType: folioType,
      data: responseData,
      fund: processFundForTransaction(fundDetails)
    });

    setShowSIPFlow(false);
    setShowLumpsumFlow(false);
    
    setTimeout(() => {
      setTransactionSuccess(null);
    }, 3000);
  };

  const handleNavDataChange = (data) => {
    setNavData(data);
  };

  if (loading) {
    return <FundDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Fund Details</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (showSIPFlow) {
    return (
      <SIPTransaction
        clientData={HARDCODED_VALUES.clientData}
        fundData={processFundForTransaction(fundDetails)}
        transactionData={{
          providerId: fundDetails?.providerId,
          itemId: fundDetails?.fundId,
          fulfillmentId: fundDetails?.fulfillments?.find(f => f.type === 'SIP')?.fulfillmentId
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
        fundData={processFundForTransaction(fundDetails)}
        transactionData={{
          providerId: fundDetails?.providerId,
          itemId: fundDetails?.fundId,
          fulfillmentId: fundDetails?.fulfillments?.find(f => f.type === 'LUMPSUM')?.fulfillmentId
        }}
        onBack={handleBackFromTransaction}
        onFolioSelection={handleFolioSelection}
      />
    );
  }

  if (transactionSuccess) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
        <div className="text-center">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Fund Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Fund Title and Actions */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <FundIcon fund={fundDetails} size="w-16 h-16" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {fundDetails?.fundName || 'Fund Name'}
                </h1>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {fundDetails?.planOptions?.plan || 'REGULAR'}
                  </span>
                  <span>•</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {fundDetails?.planOptions?.option || 'GROWTH'}
                  </span>
                  <span>•</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {toTitleCase(fundDetails?.primaryCategory) || 'Hybrid'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ISIN: {fundDetails?.isin || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Updated Button Layout - Two Rows with different sizes */}
            <div className="flex flex-col space-y-3">
              {/* First Row - Watch and Compare (Small) */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex items-center space-x-1 rounded-full border-gray-300 hover:bg-gray-50 px-3 py-1 text-xs">
                  <Heart className="w-3 h-3" />
                  <span>Watch</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-1 rounded-full border-gray-300 hover:bg-gray-50 px-3 py-1 text-xs">
                  <BarChart3 className="w-3 h-3" />
                  <span>Compare</span>
                </Button>
              </div>
              
              {/* Second Row - Buy and SIP (Large) */}
              <div className="flex items-center space-x-3">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-12 py-3 flex items-center space-x-2 font-medium text-base"
                  onClick={() => handleInvestment('lumpsum')}
                >
                  <IndianRupee className="w-5 h-5" />
                  <span>Buy</span>
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-12 py-3 flex items-center space-x-2 font-medium text-base"
                  onClick={() => handleInvestment('sip')}
                >
                  <Calendar className="w-5 h-5" />
                  <span>SIP</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Grid - Changed to 4 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Stats Cards (Smaller width, taller height) */}
            <div className="space-y-4">
              {/* Current NAV Card - Made taller */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 h-32">
                <h3 className="text-sm text-blue-600 mb-3">Current NAV</h3>
                <div className="text-2xl text-blue-700 mb-2">
                  ₹{navData.currentNav?.value?.toFixed(4) || 'N/A'}
                </div>
                <p className="text-sm text-blue-500">
                  {navData.currentNav?.date ? new Date(navData.currentNav.date.split('-').reverse().join('-')).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {/* Returns Card - Made taller */}
              <div className={`rounded-lg p-6 border h-32 ${navData.returns.percentage >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`flex items-center text-sm mb-2 ${navData.returns.percentage >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {navData.returns.percentage >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  <span>{navData.timeframe} Return</span>
                </div>
                <div className={`text-2xl mb-1 ${navData.returns.percentage >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {navData.returns.percentage >= 0 ? '+' : ''}{navData.returns.percentage.toFixed(2)}%
                </div>
                <div className={`text-sm ${navData.returns.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(navData.returns.change).toFixed(4)}
                </div>
              </div>
            </div>

            {/* Right Column - NAV Chart (Takes 3 columns) */}
            <NAVChart 
              amfiIdentifier={fundDetails?.planIdentifiers?.amfiIdentifier}
              chartTimeframe={chartTimeframe}
              setChartTimeframe={setChartTimeframe}
              onNavDataChange={handleNavDataChange}
            />
          </div>
        </div>

        {/* Details Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Fund Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Fund Name</span>
                <span className="font-medium text-right">{fundDetails?.fundName?.split(' ').slice(0, 3).join(' ') + '...' || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">{toTitleCase(fundDetails?.primaryCategory)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan Type</span>
                <span className="font-medium">{fundDetails?.planOptions?.plan || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Option</span>
                <span className="font-medium">{fundDetails?.planOptions?.option || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Investment Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Investment Types</span>
                <span className="font-medium text-right">
                  {fundDetails?.investmentTypes?.join(', ') || 'SIP, REDEMPTION, LUMPSUM'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min SIP Amount</span>
                <span className="font-medium">₹{fundDetails?.minSipAmount || '1,000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min Lumpsum</span>
                <span className="font-medium">₹{fundDetails?.minLumpsumAmount || '1,000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max SIP Amount</span>
                <span className="font-medium">₹{fundDetails?.maxSipAmount || '999,999,999'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expense Ratio</span>
                <span className="font-medium">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exit Load</span>
                <span className="font-medium">N/A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          <div className="text-gray-600">
            <p>Additional fund information and disclosures would appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundDetailsPage;