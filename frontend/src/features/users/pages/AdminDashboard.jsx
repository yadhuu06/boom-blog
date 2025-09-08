import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser, toggleUserActive } from '../../../api/userApi';
import { getAllPostsAdmin, togglePostActive } from '../../../api/postApi';
import { getAllCommentsAdmin, toggleCommentApprove, deleteComment, getCommentsForPost } from '../../../api/commentApi';
import { Ban, X, Trash2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [postComments, setPostComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [togglingPostId, setTogglingPostId] = useState(null);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [togglingCommentId, setTogglingCommentId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [userPage, setUserPage] = useState(0);
  const [postPage, setPostPage] = useState(0);
  const [commentPage, setCommentPage] = useState(0);
  const [postCommentPage, setPostCommentPage] = useState(0);
  const limit = 10;
  const commentLimit = 5;
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.is_admin) {
      toast.error('Admin access required.');
      navigate('/login');
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        toast.loading('Fetching data...', { id: 'fetch-data' });
        if (activeTab === 'users') {
          const usersData = await getAllUsers(userPage * limit, limit);
          if (isMounted) setUsers(usersData.users || []);
        } else if (activeTab === 'posts') {
          const postsData = await getAllPostsAdmin(postPage * limit, limit);
          if (isMounted) setPosts(postsData.posts || []);
        } else if (activeTab === 'comments') {
          const commentsData = await getAllCommentsAdmin(commentPage * limit, limit);
          if (isMounted) setComments(commentsData.comments || []);
        }
        toast.dismiss('fetch-data');
      } catch (err) {
        if (isMounted) {
          toast.error('Failed to fetch data.', { id: 'fetch-data' });
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [activeTab, userPage, postPage, commentPage, token, user, navigate]);

  const fetchPostComments = async (postId) => {
    try {
      toast.loading('Fetching comments...', { id: 'fetch-comments' });
      const commentsData = await getCommentsForPost(postId, postCommentPage * commentLimit, commentLimit);
      setPostComments(commentsData.comments || []);
      toast.dismiss('fetch-comments');
    } catch (err) {
      toast.error('Failed to fetch comments.', { id: 'fetch-comments' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setDeletingUserId(userId);
      try {
        toast.loading('Deleting user...', { id: 'delete-user' });
        await deleteUser(userId);
        setUsers(users.filter((u) => u.id !== userId));
        toast.success('User deleted!', { id: 'delete-user' });
      } catch (err) {
        toast.error('Failed to delete user.', { id: 'delete-user' });
      } finally {
        setDeletingUserId(null);
      }
    }
  };

  const handleToggleUserActive = async (userId) => {
    setTogglingUserId(userId);
    try {
      toast.loading('Toggling user status...', { id: 'toggle-user' });
      const updatedUser = await toggleUserActive(userId);
      setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
      toast.success(`User ${updatedUser.is_active ? 'unblocked' : 'blocked'}!`, { id: 'toggle-user' });
    } catch (err) {
      toast.error('Failed to toggle user status.', { id: 'toggle-user' });
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleTogglePostActive = async (postId) => {
    setTogglingPostId(postId);
    try {
      toast.loading('Toggling post status...', { id: 'toggle-post' });
      const updatedPost = await togglePostActive(postId);
      setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(updatedPost);
      }
      toast.success(`Post ${updatedPost.is_active ? 'unblocked' : 'blocked'}!`, { id: 'toggle-post' });
    } catch (err) {
      toast.error('Failed to toggle post status.', { id: 'toggle-post' });
    } finally {
      setTogglingPostId(null);
    }
  };

  const handleToggleCommentApprove = async (commentId) => {
    setTogglingCommentId(commentId);
    try {
      toast.loading('Toggling comment approval...', { id: 'toggle-comment' });
      const updatedComment = await toggleCommentApprove(commentId);
      setComments(comments.map((c) => (c.id === commentId ? updatedComment : c)));
      setPostComments(postComments.map((c) => (c.id === commentId ? updatedComment : c)));
      toast.success(`Comment ${updatedComment.is_approved ? 'approved' : 'unapproved'}!`, { id: 'toggle-comment' });
    } catch (err) {
      toast.error('Failed to toggle comment approval.', { id: 'toggle-comment' });
    } finally {
      setTogglingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setDeletingCommentId(commentId);
      try {
        toast.loading('Deleting comment...', { id: 'delete-comment' });
        await deleteComment(commentId);
        setComments(comments.filter((c) => c.id !== commentId));
        setPostComments(postComments.filter((c) => c.id !== commentId));
        toast.success('Comment deleted!', { id: 'delete-comment' });
      } catch (err) {
        toast.error('Failed to delete comment.', { id: 'delete-comment' });
      } finally {
        setDeletingCommentId(null);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setSelectedPostForComments(null);
    setPostComments([]);
    setPostCommentPage(0);
  };

  const handleShowComments = (post) => {
    setSelectedPostForComments(post);
    fetchPostComments(post.id);
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
                  <span className="text-xs sm:text-sm text-green-400">{user.is_active ? 'Active' : 'Blocked'}</span>
                  <span className="text-xs sm:text-sm text-yellow-400">{user.is_admin ? 'Admin' : 'User'}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => handleToggleUserActive(user.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 sm:p-2 rounded-full border transition-all duration-200 ${
                    user.is_active
                      ? 'bg-yellow-600/50 hover:bg-yellow-700/50 border-yellow-500/30'
                      : 'bg-green-600/50 hover:bg-green-700/50 border-green-500/30'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={togglingUserId === user.id}
                >
                  {togglingUserId === user.id ? (
                    <span className="w-4 h-4 sm:w-5 h-5 animate-pulse">...</span>
                  ) : (
                    <Ban className="w-4 h-4 sm:w-5 h-5" />
                  )}
                </motion.button>
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
              </div>
            </motion.div>
          ))}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setUserPage((prev) => Math.max(prev - 1, 0))}
              disabled={userPage === 0}
              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setUserPage((prev) => prev + 1)}
              disabled={users.length < limit}
              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'posts') {
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
              className="flex items-center justify-between bg-gray-900/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-cyan-500/20 min-h-[80px] sm:min-h-[100px]"
            >
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedPost(post)}>
                <p className="text-sm sm:text-base text-gray-200 whitespace-pre-wrap">{post.title} by {post.author?.username || 'Unknown'}</p>
                <span className="text-xs sm:text-sm text-green-400">{post.is_active ? 'Active' : 'Blocked'}</span>
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
              <div className="flex space-x-2">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowComments(post);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 sm:p-2 rounded-full bg-blue-600/50 hover:bg-blue-700/50 border border-blue-500/30 text-white"
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePostActive(post.id);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 sm:p-2 rounded-full border transition-all duration-200 ${
                    post.is_active
                      ? 'bg-yellow-600/50 hover:bg-yellow-700/50 border-yellow-500/30'
                      : 'bg-green-600/50 hover:bg-green-700/50 border-green-500/30'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={togglingPostId === post.id}
                >
                  {togglingPostId === post.id ? (
                    <span className="w-4 h-4 sm:w-5 h-5 animate-pulse">...</span>
                  ) : (
                    <Ban className="w-4 h-4 sm:w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setPostPage((prev) => Math.max(prev - 1, 0))}
              disabled={postPage === 0}
              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPostPage((prev) => prev + 1)}
              disabled={posts.length < limit}
              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'comments') {
      return comments.length === 0 ? (
        <p className="text-gray-400 text-sm sm:text-base text-center">No comments found.</p>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between bg-gray-900/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-cyan-500/20 min-h-[80px] sm:min-h-[100px]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-gray-200 whitespace-pre-wrap">{comment.content} by {comment.user?.username || 'Unknown'}</p>
                <span className="text-xs sm:text-sm text-green-400">{comment.is_approved ? 'Approved' : 'Unapproved'}</span>
                <p className="text-xs sm:text-sm text-gray-400">Post ID: {comment.post_id}</p>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => handleToggleCommentApprove(comment.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 sm:p-2 rounded-full border transition-all duration-200 ${
                    comment.is_approved
                      ? 'bg-yellow-600/50 hover:bg-yellow-700/50 border-yellow-500/30'
                      : 'bg-green-600/50 hover:bg-green-700/50 border-green-500/30'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={togglingCommentId === comment.id}
                >
                  {togglingCommentId === comment.id ? (
                    <span className="w-4 h-4 sm:w-5 h-5 animate-pulse">...</span>
                  ) : (
                    <Ban className="w-4 h-4 sm:w-5 h-5" />
                  )}
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteComment(comment.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 sm:p-2 rounded-full bg-red-600/50 hover:bg-red-700/50 border border-red-500/30 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={deletingCommentId === comment.id}
                >
                  {deletingCommentId === comment.id ? (
                    <span className="w-4 h-4 sm:w-5 h-5 animate-pulse">...</span>
                  ) : (
                    <Trash2 className="w-4 h-4 sm:w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCommentPage((prev) => Math.max(prev - 1, 0))}
              disabled={commentPage === 0}
              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCommentPage((prev) => prev + 1)}
              disabled={comments.length < limit}
              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-cyan-900 py-4 px-2 sm:px-4 lg:px-8 flex justify-center">
      <div className="w-full max-w-6xl bg-gray-800/60 backdrop-blur-md rounded-xl shadow-xl border border-cyan-500/20 p-3 sm:p-4">
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
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'comments' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'} transition-all duration-200`}
          >
            Comments
          </button>
        </div>
        {renderContent()}
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className="bg-gray-800/90 backdrop-blur-md p-6 sm:p-8 rounded-xl border border-cyan-500/30 w-full h-full sm:h-auto sm:max-w-4xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl text-cyan-300 font-bold">{selectedPost.title}</h2>
                <motion.button
                  onClick={handleCloseModal}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <div className="space-y-4">
                {selectedPost.image_url && (
                  <img
                    src={selectedPost.image_url}
                    alt="Post Image"
                    className="w-full h-64 sm:h-96 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-gray-200 text-base sm:text-lg whitespace-pre-wrap">{selectedPost.content}</p>
                <p className="text-gray-300 text-sm sm:text-base"><strong>Author:</strong> {selectedPost.author?.username || 'Unknown'}</p>
                <p className="text-gray-300 text-sm sm:text-base"><strong>Created:</strong> {new Date(selectedPost.created_at).toLocaleString()}</p>
                <p className="text-gray-300 text-sm sm:text-base"><strong>Updated:</strong> {new Date(selectedPost.updated_at).toLocaleString()}</p>
                <p className="text-gray-300 text-sm sm:text-base"><strong>Views:</strong> {selectedPost.view_count}</p>
                <p className="text-gray-300 text-sm sm:text-base"><strong>Likes:</strong> {selectedPost.like_count}</p>
                <p className="text-gray-300 text-sm sm:text-base"><strong>Status:</strong> {selectedPost.is_active ? 'Active' : 'Blocked'}</p>
                <motion.button
                  onClick={() => handleTogglePostActive(selectedPost.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg ${
                    selectedPost.is_active
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={togglingPostId === selectedPost.id}
                >
                  {togglingPostId === selectedPost.id
                    ? 'Processing...'
                    : selectedPost.is_active
                    ? 'Block Post'
                    : 'Unblock Post'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {selectedPostForComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className="bg-gray-800/90 backdrop-blur-md p-6 sm:p-8 rounded-xl border border-cyan-500/30 w-full h-full sm:h-auto sm:max-w-4xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl text-cyan-300 font-bold">Comments for "{selectedPostForComments.title}"</h2>
                <motion.button
                  onClick={handleCloseModal}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <div className="space-y-2">
                {postComments.length === 0 ? (
                  <p className="text-gray-400 text-sm sm:text-base text-center">No comments found.</p>
                ) : (
                  postComments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center justify-between bg-gray-900/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-cyan-500/20 min-h-[80px] sm:min-h-[100px]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base text-gray-200 whitespace-pre-wrap">{comment.content} by {comment.user?.username || 'Unknown'}</p>
                        <span className="text-xs sm:text-sm text-green-400">{comment.is_approved ? 'Approved' : 'Unapproved'}</span>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleToggleCommentApprove(comment.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-1.5 sm:p-2 rounded-full border transition-all duration-200 ${
                            comment.is_approved
                              ? 'bg-yellow-600/50 hover:bg-yellow-700/50 border-yellow-500/30'
                              : 'bg-green-600/50 hover:bg-green-700/50 border-green-500/30'
                          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                          disabled={togglingCommentId === comment.id}
                        >
                          {togglingCommentId === comment.id ? (
                            <span className="w-4 h-4 sm:w-5 h-5 animate-pulse">...</span>
                          ) : (
                            <Ban className="w-4 h-4 sm:w-5 h-5" />
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteComment(comment.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 sm:p-2 rounded-full bg-red-600/50 hover:bg-red-700/50 border border-red-500/30 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={deletingCommentId === comment.id}
                        >
                          {deletingCommentId === comment.id ? (
                            <span className="w-4 h-4 sm:w-5 h-5 animate-pulse">...</span>
                          ) : (
                            <Trash2 className="w-4 h-4 sm:w-5 h-5" />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setPostCommentPage((prev) => Math.max(prev - 1, 0))}
                    disabled={postCommentPage === 0}
                    className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      setPostCommentPage((prev) => prev + 1);
                      fetchPostComments(selectedPostForComments.id);
                    }}
                    disabled={postComments.length < commentLimit}
                    className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;