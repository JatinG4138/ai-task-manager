// import { Link } from 'react-router-dom';

// export const Header = () => {

//   const handleLogin = () => {
//     window.location.href = 'http://localhost:8000/auth/google';
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     setUser(null);
//   };

//   return (
//             <header>
//               <h1>AI Task Manager</h1>
//               <nav>
//                 <Link to="/">Home</Link>
//                 {user ? (
//                   <>
//                     <Link to="/dashboard">Dashboard</Link>
//                     <button onClick={handleLogout}>Logout</button>
//                   </>
//                 ) : (
//                   <button onClick={handleLogin}>Login with Google</button>
//                 )}
//               </nav>
//             </header>
//   );
// }