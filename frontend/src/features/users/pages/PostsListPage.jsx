import React, { useEffect, useState } from 'react';
import { getAllPosts } from '../../../api/postApi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const PostsListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        toast.loading('Fetching posts...', { id: 'fetch-posts' });
        const data = await getAllPosts();
        setPosts(data);
        toast.dismiss('fetch-posts');
      } catch (err) {
        toast.error('Failed to fetch posts.', { id: 'fetch-posts' });
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: .1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white text-xl animate-pulse"
    >
      Loading posts...
    </motion.div>
  );
  if (posts.length === 0) return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: .1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white text-xl"
    >
      No posts found.
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: .1 }}
          className="text-4xl font-extrabold text-cyan-300 mb-8 text-center tracking-wide"
        >
          Boom Blog Posts
        </motion.h1>
        <div className="grid gap-8 grid-cols-1">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: .7, delay: Math.min(index * 0.1, 1) }}
              whileHover={{ scale: 1.02, boxShadow: "0 15px 30px rgba(0, 255, 255, 0.1)" }}
              className="w-full"
            >
              <Link
                to={`/posts/${post.id}`}
                className="block bg-gray-800 p-8 rounded-xl border border-cyan-500/20 hover:border-cyan-500 transition-all duration-500 hover:bg-gray-700/50"
              >
                <h2 className="text-2xl font-bold text-cyan-300 mb-4 truncate">{post.title}</h2>
                <p className="text-gray-300 mb-6 line-clamp-4">{post.content}</p>
                <div className="flex justify-between text-gray-400 text-sm">
                  <p>By {post.author.username} · {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between text-gray-400 text-sm mt-3">
                  <p>Views: {post.view_count}</p>
                  <p>Likes: {post.like_count}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostsListPage;