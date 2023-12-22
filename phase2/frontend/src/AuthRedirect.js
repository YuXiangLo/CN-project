import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userToken = Cookies.get('userToken');
    if (userToken) {
      navigate('/main');
    } else {
      navigate('/');
    }
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default AuthRedirect;

