import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useNavigate } from "react-router-dom";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <Sidebar />
      
      <div className="ml-64 transition-all duration-300">
        <Topbar />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
