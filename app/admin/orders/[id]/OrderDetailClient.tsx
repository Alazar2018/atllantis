'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatPrice } from '@/lib/utils';
import { fetchWithAuth } from '@/lib/authUtils';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  product_category: string | null;
  quantity: number;
  price: number;
  original_price: number;
  size: string | null;
  color: string | null;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface OrderDetailClientProps {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [markingAsSold, setMarkingAsSold] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetchWithAuth(`/api/admin/orders/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch order');
      }

      setOrder(data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!order) return;

    setConfirming(true);
    try {
      const response = await fetchWithAuth(`/api/admin/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to confirm order');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || 'Failed to confirm order');
      }

      toast.success('Order confirmed successfully! Customer has been notified.');
      
      // Generate and download receipt
      await generateReceipt();
      
      fetchOrder(); // Refresh order data
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Failed to confirm order');
    } finally {
      setConfirming(false);
    }
  };

  const generateReceipt = async () => {
    try {
      toast.info('Generating receipt...');
      
      const response = await fetchWithAuth(`/api/admin/orders/${orderId}/receipt`, {
        method: 'POST'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Check content type to determine file extension
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('pdf')) {
          a.download = `receipt-order-${orderId}.pdf`;
          toast.success('PDF receipt generated successfully!');
        } else {
          a.download = `receipt-order-${orderId}.html`;
          toast.success('HTML receipt generated! You can print this to PDF.');
        }
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        toast.error(errorData.message || 'Failed to generate receipt');
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    }
  };

  const handleMarkAsSold = async () => {
    if (!order) return;

    setMarkingAsSold(true);
    try {
      const response = await fetchWithAuth(`/api/admin/orders/${orderId}/mark-sold`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to mark order as sold');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || 'Failed to mark order as sold');
      }

      toast.success(`Order marked as sold! ETB ${data.data.amountAdded} added to balance.`);
      fetchOrder(); // Refresh order data
    } catch (error) {
      console.error('Error marking order as sold:', error);
      toast.error('Failed to mark order as sold');
    } finally {
      setMarkingAsSold(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Sold': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-purple-100 text-purple-800';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <button
            onClick={() => router.push('/admin/orders')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-gray-600 mt-2">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Orders
          </button>
          {order.status === 'Pending' && (
            <button
              onClick={handleConfirmOrder}
              disabled={confirming}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {confirming ? 'Confirming...' : 'Confirm Order'}
            </button>
          )}
                     {order.status === 'Confirmed' && (
             <button
               onClick={handleMarkAsSold}
               disabled={markingAsSold}
               className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
             >
               {markingAsSold ? 'Processing...' : 'Mark as Sold'}
             </button>
           )}
           <button
             onClick={generateReceipt}
             className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
           >
             Generate Receipt
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center border-b pb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden mr-4">
                    {item.product_image ? (
                      <img
                        src={item.product_image.startsWith('http') ? item.product_image : `http://localhost:3001${item.product_image}`}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-gray-400 ${item.product_image ? 'hidden' : ''}`}>
                      No Image
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">{item.product_category}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Qty: {item.quantity}</span>
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                    {item.original_price > item.price && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatPrice(item.original_price)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Order Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{order.customer_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{order.customer_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{order.customer_phone}</p>
              </div>
              {order.customer_address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-gray-900">{order.customer_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Status</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.status === 'Confirmed' && (
                    <button
                      onClick={handleMarkAsSold}
                      disabled={markingAsSold}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {markingAsSold ? 'Processing...' : 'Mark as Sold'}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Status</label>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full mt-1 ${getPaymentStatusColor(order.payment_status)}`}>
                  {order.payment_status}
                </span>
              </div>
              {order.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-gray-900 mt-1">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      />
    </div>
  );
}
