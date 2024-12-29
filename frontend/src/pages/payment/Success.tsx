// frontend/src/pages/payment/Success.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useSubscription } from '../../hooks/useSubscription';

export const PaymentSuccess: React.FC = () => {
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 const { fetchSubscription } = useSubscription();
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 // Verify the payment and update subscription
 useEffect(() => {
   const verifyPayment = async () => {
     try {
       const sessionId = searchParams.get('session_id');
       if (!sessionId) {
         throw new Error('No session ID found');
       }

       // Verify payment with backend
       const response = await fetch('/api/payment/verify', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ sessionId })
       });

       if (!response.ok) {
         throw new Error('Failed to verify payment');
       }

       // Refresh subscription data
       await fetchSubscription();
     } catch (err) {
       setError(err instanceof Error ? err.message : 'Something went wrong');
     } finally {
       setLoading(false);
     }
   };

   verifyPayment();
 }, [searchParams, fetchSubscription]);

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full text-center">
         <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
         <h2 className="text-xl font-semibold mt-4">
           Confirming your payment...
         </h2>
         <p className="text-gray-500 mt-2">
           Please wait while we verify your payment and activate your subscription.
         </p>
       </div>
     </div>
   );
 }

 if (error) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full text-center">
         <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
           <span className="text-red-600 text-xl">×</span>
         </div>
         <h2 className="text-xl font-semibold mt-4">Payment Verification Failed</h2>
         <p className="text-gray-500 mt-2">{error}</p>
         <div className="mt-6 space-y-3">
           <Button 
             variant="outline" 
             className="w-full"
             onClick={() => navigate('/pricing')}
           >
             Try Again
           </Button>
           <Button 
             variant="link"
             className="w-full"
             onClick={() => navigate('/support')}
           >
             Contact Support
           </Button>
         </div>
       </div>
     </div>
   );
 }

 return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50">
     <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
       <div className="text-center">
         <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
         <h2 className="text-2xl font-semibold mt-4">
           Payment Successful!
         </h2>
         <p className="text-gray-500 mt-2">
           Thank you for your subscription. Your account has been upgraded and you now
           have access to all premium features.
         </p>
       </div>

       <div className="mt-8 space-y-4">
         <Button
           className="w-full"
           onClick={() => navigate('/dashboard')}
         >
           Go to Dashboard
           <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
         
         <Button
           variant="outline"
           className="w-full"
           onClick={() => navigate('/builder')}
         >
           Start Building
         </Button>

         <div className="text-center">
           <Button
             variant="link"
             onClick={() => navigate('/docs/getting-started')}
           >
             View Documentation
           </Button>
         </div>
       </div>

       <div className="mt-8 pt-6 border-t text-center">
         <p className="text-sm text-gray-500">
           Having issues with your subscription?{' '}
           <Button
             variant="link"
             className="p-0 h-auto"
             onClick={() => navigate('/support')}
           >
             Contact Support
           </Button>
         </p>
       </div>
     </div>
   </div>
 );
};

export default PaymentSuccess;