"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { clubService } from '@/services/clubService';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function PaymentStatusContent() {
  const [status, setStatus] = useState('loading'); // loading, success, failure
  const [message, setMessage] = useState('Verifying payment status...');
  const [ MerchantTransactionId, setMerchantTransactionId ] = useState(null);
  useEffect(() => {
    const checkStatus = async () => {
      setMerchantTransactionId(
        sessionStorage.getItem('current_transaction_id')
       )

      if (!MerchantTransactionId) {
        setStatus('failure');
        setMessage('Invalid transaction ID.');
        return;
      }

      try {
        const response = await clubService.checkPaymentStatus(MerchantTransactionId);

        if (response.data?.status == 'success' || response.data?.success === true) {
          setStatus('success');
          setMessage('Your payment was successful!');
          sessionStorage.removeItem('current_transaction_id'); // Clear on success
        } else if (response.data?.status == 'PENDING') {
            setStatus('pending');
            setMessage('Payment is currently pending. Please check back later.');
        } else {
          setStatus('failure');
          setMessage('Payment failed or declined.');
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus('failure');
        setMessage('Could not verify payment status. Please contact support.');
      }
    };

    checkStatus();
  }, [MerchantTransactionId]);

  return (
    <Card className="h-fit w-full max-w-md text-center">
      <CardHeader>
          <div className="flex justify-center mb-4">
              {status === 'loading' && <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
              {status === 'failure' && <XCircle className="h-16 w-16 text-red-500" />}
              {status === 'pending' && <Loader2 className="h-16 w-16 text-yellow-500" />}
          </div>
        <CardTitle>
          {status === 'loading' && 'Processing...'}
          {status === 'success' && 'Payment Successful'}
          {status === 'failure' && 'Payment Failed'}
          {status === 'pending' && 'Payment Pending'}
        </CardTitle>
        <CardDescription>
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
          {status === 'failure' && (
             <Button variant="outline" asChild className="w-full">
               <Link href="/finance">Try Again / View Invoices</Link>
             </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}>
        <PaymentStatusContent />
      </Suspense>
    </div>
  );
}
