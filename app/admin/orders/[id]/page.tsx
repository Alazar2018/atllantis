'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import OrderDetailClient from './OrderDetailClient';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <OrderDetailClient orderId={orderId as string} />
    </div>
  );
}
