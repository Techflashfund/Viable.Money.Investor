'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  X,
  Copy,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import useAuthStore from '@/store/auth'; // Update this path

// Order Icon Component
const OrderIcon = ({ status, size = "w-8 h-8" }) => {
  const getStatusColors = (status) => {
    switch (status) {
      case 'ORDER_CONFIRMED':
        return 'from-green-500 to-green-600';
      case 'PAYMENT_COMPLETED':
        return 'from-blue-500 to-blue-600';
      case 'PROCESSING':
      case 'PAYMENT_INITIATED':
        return 'from-yellow-500 to-yellow-600';
      case 'PENDING':
      case 'KYC_PENDING':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`${size} bg-gradient-to-br ${getStatusColors(status)} rounded-full flex items-center justify-center flex-shrink-0`}>
      <div className="w-1/2 h-1/3 bg-white rounded opacity-90"></div>
    </div>
  );
};

// Filter Dropdown Component with Fixed Z-Index
const FilterDropdown = ({ title, options, value, onChange, isOpen, onToggle }) => {
  return (
    <div className="relative" style={{ zIndex: isOpen ? 9999 : 'auto' }}>
      <Button
        variant="outline"
        onClick={onToggle}
        className="h-12 bg-white/50 hover:bg-white/70 rounded border border-blue-200/40 flex items-center justify-between min-w-[120px]"
      >
        <span className="truncate">{value || `All ${title}`}</span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <>
          {/* Overlay to capture clicks */}
          <div 
            className="fixed inset-0" 
            style={{ zIndex: 9998 }}
            onClick={onToggle}
          />
          {/* Dropdown menu */}
          <div 
            className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-xl"
            style={{ zIndex: 9999 }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  onChange('');
                  onToggle();
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
              >
                All {title}
              </button>
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    onToggle();
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Order Details Modal
const OrderDetailsModal = ({ order, isOpen, onClose, getFundDisplay }) => {
  if (!isOpen || !order) return null;

  const formatDetailedDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ORDER_CONFIRMED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PAYMENT_COMPLETED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'PROCESSING':
      case 'PAYMENT_INITIATED':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'PENDING':
      case 'KYC_PENDING':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const fundDisplay = getFundDisplay(order.itemId);

  return (
    <div className="fixed inset-0 bg-white/50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <OrderIcon status={order.status} size="w-10 h-10" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-500">{fundDisplay.schemeName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Fund Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Fund Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Fund Name:</span>
                <p className="font-medium text-gray-900 mt-1">{fundDisplay.fundName}</p>
              </div>
              <div>
                <span className="text-gray-600">Provider:</span>
                <p className="font-medium text-gray-900 mt-1">{fundDisplay.providerName}</p>
              </div>
            </div>
          </div>

          {/* Status and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className={`mt-1 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.toLowerCase().replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <div className={`mt-1 px-3 py-2 rounded-lg border text-sm font-medium ${
                order.type === 'SIP' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-green-600 bg-green-50 border-green-200'
              }`}>
                {order.type}
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Order ID:</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                    {order.orderId || order._id}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(order.orderId || order._id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Transaction ID:</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                    {order.transactionId}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(order.transactionId)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Amount:</span>
                <p className="font-semibold text-gray-900 mt-1">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                  }).format(order.transactionDetails?.amount || order.amount || 0)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Current Step:</span>
                <p className="text-gray-900 mt-1 capitalize">
                  {order.step ? order.step.toLowerCase().replace(/_/g, ' ') : 'Processing'}
                </p>
              </div>
            </div>
          </div>

          {/* Investment Details */}
          {order.lumpsumDetails && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Investment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Units Allocated:</span>
                  <p className="font-semibold text-gray-900 mt-1">{order.lumpsumDetails.units}</p>
                </div>
                <div>
                  <span className="text-gray-600">NAV:</span>
                  <p className="font-semibold text-gray-900 mt-1">₹{order.lumpsumDetails.navValue}</p>
                </div>
                <div>
                  <span className="text-gray-600">NAV Date:</span>
                  <p className="text-gray-900 mt-1">
                    {new Date(order.lumpsumDetails.navDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Order Created</p>
                  <p className="text-gray-600">{formatDetailedDate(order.createdAt)}</p>
                </div>
              </div>
              {order.updatedAt !== order.createdAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Last Updated</p>
                    <p className="text-gray-600">{formatDetailedDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Investor Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="text-gray-900 mt-1">{order.investor?.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="text-gray-900 mt-1">{order.investor?.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Need help? Contact support for assistance.
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Receipt
            </Button>
            <Button onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersTransactions = () => {
  // Auth store
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.userId;

  // Component state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fundDetails, setFundDetails] = useState(new Map()); // Cache for fund details

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    page: 1,
    limit: 10
  });

  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

  // Filter options
  const statusOptions = [
    { value: 'ORDER_CONFIRMED', label: 'Order Confirmed' },
    { value: 'PAYMENT_COMPLETED', label: 'Payment Completed' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'PAYMENT_INITIATED', label: 'Payment Initiated' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'KYC_PENDING', label: 'KYC Pending' }
  ];

  const typeOptions = [
    { value: 'SIP', label: 'SIP' },
    { value: 'LUMPSUM', label: 'Lumpsum' }
  ];

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (userId) params.set('userId', userId);
    if (filters.status) params.set('status', filters.status);
    if (filters.type) params.set('type', filters.type);
    params.set('page', filters.page.toString());
    params.set('limit', filters.limit.toString());
    
    return params.toString();
  }, [userId, filters]);

  // Fetch fund details by itemId
  const fetchFundDetails = useCallback(async (itemId) => {
    // Return cached data if available
    if (fundDetails.has(itemId)) {
      return fundDetails.get(itemId);
    }

    try {
      const response = await fetch(`https://investment.flashfund.in/api/ondc/funds/${itemId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const details = {
          fundName: data.data.fundName || data.data.planName,
          schemeName: data.data.schemeName || data.data.fundName,
          providerName: data.data.providerName || 'Unknown Provider',
          amcName: data.data.amcName || '',
          planName: data.data.planName || data.data.fundName,
        };
        
        // Cache the result
        setFundDetails(prev => new Map(prev.set(itemId, details)));
        return details;
      } else {
        throw new Error(data.message || 'Failed to fetch fund details');
      }
    } catch (error) {
      console.error(`Error fetching fund details for ${itemId}:`, error);
      // Return fallback details
      const fallback = {
        fundName: 'Fund Details Unavailable',
        schemeName: 'Unknown Fund',
        providerName: 'Unknown Provider',
        amcName: '',
        planName: 'Unknown Plan',
      };
      
      // Cache the fallback to avoid repeated calls
      setFundDetails(prev => new Map(prev.set(itemId, fallback)));
      return fallback;
    }
  }, [fundDetails]);

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    // Only fetch if user is authenticated and has userId
    if (!isAuthenticated || !userId) {
      console.log('User not authenticated or userId not available');
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams();
      const response = await fetch(
        `https://viable-money-be.onrender.com/api/transaction/orders?${queryParams}`
      );
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const ordersData = data.data.orders || [];
        setOrders(ordersData);
        setPagination(data.data.pagination || {});

        // Fetch fund details for each unique itemId
        const uniqueItemIds = [...new Set(ordersData.map(order => order.itemId))];
        
        // Fetch fund details in parallel (non-blocking)
        uniqueItemIds.forEach(async (itemId) => {
          if (!fundDetails.has(itemId)) {
            await fetchFundDetails(itemId);
          }
        });
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders: ' + err.message);
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId, buildQueryParams, fetchFundDetails, fundDetails]);

  // Effect to fetch orders when userId or filters change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
      page: 1 // Reset to first page when filter changes
    }));
    
    // Close dropdowns after selection
    setStatusDropdownOpen(false);
    setTypeDropdownOpen(false);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      setFilters(prev => ({
        ...prev,
        page: prev.page + 1
      }));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      type: '',
      page: 1,
      limit: 10
    });
    setStatusDropdownOpen(false);
    setTypeDropdownOpen(false);
  };

  // Handle order click
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ORDER_CONFIRMED':
        return 'text-green-600';
      case 'PAYMENT_COMPLETED':
        return 'text-blue-600';
      case 'PROCESSING':
      case 'PAYMENT_INITIATED':
        return 'text-yellow-600';
      case 'PENDING':
      case 'KYC_PENDING':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeColor = (type) => {
    return type === 'SIP' ? 'text-blue-600' : 'text-green-600';
  };

  // Get fund details for display
  const getFundDisplay = (itemId) => {
    const details = fundDetails.get(itemId);
    if (!details) {
      return {
        fundName: 'Loading fund details...',
        schemeName: 'Loading...',
        providerName: 'Loading...',
        isLoading: true
      };
    }
    return {
      fundName: details.fundName,
      schemeName: details.schemeName, 
      providerName: details.providerName,
      isLoading: false
    };
  };

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Authentication Required</h3>
          <p className="text-blue-700 mb-4">Please log in to view your orders and transactions.</p>
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show loading message if no userId yet
  if (!userId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalInvested = orders.reduce((sum, order) => {
    return sum + (order.transactionDetails?.amount || order.amount || 0);
  }, 0);

  const successfulOrders = orders.filter(order => 
    order.status === 'ORDER_CONFIRMED' || order.status === 'PAYMENT_COMPLETED'
  ).length;

  const pendingOrders = orders.filter(order => 
    order.status === 'PENDING' || order.status === 'KYC_PENDING' || order.status === 'PROCESSING'
  ).length;

  // Loading skeleton
  if (loading && orders.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto animate-pulse">
        {/* Skeleton Summary Cards */}
        <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
          <div className="absolute -top-3 left-4 sm:left-8 bg-white px-4 py-1 text-sm font-medium text-gray-300 border border-blue-400/50 rounded-full shadow-sm z-10">
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-0 lg:divide-x divide-blue-400/60 p-4 lg:p-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
                <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full border-2 border-blue-400/50 z-10 shadow-sm">
                </div>
                <div className="pl-6 lg:pl-8">
                  <div className="h-6 lg:h-8 w-24 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-32 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Filters */}
        <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
          <div className="absolute -top-3 left-4 sm:left-8 bg-white px-4 py-1 text-sm font-medium text-gray-300 border border-blue-400/50 rounded-full shadow-sm z-10">
            <div className="h-4 w-28 bg-gray-300 rounded"></div>
          </div>
          
          <div className="p-4 lg:p-6">
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-24 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton Orders Table */}
        <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm">
          <div className="p-4 lg:p-6 border-b border-blue-100/40">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center justify-between">
              <div className="h-6 w-32 bg-gray-300 rounded"></div>
              <div className="h-4 w-40 bg-gray-300 rounded"></div>
            </div>
          </div>

          {/* Desktop Skeleton Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <th key={i} className="text-left p-4">
                      <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-300 rounded"></div>
                        <div className="h-3 w-24 bg-gray-300 rounded"></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-16 bg-gray-300 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-12 bg-gray-300 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-16 bg-gray-300 rounded"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Skeleton Cards */}
          <div className="lg:hidden divide-y divide-gray-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-4 w-20 bg-gray-300 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j}>
                      <div className="h-3 w-16 bg-gray-300 rounded mb-1"></div>
                      <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <Button onClick={fetchOrders} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
      {/* Summary Cards */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
        <div className="absolute -top-3 left-4 sm:left-8 bg-white px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Transaction Summary
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-0 lg:divide-x divide-blue-400/60 p-4 lg:p-0">
          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <ArrowUpCircle className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-blue-600 truncate">{formatAmount(totalInvested)}</p>
              <p className="text-sm text-gray-600 truncate">Total Orders Value</p>
            </div>
          </div>

          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-gray-900 truncate">{successfulOrders}</p>
              <p className="text-sm text-gray-600 truncate">Successful Orders</p>
            </div>
          </div>

          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent rounded-lg lg:rounded-none border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-gray-900 truncate">{pendingOrders}</p>
              <p className="text-sm text-gray-600 truncate">Pending Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Only */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
        <div className="absolute -top-3 left-4 sm:left-8 bg-white px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Filters & Actions
        </div>
        
        <div className="p-4 lg:p-6">
          <div className="flex gap-2 flex-wrap">
            {/* Status Filter */}
            <FilterDropdown
              title="Status"
              options={statusOptions}
              value={filters.status ? statusOptions.find(opt => opt.value === filters.status)?.label : ''}
              onChange={(value) => handleFilterChange('status', value)}
              isOpen={statusDropdownOpen}
              onToggle={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setTypeDropdownOpen(false);
              }}
            />

            {/* Type Filter */}
            <FilterDropdown
              title="Type"
              options={typeOptions}
              value={filters.type ? typeOptions.find(opt => opt.value === filters.type)?.label : ''}
              onChange={(value) => handleFilterChange('type', value)}
              isOpen={typeDropdownOpen}
              onToggle={() => {
                setTypeDropdownOpen(!typeDropdownOpen);
                setStatusDropdownOpen(false);
              }}
            />

            {/* Clear Filters */}
            {(filters.status || filters.type) && (
              <Button
                type="button"
                onClick={clearFilters}
                variant="outline"
                className="h-12 bg-white/50 hover:bg-white/70 rounded border border-blue-200/40"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}

            {/* Action Buttons */}
            <Button
              onClick={fetchOrders}
              variant="outline"
              className="h-12 bg-white/50 hover:bg-white/70 rounded border border-blue-200/40"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4 lg:p-6 border-b border-blue-100/40">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {orders.length === 0 ? 'No Orders Found' : 'Recent Orders'}
            </h3>
            <span className="text-sm text-gray-500">
              Showing {orders.length} of {pagination.total || 0} orders
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-4">
              {filters.status || filters.type 
                ? 'Try adjusting your filter criteria.' 
                : 'You haven\'t made any orders yet. Start investing to see your orders here.'
              }
            </p>
            {(filters.status || filters.type) && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 text-xs font-medium text-gray-700">Date</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-700">Fund Details</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-700">Type</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-700">Amount</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-700">Units</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-700">NAV</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const fundDisplay = getFundDisplay(order.itemId);
                    return (
                      <tr 
                        key={order._id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleOrderClick(order)}
                      >
                        <td className="p-4 text-xs text-gray-900">{formatDate(order.createdAt)}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <OrderIcon status={order.status} size="w-8 h-8" />
                            <div>
                              <h3 className="text-xs font-medium text-gray-900">
                                {fundDisplay.schemeName}
                              </h3>
                              
                              <p className="text-xs text-gray-400">{order.step ? order.step.toLowerCase().replace(/_/g, ' ') : 'processing'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-medium ${getTypeColor(order.type)}`}>
                            {order.type}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-medium text-gray-900">
                          {formatAmount(order.transactionDetails?.amount || order.amount || 0)}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.toLowerCase().replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-900">
                          {order.lumpsumDetails?.units || '-'}
                        </td>
                        <td className="p-4 text-xs text-gray-900">
                          {order.lumpsumDetails?.navValue ? `₹${order.lumpsumDetails.navValue}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {orders.map((order) => {
                const fundDisplay = getFundDisplay(order.itemId);
                return (
                  <div 
                    key={order._id} 
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      <OrderIcon status={order.status} size="w-8 h-8" />
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-gray-900">
                          {fundDisplay.schemeName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          by {fundDisplay.providerName}
                        </p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-500">Type:</p>
                        <p className={`font-medium ${getTypeColor(order.type)}`}>{order.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Amount:</p>
                        <p className="font-medium text-gray-900">{formatAmount(order.transactionDetails?.amount || order.amount || 0)}</p>
                      </div>
                      {order.lumpsumDetails?.units && (
                        <>
                          <div>
                            <p className="text-gray-500">Units:</p>
                            <p className="font-medium text-gray-900">{order.lumpsumDetails.units}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">NAV:</p>
                            <p className="font-medium text-gray-900">₹{order.lumpsumDetails.navValue}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Load More / Pagination */}
        {pagination.pages > 1 && filters.page < pagination.pages && (
          <div className="p-4 lg:p-6 border-t border-gray-200 text-center">
            <Button 
              onClick={handleLoadMore}
              variant="outline" 
              className="bg-white/50 hover:bg-white/70 rounded border border-blue-200/40"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Load More Orders'
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Page {pagination.page} of {pagination.pages}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        getFundDisplay={getFundDisplay}
      />
    </div>
  );
};

export default OrdersTransactions;