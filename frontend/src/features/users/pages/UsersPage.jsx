import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from "../../../api/userApi";
import UserCard from "../components/UserCard";
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.is_admin) {
      toast.error('Admin access required.');
      navigate('/login');
      return;
    }

    let isMounted = true;

    const fetchUsers = async () => {
      try {
        toast.loading('Fetching users...', { id: 'fetch-users' });
        const data = await getAllUsers(0, 10); // Ensure token is handled by axios interceptor
        if (isMounted) {
          setUsers(data.users || []);
          toast.dismiss('fetch-users');
        }
      } catch (error) {
        if (isMounted) {
          toast.error('Failed to fetch users.', { id: 'fetch-users' });
        }
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
    return () => { isMounted = false; };
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-cyan-900 py-4 px-2 sm:px-4 lg:px-8 flex justify-center">
      <div className="w-full max-w-6xl bg-gray-800/60 backdrop-blur-md rounded-xl shadow-xl border border-cyan-500/20 p-3 sm:p-4">
        <h1 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-4 text-center">All Users</h1>
        {users.length === 0 ? (
          <p className="text-gray-400 text-sm sm:text-base text-center">No users found.</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;