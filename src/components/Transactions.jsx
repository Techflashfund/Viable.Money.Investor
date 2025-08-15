import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  Download,
  Filter,
  CheckCircle2
} from 'lucide-react';

const Transactions = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600">Track all your investment transactions and SIP history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-blue-200 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowUpCircle className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">₹85,000</h3>
          <p className="text-sm text-gray-600">Total Invested This Month</p>
        </div>

        <div className="bg-white border border-green-200 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">12</h3>
          <p className="text-sm text-gray-600">Successful SIPs</p>
        </div>

        <div className="bg-white border border-orange-200 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">2</h3>
          <p className="text-sm text-gray-600">Pending Transactions</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-10"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-4 text-sm font-medium text-gray-900">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900">Fund Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900">NAV</th>
                <th className="text-left p-4 text-sm font-medium text-gray-900">Units</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  date: '15 Dec 2024',
                  fund: 'HDFC Equity Fund',
                  type: 'SIP',
                  amount: '₹3,000',
                  status: 'Success',
                  nav: '₹45.32',
                  units: '66.18'
                },
                {
                  date: '10 Dec 2024',
                  fund: 'SBI Small Cap Fund',
                  type: 'Lumpsum',
                  amount: '₹15,000',
                  status: 'Success',
                  nav: '₹78.45',
                  units: '191.20'
                },
                {
                  date: '05 Dec 2024',
                  fund: 'ICICI Prudential Bluechip',
                  type: 'SIP',
                  amount: '₹2,500',
                  status: 'Success',
                  nav: '₹52.18',
                  units: '47.91'
                },
                {
                  date: '01 Dec 2024',
                  fund: 'Axis Small Cap Fund',
                  type: 'SIP',
                  amount: '₹2,000',
                  status: 'Pending',
                  nav: '₹35.67',
                  units: '-'
                },
                {
                  date: '30 Nov 2024',
                  fund: 'HDFC Equity Fund',
                  type: 'Redemption',
                  amount: '₹5,000',
                  status: 'Success',
                  nav: '₹44.89',
                  units: '-111.42'
                }
              ].map((transaction, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-900">{transaction.date}</td>
                  <td className="p-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.fund}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'SIP' ? 'bg-blue-100 text-blue-800' :
                      transaction.type === 'Lumpsum' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`font-medium ${
                      transaction.type === 'Redemption' ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {transaction.type === 'Redemption' ? '-' : ''}{transaction.amount}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'Success' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-900">{transaction.nav}</td>
                  <td className="p-4 text-sm">
                    <span className={`${
                      transaction.units.startsWith('-') ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {transaction.units}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {[
            {
              date: '15 Dec 2024',
              fund: 'HDFC Equity Fund',
              type: 'SIP',
              amount: '₹3,000',
              status: 'Success',
              nav: '₹45.32',
              units: '66.18'
            },
            {
              date: '10 Dec 2024',
              fund: 'SBI Small Cap Fund',
              type: 'Lumpsum',
              amount: '₹15,000',
              status: 'Success',
              nav: '₹78.45',
              units: '191.20'
            },
            {
              date: '05 Dec 2024',
              fund: 'ICICI Prudential Bluechip',
              type: 'SIP',
              amount: '₹2,500',
              status: 'Success',
              nav: '₹52.18',
              units: '47.91'
            }
          ].map((transaction, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{transaction.fund}</h4>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.status === 'Success' ? 'bg-green-100 text-green-800' :
                  transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {transaction.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{transaction.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium">{transaction.amount}</p>
                </div>
                <div>
                  <p className="text-gray-500">NAV</p>
                  <p className="font-medium">{transaction.nav}</p>
                </div>
                <div>
                  <p className="text-gray-500">Units</p>
                  <p className="font-medium">{transaction.units}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 text-center">
          <Button variant="outline">Load More Transactions</Button>
        </div>
      </div>

      {/* SIP Schedule */}
      <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming SIP Transactions</h2>
        <div className="space-y-3">
          {[
            { fund: 'HDFC Equity Fund', amount: '₹3,000', date: '20 Dec 2024' },
            { fund: 'SBI Small Cap Fund', amount: '₹2,000', date: '25 Dec 2024' },
            { fund: 'ICICI Prudential Bluechip', amount: '₹2,500', date: '30 Dec 2024' }
          ].map((sip, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{sip.fund}</p>
                <p className="text-sm text-gray-600">Next: {sip.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{sip.amount}</p>
                <p className="text-xs text-blue-600">Auto-debit</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transactions;