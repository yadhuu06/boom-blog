import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-black p-4 shadow-2xl sticky top-0 z-50 border-b border-cyan-500/20">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-extrabold text-cyan-300 tracking-tight">Boom</Link>
        <div className="flex items-center space-x-4">
          {token ? (
            <>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} whileHover={{ scale: 1.05 }}>
                <Link to="/posts/new" className="px-5 py-2 rounded-full bg-cyan-600/50 text-cyan-100 hover:bg-cyan-600 transition-all duration-300 text-sm font-semibold border border-cyan-500/30">
                  New Post
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }} whileHover={{ scale: 1.05 }}>
                <Link to="/users" className="px-5 py-2 rounded-full bg-cyan-600/50 text-cyan-100 hover:bg-cyan-600 transition-all duration-300 text-sm font-semibold border border-cyan-500/30">
                  Users
                </Link>
              </motion.div>
              {user && user.is_admin && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4 }} whileHover={{ scale: 1.05 }}>
                  <Link to="/admin" className="px-5 py-2 rounded-full bg-cyan-600/50 text-cyan-100 hover:bg-cyan-600 transition-all duration-300 text-sm font-semibold border border-cyan-500/30">
                    Admin
                  </Link>
                </motion.div>
              )}
              <motion.button 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 1, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleLogout} 
                className="px-5 py-2 rounded-full bg-gray-700/50 text-cyan-100 hover:bg-gray-600 transition-all duration-300 text-sm font-semibold border border-cyan-500/30"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} whileHover={{ scale: 1.05 }}>
              <Link to="/login" className="px-5 py-2 rounded-full bg-cyan-600/50 text-cyan-100 hover:bg-cyan-600 transition-all duration-300 text-sm font-semibold border border-cyan-500/30">
                Sign In
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;