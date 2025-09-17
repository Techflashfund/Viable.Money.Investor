'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import UserTopNav from '../components/topnav';
// import Portfolio from '../components/Portfolio';
// import Investments from '../components/Investments';
// import Transactions from '../components/Transactions';
// import Goals from '../components/goals';

const Dashboard = () => {
  const router = useRouter();
  // const [activeView, setActiveView] = useState('portfolio');

  useEffect(() => {
    // Redirect to /dashboard when user visits this page
    router.push('/dashboard');
  }, [router]);

  // const renderContent = () => {
  //   switch (activeView) {
  //     case 'portfolio':
  //       return <Portfolio />;
  //     case 'investments':
  //       return <Investments />;
  //     case 'transactions':
  //       return <Transactions />;
  //     case 'goals':
  //       return <Goals />;
  //     default:
  //       return <Portfolio />;
  //   }
  // };

  // Show loading or nothing while redirecting
  return (
    <div className="min-h-screen font-sans bg-gray-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );

  // {/* Commented out original dashboard content */}
  // return (
  //   <div className="min-h-screen font-sans bg-gray-50/30">
  //     {/* Top Navigation - Always Visible */}
  //     <UserTopNav 
  //       activeView={activeView}
  //       setActiveView={setActiveView}
  //     />

  //     {/* Main Content Area */}
  //     <main className="min-h-[calc(100vh-80px)]">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
  //         <div className="transition-all duration-300 ease-in-out">
  //           {renderContent()}
  //         </div>
  //       </main>
  //     </div>
  //   );
};

export default Dashboard;