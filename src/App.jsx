import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout/MainLayout';
import Home from './pages/home/Home';
import StorageLayout from './pages/storage/StorageLayout';
import StorageDashboard from './pages/storage/StorageDashboard';
import StaffLayout from './pages/staff/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffList from './pages/staff/StaffList';
import StaffOrders from './pages/staff/StaffOrders';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/storage" element={<StorageLayout />}>
          <Route index element={<StorageDashboard />} />
        </Route>

        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="members" element={<StaffList />} />
          <Route path="orders" element={<StaffOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;