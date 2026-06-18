'use client';

import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode.react';

interface QRPaymentProps {
  orderId: string;
  amount: number;
  onPaymentSuccess?: () => void;
  onCancel?: () => void;
}

function generateSecureHash(orderId: string, amount: number, timestamp: number): string {
  // In production, this would be generated server-side with HMAC-SHA256
  const data = `${orderId}|${amount}|${timestamp}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

export function QRPaymentView({ orderId, amount, onPaymentSuccess, onCancel }: QRPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'processing' | 'success' | 'failed'>('waiting');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const timestamp = useMemo(() => Date.now(), []);
  const secureHash = useMemo(() => generateSecureHash(orderId, amount, timestamp), [orderId, amount, timestamp]);

  const upiString = useMemo(() => {
    return `upi://pay?pa=crpfcanteen@okhdfcbank&pn=CRPF%20Canteen&am=${amount.toFixed(2)}&cu=INR&tn=Order%20${orderId}&tr=${orderId}&mc=5812&sign=${secureHash}`;
  }, [orderId, amount, secureHash]);

  // Countdown timer
  useEffect(() => {
    if (paymentStatus !== 'waiting') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPaymentStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentStatus]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPaymentStatus('success');
    setIsProcessing(false);
    onPaymentSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0e12]/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-[#131318] rounded-2xl border border-[#464753]/20 p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#ffb690]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[#ffb690] text-3xl">qr_code_scanner</span>
          </div>
          <h2 className="font-headline font-black text-2xl text-white tracking-tight">Scan to Pay</h2>
          <p className="text-[#aaaab7] text-sm mt-2">Use any UPI app to complete payment</p>
        </div>

        {/* QR Code Area */}
        <div className="bg-white rounded-xl p-6 mb-6 flex items-center justify-center">
          <QRCode
            value={upiString}
            size={192}
            level="M"
            includeMargin={true}
            renderAs="canvas"
          />
        </div>

        {/* Order Details */}
        <div className="bg-[#191920] rounded-xl p-4 space-y-3 mb-6 border border-[#464753]/10">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#aaaab7] font-black uppercase tracking-widest">Order ID</span>
            <span className="text-sm font-bold text-[#ffb690]">{orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#aaaab7] font-black uppercase tracking-widest">Amount</span>
            <span className="text-2xl font-black text-white font-headline">₹{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#aaaab7] font-black uppercase tracking-widest">Timestamp</span>
            <span className="text-xs font-bold text-[#aaaab7]">{new Date(timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#aaaab7] font-black uppercase tracking-widest">Secure Hash</span>
            <span className="text-xs font-mono text-[#ffb690]/70">{secureHash}</span>
          </div>
        </div>

        {/* Timer */}
        {paymentStatus === 'waiting' && (
          <div className="text-center mb-6">
            <p className="text-[10px] text-[#aaaab7] font-black uppercase tracking-widest mb-1">Expires In</p>
            <p className={`text-3xl font-black font-headline ${timeLeft < 60 ? 'text-[#ff6b6b]' : 'text-white'}`}>{formatTime(timeLeft)}</p>
          </div>
        )}

        {/* Status Messages */}
        {paymentStatus === 'processing' && (
          <div className="text-center mb-6">
            <div className="animate-spin w-8 h-8 border-2 border-[#ffb690] border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm font-bold text-[#ffb690]">Processing payment...</p>
          </div>
        )}
        {paymentStatus === 'success' && (
          <div className="text-center mb-6 bg-green-500/10 rounded-xl p-4">
            <span className="material-symbols-outlined text-green-400 text-4xl mb-2">check_circle</span>
            <p className="text-sm font-bold text-green-400">Payment Successful!</p>
          </div>
        )}
        {paymentStatus === 'failed' && (
          <div className="text-center mb-6 bg-red-500/10 rounded-xl p-4">
            <span className="material-symbols-outlined text-red-400 text-4xl mb-2">error</span>
            <p className="text-sm font-bold text-red-400">Payment expired. Please try again.</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {paymentStatus === 'waiting' && (
            <button
              onClick={handleSimulatePayment}
              className="w-full py-4 rounded-xl bg-[#ffb690] text-[#131318] font-headline font-extrabold text-sm shadow-[0_8px_16px_rgba(255,182,144,0.2)] hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest"
            >
              Simulate Payment
            </button>
          )}
          <button
            onClick={onCancel}
            className="w-full py-4 rounded-xl bg-[#191920] text-[#aaaab7] font-bold text-sm border border-[#464753]/20 hover:bg-[#2a2b38] active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            {paymentStatus === 'success' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
