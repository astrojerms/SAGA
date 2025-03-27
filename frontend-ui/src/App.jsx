import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import Timeline from './pages/Timeline';
import SecurityTimeline from './pages/SecurityTimeline';

const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p>Welcome to your dashboard. This is where you'll see your analytics and key metrics.</p>
  </div>
);

const Reports = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Reports</h1>
    <p>View and generate your custom reports in this section.</p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Timeline />} />
        <Route path="/security" element={<SecurityTimeline />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;