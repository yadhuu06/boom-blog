import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getPostById, toggleLike, deletePost } from '../../../api/postApi';
import { getCommentsForPost, createComment, updateComment, deleteComment, toggleCommentApprove } from '../../../api/commentApi';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, Edit2, Trash2, Send, User, MessageCircle, Eye, X, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const commentsPerPage = 5;
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const isAdmin = user?.is_admin || false;

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        toast.loading('Loading post...', { id: 'fetch-data' });
        const [postData, commentsData] = await Promise.all([
          getPostById(id),
          getCommentsForPost(id, 0, commentsPerPage),
        ]);

        if (isMounted) {
          setPost(postData);
          setComments(isAdmin ? commentsData.comments : commentsData.comments.filter(c => c.is_approved));
          setTotalComments(commentsData.total || 0);

          if (token && postData) {
            const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts')) || [];
            if (!viewedPosts.includes(id)) {
              localStorage.setItem('viewedPosts', JSON.stringify([...viewedPosts, id]));
            }
          }
        }
        toast.dismiss('fetch-data');
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error('Post not found or inactive.', { id: 'fetch-data' });
        } else {
          toast.error('Failed to load post.', { id: 'fetch-data' });
        }
        navigate('/');
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id, token, isAdmin, navigate]);

  const handleLike = async () => {
    if (!token) {
      toast.error('Please log in to like posts.');
      navigate('/login');
      return;
    }
    if (!user.is_active) {
      toast.error('Your account is blocked.');
      return;
    }
    try {
      toast.loading(post.is_liked ? 'Unliking...' : 'Liking...', { id: 'like-post' });
      const { like_count, is_liked } = await toggleLike(id);
      setPost((prev) => prev ? { ...prev, like_count, is_liked } : prev);
      toast.success(post.is_liked ? 'Unliked!' : 'Liked!', { id: 'like-post' });
    } catch (err) {
      toast.error(err.response?.status === 403 ? 'Your account is blocked.' : 'Failed to toggle like.', { id: 'like-post' });
    }
  };

  const handleDeletePost = async () => {
    if (!user.is_active) {
      toast.error('Your account is blocked.');
      return;
    }
    try {
      toast.loading('Deleting post...', { id: 'delete-post' });
      await deletePost(id);
      toast.success('Post deleted!', { id: 'delete-post' });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.status === 403 ? 'Not authorized or account blocked.' : 'Failed to delete post.', { id: 'delete-post' });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please log in to comment.');
      navigate('/login');
      return;
    }
    if (!user.is_active) {
      toast.error('Your account is blocked.');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty!');
      return;
    }
    try {
      toast.loading('Posting comment...', { id: 'add-comment' });
      const added = await createComment(id, { content: newComment });
      setComments((prev) => (isAdmin || added.is_approved) ? [...prev, added] : prev);
      setTotalComments((prev) => prev + 1);
      setNewComment('');
      setShowComments(true);
      toast.success('Comment posted!', { id: 'add-comment' });
    } catch (err) {
      toast.error(err.response?.status === 403 ? 'Your account is blocked.' : 'Failed to post comment.', { id: 'add-comment' });
    }
  };

  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
    toast.dismiss();
  };

  const handleUpdate = async (commentId) => {
    if (!user.is_active) {
      toast.error('Your account is blocked.');
      return;
    }
    if (!editedContent.trim()) {
      toast.error('Comment cannot be empty!');
      return;
    }
    try {
      toast.loading('Updating comment...', { id: 'update-comment' });
      const updated = await updateComment(commentId, { content: editedContent });
      setComments(comments.map((c) => (c.id === commentId ? updated : c)));
      setEditingCommentId(null);
      toast.success('Comment updated!', { id: 'update-comment' });
    } catch (err) {
      toast.error(err.response?.status === 403 ? 'Not authorized or account blocked.' : 'Failed to update comment.', { id: 'update-comment' });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user.is_active) {
      toast.error('Your account is blocked.');
      return;
    }
    try {
      toast.loading('Deleting comment...', { id: 'delete-comment' });
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      setTotalComments((prev) => prev - 1);
      toast.success('Comment deleted!', { id: 'delete-comment' });
    } catch (err) {
      toast.error(err.response?.status === 403 ? 'Not authorized or account blocked.' : 'Failed to delete comment.', { id: 'delete-comment' });
    }
  };

  const handleToggleCommentApprove = async (commentId) => {
    if (!isAdmin) {
      toast.error('Admin access required.');
      return;
    }
    try {
      toast.loading('Toggling comment approval...', { id: 'toggle-comment' });
      const updated = await toggleCommentApprove(commentId);
      setComments(comments.map((c) => (c.id === commentId ? updated : c)));
      toast.success(updated.is_approved ? 'Comment approved!' : 'Comment unapproved!', { id: 'toggle-comment' });
    } catch (err) {
      toast.error('Failed to toggle comment approval.', { id: 'toggle-comment' });
    }
  };

  const loadMoreComments = async () => {
    try {
      const nextComments = await getCommentsForPost(id, commentPage * commentsPerPage, commentsPerPage);
      setComments((prev) => [...prev, ...(isAdmin ? nextComments.comments : nextComments.comments.filter(c => c.is_approved))]);
      setCommentPage((prev) => prev + 1);
    } catch (err) {
      toast.error('Failed to load more comments.');
    }
  };

  if (!post) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-cyan-900 flex items-center justify-center text-cyan-300 text-lg animate-pulse pt-16"
    >
      Loading...
    </motion.div>
  );

  const isAuthor = user && post.author_id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900 pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-2xl border border-cyan-500/20 overflow-hidden">
          {/* Post Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="p-4 sm:p-6 border-b border-cyan-500/20"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-300 mb-4 break-words">
              {post.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-none">
                    {post.author.username}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>{post.view_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className={`w-4 h-4 ${post.is_liked ? 'text-red-400 fill-current' : 'text-cyan-400'}`} />
                  <span>{post.like_count}</span>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Post Image */}
          {post.image_url && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative"
            >
              <img
                src={post.image_url}
                alt="Post"
                className="w-full object-cover max-h-96 sm:max-h-[500px]"
              />
            </motion.div>
          )}
          {/* Post Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="p-4 sm:p-6"
          >
            <p className="text-gray-200 text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </motion.div>
          {/* Action Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="px-4 sm:px-6 py-4 border-t border-cyan-500/20 bg-gray-900/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={handleLike}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                    post.is_liked
                      ? 'bg-red-500/20 border-red-400 text-red-400'
                      : 'bg-gray-700/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium hidden sm:inline">
                    {post.is_liked ? 'Liked' : 'Like'}
                  </span>
                </motion.button>
                <motion.button
                  onClick={() => setShowComments(!showComments)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-700/50 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 relative"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Comments</span>
                  {totalComments > 0 && (
                    <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {totalComments}
                    </span>
                  )}
                </motion.button>
              </div>
              {(isAuthor || isAdmin) && (
                <div className="flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={`/posts/${id}/edit`}
                      className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-400 text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">Edit</span>
                    </Link>
                  </motion.div>
                  <motion.button
                    onClick={handleDeletePost}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-red-600/20 border border-red-400 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Delete</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
          {/* Comments Section */}
          {showComments && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="border-t border-cyan-500/20 bg-gray-900/20"
            >
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">
                  Comments ({totalComments})
                </h3>
                {comments.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5), ease: 'easeOut' }}
                        className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/10"
                      >
                        {editingCommentId === comment.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none min-h-[100px]"
                              placeholder="Edit your comment..."
                              required
                            />
                            <div className="flex items-center space-x-2">
                              <motion.button
                                onClick={() => handleUpdate(comment.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-all duration-200"
                              >
                                <Send className="w-4 h-4" />
                                <span className="text-sm">Update</span>
                              </motion.button>
                              <motion.button
                                onClick={() => setEditingCommentId(null)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-all duration-200"
                              >
                                <X className="w-4 h-4" />
                                <span className="text-sm">Cancel</span>
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words mb-3">
                              {comment.content}
                              {!comment.is_approved && isAdmin && (
                                <span className="text-yellow-400 text-xs ml-2">(Unapproved)</span>
                              )}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-gray-400 text-xs sm:text-sm">
                                <span className="font-medium text-cyan-400">
                                  {comment.user.username}
                                </span>
                                <span>•</span>
                                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                              </div>
                              {(user && (comment.user_id === user.id || isAdmin)) && (
                                <div className="flex items-center space-x-2">
                                  {user && comment.user_id === user.id && (
                                    <motion.button
                                      onClick={() => startEdit(comment)}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="p-2 rounded-full text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-200"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                  <motion.button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                  {isAdmin && (
                                    <motion.button
                                      onClick={() => handleToggleCommentApprove(comment.id)}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className={`p-2 rounded-full transition-all duration-200 ${
                                        comment.is_approved
                                          ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10'
                                          : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                                      }`}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                    {comments.length < totalComments && (
                      <motion.button
                        onClick={loadMoreComments}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/5 transition-all duration-200"
                      >
                        Load More Comments ({totalComments - comments.length} remaining)
                      </motion.button>
                    )}
                  </div>
                )}
                {token && user.is_active ? (
                  <motion.form
                    onSubmit={handleAddComment}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="space-y-3"
                  >
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-4 rounded-lg bg-gray-700 text-white border border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none min-h-[100px]"
                      required
                    />
                    <div className="flex justify-end">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-all duration-200"
                      >
                        <Send className="w-4 h-4" />
                        <span>Post Comment</span>
                      </motion.button>
                    </div>
                  </motion.form>
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    {token ? 'Your account is blocked.' : (
                      <Link to="/login" className="text-cyan-400 hover:underline">Log in</Link>
                    )} to comment.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;