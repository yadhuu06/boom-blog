import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getPostById, incrementView, toggleLike, deletePost } from '../../../api/postApi';
import { getCommentsForPost, addComment, updateComment, deleteComment } from '../../../api/commentApi';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, Edit2, Trash2, Send, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        toast.loading('Loading post...', { id: 'fetch-data' });
        const postData = await getPostById(id);
        setPost(postData);
        const commentsData = await getCommentsForPost(id);
        setComments(commentsData);
        toast.dismiss('fetch-data');
      } catch (err) {
        toast.error('Failed to load post.', { id: 'fetch-data' });
      }
    };

    const handleViewIncrement = async () => {
      if (token) {
        const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts')) || [];
        if (!viewedPosts.includes(id)) {
          try {
            const newViews = await incrementView(id, token);
            setPost((prev) => (prev ? { ...prev, views: newViews } : prev));
            localStorage.setItem('viewedPosts', JSON.stringify([...viewedPosts, id]));
          } catch (err) {}
        }
      }
    };

    fetchData();
    handleViewIncrement();
  }, [id, token]);

  const handleLike = async () => {
    try {
      toast.loading(post?.is_liked ? 'Unliking...' : 'Liking...', { id: 'like-post' });
      const newLikes = await toggleLike(id, token);
      setPost((prev) => (prev ? { ...prev, likes: newLikes, is_liked: !prev.is_liked } : prev));
      toast.success(post?.is_liked ? 'Unliked!' : 'Liked!', { id: 'like-post' });
    } catch (err) {
      toast.error('Failed to toggle like.', { id: 'like-post' });
    }
  };

  const handleDeletePost = async () => {
    try {
      toast.loading('Deleting post...', { id: 'delete-post' });
      await deletePost(id, token);
      toast.success('Post deleted!', { id: 'delete-post' });
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete post.', { id: 'delete-post' });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty!');
      return;
    }
    try {
      toast.loading('Posting comment...', { id: 'add-comment' });
      const added = await addComment(id, newComment, token);
      setComments([...comments, added]);
      setNewComment('');
      setShowComments(true); // Show comments after adding a new one
      toast.success('Comment posted!', { id: 'add-comment' });
    } catch (err) {
      toast.error('Failed to post comment.', { id: 'add-comment' });
    }
  };

  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
    toast.dismiss();
  };

  const handleUpdate = async (commentId) => {
    if (!editedContent.trim()) {
      toast.error('Comment cannot be empty!');
      return;
    }
    try {
      toast.loading('Updating comment...', { id: 'update-comment' });
      const updated = await updateComment(id, commentId, editedContent, token);
      setComments(comments.map((c) => (c.id === commentId ? updated : c)));
      setEditingCommentId(null);
      toast.success('Comment updated!', { id: 'update-comment' });
    } catch (err) {
      toast.error('Failed to update comment.', { id: 'update-comment' });
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      toast.loading('Deleting comment...', { id: 'delete-comment' });
      await deleteComment(id, commentId, token);
      setComments(comments.filter((c) => c.id !== commentId));
      toast.success('Comment deleted!', { id: 'delete-comment' });
    } catch (err) {
      toast.error('Failed to delete comment.', { id: 'delete-comment' });
    }
  };

  if (!post) return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-cyan-300 text-xl animate-pulse"
    >
      Loading...
    </motion.div>
  );

  const isAuthor = user && post.author_id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl font-extrabold text-cyan-300 mb-4 break-words">{post.title}</h1>
        </motion.div>
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex items-center justify-between text-gray-400 mb-6"
        >
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2 text-cyan-400" />
            <span className="truncate max-w-[200px]">{post.author.username} · {new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <span>Views: {post.views}  Likes: {post.likes?.like_count ?? 0}</span>
        </motion.div>
        {post.image_url && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <img src={post.image_url} alt="Post" className="w-full rounded-lg mb-6 object-cover max-h-96" />
          </motion.div>
        )}
        <motion.p 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-gray-300 text-lg mb-8 break-words"
        >
          {post.content}
        </motion.p>

        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex space-x-4 mb-8"
        >
          {token && (
            <motion.button
              onClick={handleLike}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-4 py-2 rounded-full text-white transition-all duration-300 ${
                post.is_liked ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Heart className="w-5 h-5 mr-2" />
              <button
  className={`flex items-center px-4 py-2 rounded-full text-white transition-all duration-300 ${
    post.likes?.is_liked ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-700 hover:bg-gray-600'
  }`}
>
  <Heart className="w-5 h-5 mr-2" />
  <span>{post.likes?.like_count ?? 0}</span>
</button>

              


            </motion.button>
          )}
          {isAuthor && (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={`/posts/${id}/edit`}
                  className="flex items-center px-4 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all duration-300"
                >
                  <Edit2 className="w-5 h-5 mr-2" />
                  Edit
                </Link>
              </motion.div>
              <motion.button
                onClick={handleDeletePost}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all duration-300"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete
              </motion.button>
            </>
          )}
        </motion.div>

        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center px-4 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-all duration-300 mb-6"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {showComments ? 'Hide Comments' : `Show Comments (${comments.length})`}
          </button>
        </motion.div>

        {showComments && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {comments.length === 0 ? (
              <p className="text-gray-400 mb-6">No comments yet.</p>
            ) : (
              <div className="space-y-6 mb-8">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: Math.min(index * 0.1, 1) }}
                    className="bg-gray-800 p-6 rounded-lg border border-cyan-500/20"
                  >
                    {editingCommentId === comment.id ? (
                      <div className="space-y-4">
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full p-4 rounded-lg bg-gray-900 text-white border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 h-24 resize-y"
                          required
                        />
                        <div className="flex space-x-3">
                          <motion.button
                            onClick={() => handleUpdate(comment.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-all duration-300"
                          >
                            Save
                          </motion.button>
                          <motion.button
                            onClick={() => setEditingCommentId(null)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 transition-all duration-300"
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-300 mb-3 break-words">{comment.content}</p>
                        <div className="flex justify-between text-gray-400 text-sm">
                          <p className="truncate max-w-[200px]">{comment.user.username} · {new Date(comment.created_at).toLocaleDateString()}</p>
                          {user && comment.user_id === user.id && (
                            <div className="flex space-x-3">
                              <button onClick={() => startEdit(comment)} className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteComment(comment.id)} className="text-red-400 hover:text-red-300 transition-colors duration-200">
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {token && (
          <motion.form 
            onSubmit={handleAddComment} 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex space-x-3"
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-4 rounded-lg bg-gray-900 text-white border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 h-20 resize-y"
              required
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-all duration-300"
            >
              <Send className="w-6 h-6" />
            </motion.button>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;