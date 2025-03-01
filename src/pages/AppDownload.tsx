
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const AppDownload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If no user is logged in, redirect to home
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md p-6 space-y-8 bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/0662fd11-2030-457c-97dd-b8529e27cfce.png" 
              alt="GiftWave" 
              className="h-24 w-24" 
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
                const fallbackIcon = document.createElement('div');
                fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
                e.currentTarget.parentNode.appendChild(fallbackIcon.firstChild);
              }} 
            />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">
            Download GiftWave
          </h1>
          
          <p className="text-gray-600">
            Get the GiftWave app to access your wallet and send beautiful gifts to your loved ones
          </p>

          <div className="flex flex-col gap-4 mt-8">
            <Button 
              className="w-full bg-black text-white hover:bg-gray-900" 
              onClick={() => window.open('https://apps.apple.com/app/giftwave', '_blank')}
            >
              Download on the App Store
            </Button>
            
            <Button 
              className="w-full bg-black text-white hover:bg-gray-900" 
              onClick={() => window.open('https://play.google.com/store/apps/details?id=app.giftwave', '_blank')}
            >
              Get it on Google Play
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AppDownload;
