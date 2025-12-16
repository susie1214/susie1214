import '@/styles/iphone.css';
import { useEffect } from 'react';
import IPhoneFrame from '@/components/IPhoneFrame';
import ChatContainer from '@/components/ChatContainer';

function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-poly-blue-light via-white to-poly-blue-light flex items-center justify-center p-4">
      <IPhoneFrame>
        <ChatContainer />
      </IPhoneFrame>
    </div>
  );
}

export default App;
