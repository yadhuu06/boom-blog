
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllUsers, deleteUser } from '../../../api/userApi';
import { getAllPosts, deletePost } from '../../../api/postApi';
import { Ban, X,Trash2  } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [blockingPostId, setBlockingPostId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
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
    if (window.confirm('Are you sure you want to delete this user?')) {
      setDeletingUserId(userId);
      try {
        await deleteUser(userId, token);
        setUsers(users.filter((u) => u.id !== userId));
      } catch (err) {
        console.error('Failed to delete user:', err);
      } finally {
        setDeletingUserId(null);
      }
    }
  };

  const handleBlockPost = async (postId) => {
    if (window.confirm('Are you sure you want to block this post?')) {
      setBlockingPostId(postId);
      try {
        console.log(`Blocking post with ID: ${postId}`);
      } catch (err) {
        console.error('Failed to block post:', err);
      } finally {
        setBlockingPostId(null);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const renderContent = () => {
    if (activeTab === 'users') {
      return users.length === 0 ? (
        <p className="text-gray-400 text-sm sm:text-base text-center">No users found.</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between bg-gray-900/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-cyan-500/20 min-h-[80px] sm:min-h-[100px]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-gray-200">{user.username} ({user.email})</p>
                <div className="flex space-x-2 mt-1">
                  <span className="text-xs sm:text-sm text-green-400">{user.is_active ? 'Active' : 'Inactive'}</span>
                  <span className="text-xs sm:text-sm text-yellow-400">{user.is_admin ? 'Admin' : 'User'}</span>
                </div>
              </div>
              <motion.button
                onClick={() => handleDeleteUser(user.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 sm:p-2 rounded-full bg-red-600/50 hover:bg-red-700/50 border border-red-500/30 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deletingUserId === user.id}
              >
                {deletingUserId === user.id ? (
                  <span className="w-4 h-4 sm:w-5 h-5 animate-pulse">...</span>
                ) : (
                  <Trash2 className="w-4 h-4 sm:w-5 h-5" />
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      );
    } else {
      return posts.length === 0 ? (
        <p className="text-gray-400 text-sm sm:text-base text-center">No posts found.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between bg-gray-900/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-cyan-500/20 min-h-[80px] sm:min-h-[100px] cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-gray-200 whitespace-pre-wrap">{post.title} by {post.author.username}</p>
              </div>
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt="Post Thumbnail"
                  className="w-12 h-12 sm:w-16 h-16 rounded-md object-cover ml-2"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center text-gray-400 text-xs ml-2">
                  No Image
                </div>
              )}
              <motion.button
                onClick={(e) => { e.stopPropagation(); handleBlockPost(post.id); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 sm:p-2 rounded-full bg-yellow-600/50 hover:bg-yellow-700/50 border border-yellow-500/30 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={blockingPostId === post.id}
              >
                {blockingPostId === post.id ? (
                  <span className="w-4 h-4 sm:w-5 h-5 animate-pulse">...</span>
                ) : (
                  <Ban className="w-4 h-4 sm:w-5 h-5" />
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-cyan-900 py-4 px-2 sm:px-4 lg:px-8 flex justify-center">
      <div className="w-full bg-gray-800/60 backdrop-blur-md rounded-xl shadow-xl border border-cyan-500/20 p-3 sm:p-4">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-xl sm:text-2xl font-bold text-cyan-300 mb-4 text-center"
        >
          Admin Dashboard
        </motion.h1>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'users' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'} transition-all duration-200`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'posts' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'} transition-all duration-200`}
          >
            Posts
          </button>
        </div>
        {renderContent()}
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ y: 50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.9 }}
              className="bg-gray-800/70 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-cyan-500/20 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl text-cyan-300 font-bold">Post Details</h2>
                <motion.button
                  onClick={handleCloseModal}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 sm:p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white"
                >
                  <X className="w-4 h-4 sm:w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-gray-200 text-sm sm:text-base mb-2"><strong>Title:</strong> {selectedPost.title}</p>
              <p className="text-gray-200 text-sm sm:text-base mb-2"><strong>Content:</strong> {selectedPost.content}</p>
              <p className="text-gray-200 text-sm sm:text-base mb-2"><strong>Author:</strong> {selectedPost.author.username}</p>
              <p className="text-gray-200 text-sm sm:text-base mb-2"><strong>Created:</strong> {new Date(selectedPost.created_at).toLocaleString()}</p>
              <p className="text-gray-200 text-sm sm:text-base mb-2"><strong>Updated:</strong> {new Date(selectedPost.updated_at).toLocaleString()}</p>
              <p className="text-gray-200 text-sm sm:text-base mb-2"><strong>Views:</strong> {selectedPost.view_count}</p>
              <p className="text-gray-200 text-sm sm:text-base mb-2"><strong>Likes:</strong> {selectedPost.like_count}</p>
              {selectedPost.image_url ? (
                <img
                  src={selectedPost.image_url}
                  alt="Post Image"
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
              ) : (
                <p className="text-gray-400 text-sm">No image available.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
