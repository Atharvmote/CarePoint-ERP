import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

function Topbar() {
  const { user } = useAuth();
  
  return <Navbar user={user} />;
}

export default Topbar;
