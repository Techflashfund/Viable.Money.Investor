'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Calendar,
  IndianRupee,
  TrendingUp,
  Heart,
  BarChart3
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

  // Use actual fund data with some enhanced dummy details
  const fundDetails = {
    ...fund,
    nav: "₹145.23",
    navChange: "+1.45%",
    navChangeAmount: "+₹2.07",
    cagr: "+12.8%",
    minInvestment: "₹500.00",
    aum: "₹8,450.67 Cr.",
    exitLoad: "1%",
    expenseRatio: "1.2%",
    fundManager: "Rajesh Kumar",
    launchDate: "Mar 15, 2018",
    benchmark: "NIFTY 500 TRI"
  };

  const periods = ['1 Year', '3 Years', '5 Years', 'All'];

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
                {fund.name}
              </h1>
              <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600">
                <span>Direct</span>
                <span>•</span>
                <span>Growth</span>
                <span>•</span>
                <span>{fund.category}</span>
                <span>•</span>
                <span>by {fund.creator}</span>
              </div>
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
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full font-medium transition-colors"
                onClick={() => onInvest(fund, 'purchase')}
              >
                <IndianRupee className="w-4 h-4 mr-2" />
                Buy
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full font-medium transition-colors"
                onClick={() => onInvest(fund, 'sip')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                SIP
              </Button>
            </div>
          </div>
        </div>
      </div>

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
              {fundDetails.nav}
            </div>
            <div className="text-sm text-green-600 font-medium">
              {fundDetails.navChange} ({fundDetails.navChangeAmount})
            </div>
          </div>

          {/* CAGR Card */}
          <div className="bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">CAGR</span>
              </div>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-300 rounded-full px-3 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {periods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {fundDetails.cagr}
            </div>
          </div>
        </div>

        {/* Right Column - Chart */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 shadow-sm h-full">
            {/* Chart Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">NAV Performance</h3>
                <div className="text-sm text-gray-600">
                  Current: <span className="font-medium text-gray-900">{fundDetails.nav.replace('₹', '')}</span>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="p-6">
              <div className="h-80 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 32" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Y-axis labels */}
                  <text x="25" y="50" textAnchor="end" className="fill-gray-400 text-xs">160</text>
                  <text x="25" y="80" textAnchor="end" className="fill-gray-400 text-xs">140</text>
                  <text x="25" y="110" textAnchor="end" className="fill-gray-400 text-xs">120</text>
                  <text x="25" y="140" textAnchor="end" className="fill-gray-400 text-xs">100</text>
                  <text x="25" y="170" textAnchor="end" className="fill-gray-400 text-xs">80</text>
                  <text x="25" y="200" textAnchor="end" className="fill-gray-400 text-xs">60</text>
                  <text x="25" y="230" textAnchor="end" className="fill-gray-400 text-xs">40</text>
                  <text x="25" y="260" textAnchor="end" className="fill-gray-400 text-xs">20</text>
                  
                  {/* NAV performance line */}
                  <path 
                    d="M 50 280 
                       L 100 275 L 150 270 L 200 260 L 250 240 L 300 220 
                       L 350 200 L 400 180 L 450 170 L 500 160 L 550 150 
                       L 600 140 L 650 130 L 700 120 L 750 110 L 780 100" 
                    stroke="#3b82f6" 
                    strokeWidth="2.5" 
                    fill="none"
                  />
                  
                  {/* Area under curve */}
                  <path 
                    d="M 50 280 
                       L 100 275 L 150 270 L 200 260 L 250 240 L 300 220 
                       L 350 200 L 400 180 L 450 170 L 500 160 L 550 150 
                       L 600 140 L 650 130 L 700 120 L 750 110 L 780 100
                       L 780 300 L 50 300 Z" 
                    fill="url(#gradient)" 
                    opacity="0.1"
                  />
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Current value indicator */}
                  <circle cx="780" cy="100" r="4" fill="#3b82f6" />
                  <circle cx="780" cy="100" r="8" fill="#3b82f6" opacity="0.2" />
                  
                  {/* X-axis labels */}
                  <text x="100" y="310" textAnchor="middle" className="fill-gray-400 text-xs">2020</text>
                  <text x="200" y="310" textAnchor="middle" className="fill-gray-400 text-xs">2021</text>
                  <text x="300" y="310" textAnchor="middle" className="fill-gray-400 text-xs">2022</text>
                  <text x="400" y="310" textAnchor="middle" className="fill-gray-400 text-xs">2023</text>
                  <text x="500" y="310" textAnchor="middle" className="fill-gray-400 text-xs">2024</text>
                  <text x="650" y="310" textAnchor="middle" className="fill-gray-400 text-xs">2025</text>
                </svg>
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
                <span className="text-sm text-gray-600">Fund Manager</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.fundManager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Launch Date</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.launchDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Benchmark</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.benchmark}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Category</span>
                <span className="text-sm font-medium text-gray-900">{fund.category}</span>
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
                <span className="text-sm text-gray-600">Min. Investment</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.minInvestment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">AUM</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.aum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Exit Load</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.exitLoad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expense Ratio</span>
                <span className="text-sm font-medium text-gray-900">{fundDetails.expenseRatio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-white border border-gray-200 shadow-sm md:col-span-2 lg:col-span-1">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Returns (CAGR)</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">1 Year</span>
                <span className="text-sm font-medium text-green-600">+12.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">3 Years</span>
                <span className="text-sm font-medium text-green-600">+15.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">5 Years</span>
                <span className="text-sm font-medium text-green-600">+18.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Since Launch</span>
                <span className="text-sm font-medium text-green-600">+16.4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundDetails;