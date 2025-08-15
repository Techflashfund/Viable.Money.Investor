import React from 'react';
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
  Clock
} from 'lucide-react';

const Goals = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Goals</h1>
        <p className="text-gray-600">Plan and track your financial goals with systematic investing</p>
      </div>

      {/* Goals Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-blue-200 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">4</h3>
          <p className="text-sm text-gray-600">Active Goals</p>
        </div>

        <div className="bg-white border border-green-200 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">₹2.5L</h3>
          <p className="text-sm text-gray-600">Goals Invested</p>
        </div>

        <div className="bg-white border border-purple-200 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">3.2 Yrs</h3>
          <p className="text-sm text-gray-600">Avg. Duration</p>
        </div>
      </div>

      {/* Create Goal Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Start a New Goal</h2>
            <p className="text-gray-600">Define your financial goals and let us help you achieve them</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </div>
      </div>

      {/* Goal Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <Home className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Home</h3>
          <p className="text-sm text-gray-600">Dream house</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <Car className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Car</h3>
          <p className="text-sm text-gray-600">New vehicle</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Education</h3>
          <p className="text-sm text-gray-600">Child's future</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Plane className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Travel</h3>
          <p className="text-sm text-gray-600">Dream vacation</p>
        </div>
      </div>

      {/* Active Goals */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Active Goals</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {[
            {
              name: 'Dream Home',
              target: '₹50,00,000',
              current: '₹12,50,000',
              monthly: '₹25,000',
              duration: '8 years',
              progress: 25,
              icon: Home,
              color: 'orange'
            },
            {
              name: 'Child Education',
              target: '₹20,00,000',
              current: '₹6,80,000',
              monthly: '₹15,000',
              duration: '6 years',
              progress: 34,
              icon: GraduationCap,
              color: 'green'
            },
            {
              name: 'New Car',
              target: '₹8,00,000',
              current: '₹4,20,000',
              monthly: '₹12,000',
              duration: '2.5 years',
              progress: 52,
              icon: Car,
              color: 'red'
            },
            {
              name: 'Europe Trip',
              target: '₹3,00,000',
              current: '₹1,20,000',
              monthly: '₹8,000',
              duration: '1.5 years',
              progress: 40,
              icon: Plane,
              color: 'blue'
            }
          ].map((goal, index) => {
            const IconComponent = goal.icon;
            return (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 bg-${goal.color}-100 rounded-full flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 text-${goal.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{goal.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Target: {goal.target}</span>
                        <span>Duration: {goal.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 lg:max-w-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium text-gray-900">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`bg-${goal.color}-600 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Invested: {goal.current}</span>
                      <span className="text-gray-600">SIP: {goal.monthly}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Invest More
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIP Calculator */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">SIP Calculator</h2>
          <Calculator className="w-5 h-5 text-gray-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Investment</label>
              <Input type="number" placeholder="₹10,000" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Investment Period (Years)</label>
              <Input type="number" placeholder="10" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Return (%)</label>
              <Input type="number" placeholder="12" className="w-full" />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Calculate
            </Button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Projected Results</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Investment:</span>
                <span className="font-semibold">₹12,00,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Returns:</span>
                <span className="font-semibold text-green-600">₹11,61,695</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-900 font-medium">Maturity Value:</span>
                <span className="font-bold text-blue-600 text-lg">₹23,61,695</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;