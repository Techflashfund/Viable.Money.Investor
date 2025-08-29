'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Target, 
  Plus, 
  Calculator,
  Home,
  Car,
  GraduationCap,
  Plane,
  Calendar,
  TrendingUp,
  Clock,
  PiggyBank,
  Heart,
  Briefcase,
  Shield,
  Edit3,
  Trash2,
  Eye,
  PlayCircle,
  PauseCircle,
  BarChart3,
  IndianRupee,
  Percent,
  ArrowUpRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Goals = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [calculatorValues, setCalculatorValues] = useState({
    monthly: '',
    years: '',
    returns: ''
  });

  const goalCategories = [
    { icon: Home, title: 'Home Purchase', description: 'Dream house', color: 'orange', count: 1 },
    { icon: Car, title: 'Vehicle', description: 'New car/bike', color: 'red', count: 1 },
    { icon: GraduationCap, title: 'Education', description: "Child's future", color: 'green', count: 1 },
    { icon: Plane, title: 'Travel', description: 'Dream vacation', color: 'blue', count: 1 },
    { icon: PiggyBank, title: 'Retirement', description: 'Future security', color: 'purple', count: 0 },
    { icon: Heart, title: 'Health', description: 'Medical fund', color: 'pink', count: 0 },
    { icon: Briefcase, title: 'Business', description: 'Startup fund', color: 'indigo', count: 0 },
    { icon: Shield, title: 'Emergency', description: 'Safety net', color: 'gray', count: 0 }
  ];

  const activeGoals = [
    {
      id: 1,
      name: 'Dream Home Purchase',
      target: 5000000,
      current: 1250000,
      monthly: 25000,
      duration: 8,
      progress: 25,
      icon: Home,
      color: 'orange',
      status: 'active',
      startDate: '2024-01-01',
      targetDate: '2032-01-01',
      category: 'Real Estate',
      risk: 'Moderate',
      expectedReturn: 12,
      description: 'Saving for a 3BHK apartment in premium location',
      milestones: [
        { amount: 1000000, date: '2024-12-01', status: 'completed' },
        { amount: 2500000, date: '2026-06-01', status: 'upcoming' },
        { amount: 4000000, date: '2029-01-01', status: 'upcoming' }
      ]
    },
    {
      id: 2,
      name: 'Child Higher Education',
      target: 2000000,
      current: 680000,
      monthly: 15000,
      duration: 6,
      progress: 34,
      icon: GraduationCap,
      color: 'green',
      status: 'active',
      startDate: '2023-06-01',
      targetDate: '2030-06-01',
      category: 'Education',
      risk: 'Conservative',
      expectedReturn: 10,
      description: 'International education fund for engineering degree',
      milestones: [
        { amount: 500000, date: '2024-06-01', status: 'completed' },
        { amount: 1200000, date: '2026-12-01', status: 'upcoming' },
        { amount: 1800000, date: '2029-06-01', status: 'upcoming' }
      ]
    },
    {
      id: 3,
      name: 'Luxury Car Purchase',
      target: 800000,
      current: 420000,
      monthly: 12000,
      duration: 2.5,
      progress: 52,
      icon: Car,
      color: 'red',
      status: 'active',
      startDate: '2023-01-01',
      targetDate: '2026-07-01',
      category: 'Lifestyle',
      risk: 'Aggressive',
      expectedReturn: 15,
      description: 'Premium SUV with advanced features',
      milestones: [
        { amount: 300000, date: '2024-01-01', status: 'completed' },
        { amount: 600000, date: '2025-07-01', status: 'upcoming' }
      ]
    },
    {
      id: 4,
      name: 'Europe Vacation',
      target: 300000,
      current: 120000,
      monthly: 8000,
      duration: 1.5,
      progress: 40,
      icon: Plane,
      color: 'blue',
      status: 'active',
      startDate: '2024-06-01',
      targetDate: '2025-12-01',
      category: 'Travel',
      risk: 'Conservative',
      expectedReturn: 8,
      description: '15-day Europe tour covering 5 countries',
      milestones: [
        { amount: 150000, date: '2024-12-01', status: 'upcoming' },
        { amount: 250000, date: '2025-09-01', status: 'upcoming' }
      ]
    }
  ];

  const calculateMaturityValue = () => {
    const { monthly, years, returns } = calculatorValues;
    if (!monthly || !years || !returns) return null;

    const monthlyAmount = parseFloat(monthly);
    const totalMonths = parseFloat(years) * 12;
    const monthlyRate = parseFloat(returns) / 100 / 12;

    const totalInvestment = monthlyAmount * totalMonths;
    const maturityValue = monthlyAmount * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    const returns_amount = maturityValue - totalInvestment;

    return {
      totalInvestment: Math.round(totalInvestment),
      returns: Math.round(returns_amount),
      maturityValue: Math.round(maturityValue)
    };
  };

  const calculationResult = calculateMaturityValue();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount).replace('₹', '₹');
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-3">Financial Goals</h1>
        <p className="text-gray-600 text-base lg:text-lg">Plan and track your financial goals with systematic investing</p>
      </div>

      {/* Goals Summary */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
        <div className="absolute -top-3 left-4 sm:left-8 bg-blue-50 px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Goals Overview
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 lg:gap-0 lg:divide-x divide-blue-400/60 p-4 lg:p-0">
          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <Target className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-blue-600 truncate">4</p>
              <p className="text-sm text-gray-600 truncate">Active Goals</p>
            </div>
          </div>

          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <IndianRupee className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-gray-900 truncate">₹24.7L</p>
              <p className="text-sm text-gray-600 truncate">Total Invested</p>
            </div>
          </div>

          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-gray-900 truncate">₹81L</p>
              <p className="text-sm text-gray-600 truncate">Target Amount</p>
            </div>
          </div>

          <div className="p-4 lg:p-6 relative bg-white lg:bg-transparent border lg:border-0 border-blue-200/50">
            <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
            </div>
            <div className="pl-6 lg:pl-8">
              <p className="text-xl lg:text-2xl font-medium font-sans text-gray-900 truncate">4.5 Yrs</p>
              <p className="text-sm text-gray-600 truncate">Avg. Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Goal Section */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="absolute -top-3 left-4 sm:left-8 bg-blue-50 px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Goal Creation
        </div>
        
        <div className="p-6 lg:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Start a New Financial Goal</h2>
              <p className="text-gray-600">Define your aspirations and create a systematic investment plan</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              <Plus className="w-4 h-4 mr-2" />
              Create New Goal
            </Button>
          </div>
        </div>
      </div>

      {/* Goal Categories */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 mb-6 lg:mb-8 relative">
        <div className="absolute -top-3 left-4 sm:left-8 bg-blue-50 px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          Goal Categories
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-0 lg:divide-x divide-blue-400/60 p-4 lg:p-0">
          {goalCategories.slice(0, 4).map((category, index) => (
            <div 
              key={index}
              className="p-4 lg:p-6 relative bg-white lg:bg-transparent border lg:border-0 border-blue-200/50 cursor-pointer hover:bg-blue-50/50 transition-colors"
            >
              <div className="absolute -left-3 lg:-left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full border-2 border-blue-400/50 flex items-center justify-center z-10 shadow-sm">
                <category.icon className={`w-5 h-5 lg:w-6 lg:h-6 text-${category.color}-600`} />
              </div>
              <div className="pl-6 lg:pl-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{category.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                <p className="text-xs text-gray-500">{category.count} active</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Goals */}
      <div className="backdrop-blur-sm border border-blue-200/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6 lg:mb-8">
        <div className="p-4 lg:p-6 border-b border-blue-100/40">
          <div className="flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Active Goals Progress</h2>
            <Button variant="outline" className="border-gray-300 hover:border-gray-400 text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Analytics
            </Button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {activeGoals.map((goal, index) => {
            const IconComponent = goal.icon;
            const progressPercentage = (goal.current / goal.target) * 100;
            return (
              <div key={index} className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Goal Icon and Basic Info */}
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-10 h-10 bg-${goal.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`w-5 h-5 text-${goal.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{goal.name}</h3>
                        <span className={`text-xs px-2 py-1 ${
                          goal.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{goal.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">Target:</span>
                          <span className="font-medium text-gray-900 ml-2">{formatCurrency(goal.target)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium text-gray-900 ml-2">{goal.duration} years</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium text-gray-900 ml-2">{goal.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Risk:</span>
                          <span className="font-medium text-gray-900 ml-2">{goal.risk}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="flex-1 lg:max-w-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs font-medium text-gray-900">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 mb-3">
                      <div 
                        className={`${getProgressColor(progressPercentage)} h-2 transition-all duration-300`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                      <div>
                        <span className="text-gray-500">Invested:</span>
                        <p className="font-medium text-gray-900">{formatCurrency(goal.current)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Monthly SIP:</span>
                        <p className="font-medium text-gray-900">{formatCurrency(goal.monthly)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Remaining:</span>
                        <p className="font-medium text-red-600">{formatCurrency(goal.target - goal.current)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Expected Return:</span>
                        <p className="font-medium text-green-600">{goal.expectedReturn}% p.a.</p>
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">Next Milestone:</p>
                      {goal.milestones.find(m => m.status === 'upcoming') && (
                        <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200">
                          <span className="text-xs font-medium text-gray-900">
                            {formatCurrency(goal.milestones.find(m => m.status === 'upcoming').amount)}
                          </span>
                          <span className="text-xs text-blue-600">
                            {new Date(goal.milestones.find(m => m.status === 'upcoming').date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 lg:min-w-[120px]">
                    <Button variant="outline" size="sm" className="text-xs border-blue-200 hover:bg-blue-50">
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      Invest More
                    </Button>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                        <Edit3 className="w-3 h-3 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                        <PauseCircle className="w-3 h-3 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIP Calculator */}
      <div className="backdrop-blur-lg border-1 border-blue-400/50 relative">
        <div className="absolute -top-3 left-4 sm:left-8 bg-blue-50 px-4 py-1 text-sm font-medium text-gray-700 border border-blue-400/50 rounded-full shadow-sm z-10">
          SIP Calculator
        </div>
        
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Goal Planning Calculator</h2>
            <Calculator className="w-5 h-5 text-gray-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Monthly Investment Amount</label>
                <Input 
                  type="number" 
                  placeholder="₹10,000" 
                  value={calculatorValues.monthly}
                  onChange={(e) => setCalculatorValues({...calculatorValues, monthly: e.target.value})}
                  className="w-full h-10 text-sm border-gray-300 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Investment Period (Years)</label>
                <Input 
                  type="number" 
                  placeholder="10" 
                  value={calculatorValues.years}
                  onChange={(e) => setCalculatorValues({...calculatorValues, years: e.target.value})}
                  className="w-full h-10 text-sm border-gray-300 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Expected Annual Return (%)</label>
                <Input 
                  type="number" 
                  placeholder="12" 
                  value={calculatorValues.returns}
                  onChange={(e) => setCalculatorValues({...calculatorValues, returns: e.target.value})}
                  className="w-full h-10 text-sm border-gray-300 focus:border-blue-500"
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Goal Amount
              </Button>
            </div>

            {/* Results Section */}
            <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-6 border border-blue-200/50">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Projected Results</h3>
              {calculationResult ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Investment:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(calculationResult.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Returns:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(calculationResult.returns)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-sm">
                    <span className="text-gray-900 font-medium">Maturity Value:</span>
                    <span className="font-bold text-blue-600 text-lg">{formatCurrency(calculationResult.maturityValue)}</span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-700">
                        Your investment can grow by {Math.round((calculationResult.returns / calculationResult.totalInvestment) * 100)}% over {calculatorValues.years} years
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">Enter values to see your goal calculation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;