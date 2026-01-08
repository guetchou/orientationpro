
import React, { useState } from 'react';
import { AppointmentScheduler } from '@/components/appointments/AppointmentScheduler';
import { useSearchParams } from 'react-router-dom';

export default function Appointment() {
  const [searchParams] = useSearchParams();
  const counselorId = searchParams.get('counselorId') || '';
  const counselorName = searchParams.get('counselorName') || '';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="background-pattern"></div>
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">Prendre un rendez-vous</h1>
        <AppointmentScheduler counselorId={counselorId} counselorName={counselorName} />
      </main>
    </div>
  );
}
