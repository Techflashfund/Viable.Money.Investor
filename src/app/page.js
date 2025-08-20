'use client';
import React, { useState } from 'react';
import UserTopNav from '../components/topnav';
import Portfolio from '../components/Portfolio';
import Investments from '../components/Investments';
import Transactions from '../components/Transactions';
import Goals from '../components/goals';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('portfolio');

  const renderContent = () => {
    switch (activeView) {
      case 'portfolio':
        return <Portfolio />;
      case 'investments':
        return <Investments />;
      case 'transactions':
        return <Transactions />;
      case 'goals':
        return <Goals />;
      default:
        return <Portfolio />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50/30">
      {/* Top Navigation - Always Visible */}
      <UserTopNav 
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="transition-all duration-300 ease-in-out">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;