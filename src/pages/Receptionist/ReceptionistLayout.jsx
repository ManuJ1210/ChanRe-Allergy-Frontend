import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import { useState } from 'react';

export default function ReceptionistLayout({ children }) {
  const storedUser = localStorage.getItem('user');
  const userInfo = useSelector((state) => state.user?.userInfo) || (storedUser ? JSON.parse(storedUser) : null);
  const receptionistUserInfo = userInfo && userInfo.role === 'receptionist' ? userInfo : { role: 'receptionist' };
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      </div>
    </div>
  );
} 