import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  RefreshCw,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';

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

// Order Details Modal
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
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

  return (
    <div className="fixed inset-0 bg-white/50  flex items-center justify-center z-50 p-4 ">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <OrderIcon status={order.status} size="w-10 h-10" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-500">Ondc Mid Cap Fund</p>
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://viable-money-be.onrender.com/api/transaction/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

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

  if (loading) {
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

        {/* Skeleton Search and Actions */}
        <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
          <div className="absolute -top-3 left-4 sm:left-8 bg-white px-4 py-1 text-sm font-medium text-gray-300 border border-blue-400/50 rounded-full shadow-sm z-10">
            <div className="h-4 w-28 bg-gray-300 rounded"></div>
          </div>
          
          <div className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="h-12 bg-gray-300 rounded"></div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-24 bg-gray-300 rounded"></div>
                ))}
              </div>
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

      {/* Search and Actions */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
        <div className="absolute -top-3 left-4 sm:left-8 bg-white px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Search & Actions
        </div>
        
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchOrders} variant="outline" className="h-12 bg-white/50 hover:bg-white/70 rounded border border-blue-200/40">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" className="h-12 bg-white/50 hover:bg-white/70 rounded border border-blue-200/40">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="h-12 bg-white/50 hover:bg-white/70 rounded border border-blue-200/40">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4 lg:p-6 border-b border-blue-100/40">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <span className="text-sm text-gray-500">
              Showing {orders.length} of {pagination.total || 0} orders
            </span>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-4 text-xs font-medium text-gray-700">Date</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">Fund details</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">Type</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">Amount</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">Status</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">Units</th>
                <th className="text-left p-4 text-xs font-medium text-gray-700">NAV</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
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
                        <h3 className="text-xs font-medium text-gray-900">Ondc Mid Cap Fund</h3>
                        <p className="text-xs text-gray-500">by ONDC Mutual Fund</p>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {orders.map((order) => (
            <div 
              key={order._id} 
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleOrderClick(order)}
            >
              <div className="flex items-start space-x-3 mb-3">
                <OrderIcon status={order.status} size="w-8 h-8" />
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-gray-900">Ondc Mid Cap Fund</h4>
                  <p className="text-xs text-gray-500">by ONDC Mutual Fund</p>
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
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 lg:p-6 border-t border-gray-200 text-center">
            <Button variant="outline" className="bg-white/50 hover:bg-white/70 rounded border border-blue-200/40">
              Load More Orders
            </Button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default OrdersTransactions;