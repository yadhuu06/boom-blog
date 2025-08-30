import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllUsers, deleteUser } from '../../../api/userApi';
import { getAllPosts, deletePost } from '../../../api/postApi';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getAllUsers(token);
      setUsers(usersData);
      const postsData = await getAllPosts();
      setPosts(postsData);
    };
    fetchData();
  }, [token]);

  const handleDeleteUser = async (userId) => {
    await deleteUser(userId, token);
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleDeletePost = async (postId) => {
    await deletePost(postId, token);
    setPosts(posts.filter((p) => p.id !== postId));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <h2 className="text-xl mb-2">Users</h2>
      {users.map((user) => (
        <div key={user.id} className="flex justify-between border p-2 mb-2">
          <span>{user.username} ({user.email})</span>
          <button onClick={() => handleDeleteUser(user.id)} className="text-red-600">Delete</button>
        </div>
      ))}
      <h2 className="text-xl mb-2 mt-4">Posts</h2>
      {posts.map((post) => (
        <div key={post.id} className="flex justify-between border p-2 mb-2">
          <span>{post.title} by {post.author.username}</span>
          <button onClick={() => handleDeletePost(post.id)} className="text-red-600">Delete</button>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;