import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '../services/config';

export const AuthCallback = ({ setUser }) => {
  const [error, setError] = useState(null);
  const location = useLocation();
  
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      try {
        localStorage.setItem('accessToken', token);
        
        const response = await fetch(`${config.apiUrl}user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log(userData, '------------------userdetails')
          localStorage.setItem('userDetails', JSON.stringify(userData));
          setUser(userData.user);
          
          window.location.href = '/';
        } else {
          console.error('Failed to fetch user data:', response.status);
          if (response.status === 422) {
            setError('API validation error. Check if your token is being sent correctly.');
          } else {
            const errorData = await response.json();
            setError(errorData.detail || `Failed to fetch user data (Status: ${response.status})`);
          }
        }
      } catch (error) {
        console.error('authentication Error', error);
        setError('An error occurred during authentication');
      }
    };

    handleCallback();
  }, [location, setUser]);

  if (error) {
    return (
      <div className="auth-callback">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <Link to="/">Go back to home</Link>
      </div>
    );
  }

  return <div className="auth-callback"><h2>Authenticating...</h2></div>;
}


