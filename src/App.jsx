import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout/MainLayout';
import Home from './pages/home/Home';
import StorageLayout from './pages/storage/StorageLayout';
import StorageDashboard from './pages/storage/StorageDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import AdminUsers from './pages/admin/users/AdminUsers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route path="/storage" element={<StorageLayout />}>
          <Route index element={<StorageDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
