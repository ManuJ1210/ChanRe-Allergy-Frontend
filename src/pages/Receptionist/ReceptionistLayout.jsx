import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import PendingBillsNotification from '../../components/PendingBillsNotification';
import { usePendingBillsNotification } from '../../hooks/usePendingBillsNotification';
import { useSelector } from 'react-redux';
import { useState } from 'react';

export default function ReceptionistLayout({ children }) {
  const userInfo = useSelector((state) => state.user?.userInfo);
  const receptionistUserInfo = userInfo && userInfo.role === 'receptionist' ? userInfo : { role: 'receptionist' };
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { showNotification, closeNotification } = usePendingBillsNotification();

  return (
    <div className="flex min-h-screen">
      <Sidebar userInfo={receptionistUserInfo} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onHamburgerClick={() => setDrawerOpen(true)} />
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden cursor-pointer"
            style={{ background: 'transparent' }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <main className="flex-1 bg-gray-50 pt-16">{children}</main>
        
        {/* Pending Bills Notification */}
        <PendingBillsNotification 
          isOpen={showNotification} 
          onClose={closeNotification} 
        />
      </div>
    </div>
  );
} 