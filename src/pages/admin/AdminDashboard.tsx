
import React from 'react';
import DashboardNav from '@/components/DashboardNav';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord administrateur</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <DashboardNav />
        </div>
        <div className="md:col-span-3">
          <div className="grid gap-4">
            <div className="p-6 bg-white shadow rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Bienvenue dans le tableau de bord administrateur</h2>
              <p className="text-gray-600">
                Utilisez la barre de navigation à gauche pour accéder aux différentes fonctionnalités d'administration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
