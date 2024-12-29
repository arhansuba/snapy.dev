// frontend/src/pages/payment/Cancel.tsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const PaymentCancel: React.FC = () => {
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const reason = searchParams.get('reason');

 return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50">
     <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
       <div className="text-center">
         <XCircle className="h-12 w-12 text-red-500 mx-auto" />
         <h2 className="text-2xl font-semibold mt-4">
           Payment Cancelled
         </h2>
         <p className="text-gray-500 mt-2">
           {reason ? 
             `Your payment was cancelled: ${reason}` : 
             'Your payment was cancelled. No charges were made to your account.'
           }
         </p>
       </div>

       <div className="mt-8 space-y-4">
         <Button
           className="w-full"
           onClick={() => navigate('/pricing')}
         >
           <ArrowLeft className="mr-2 h-4 w-4" />
           Return to Pricing
         </Button>

         <div className="text-center">
           <Button
             variant="ghost"
             onClick={() => navigate('/support')}
             className="inline-flex items-center"
           >
             <HelpCircle className="mr-2 h-4 w-4" />
             Need Help?
           </Button>
         </div>
       </div>

       <div className="mt-8 pt-6 border-t">
         <div className="bg-amber-50 p-4 rounded-lg">
           <h3 className="font-medium text-amber-800 mb-2">
             Common reasons for payment cancellation:
           </h3>
           <ul className="text-sm text-amber-700 space-y-2">
             <li>• Insufficient funds</li>
             <li>• Card declined by bank</li>
             <li>• Incorrect card information</li>
             <li>• Transaction timeout</li>
           </ul>
         </div>
       </div>

       <div className="mt-6 text-center">
         <p className="text-sm text-gray-500">
           Still want to upgrade? 
           <Button
             variant="link"
             className="ml-1"
             onClick={() => navigate('/contact-sales')}
           >
             Talk to our sales team
           </Button>
         </p>
       </div>
     </div>
   </div>
 );
};

export default PaymentCancel;