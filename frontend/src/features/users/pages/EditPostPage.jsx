import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getPostById, updatePost } from '../../../api/postApi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditPostPage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        toast.loading('Fetching post...', { id: 'fetch-post' });
        const post = await getPostById(id);
        if (post.author_id !== user.id) {
          toast.error('Not authorized to edit.', { id: 'fetch-post' });
          navigate(`/posts/${id}`);
          return;
        }
        setTitle(post.title);
        setContent(post.content);
        toast.dismiss('fetch-post');
      } catch (err) {
        toast.error('Failed to fetch post.', { id: 'fetch-post' });
      }
    };
    fetchPost();
  }, [id, user.id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content required.');
      return;
    }
    if (title.length > 80) {
      toast.error('Title max 80 characters.');
      return;
    }
    try {
      toast.loading('Updating post...', { id: 'update-post' });
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (imageFile) formData.append('image', imageFile);
      await updatePost(id, formData, token);
      toast.success('Post updated!', { id: 'update-post' });
      navigate(`/posts/${id}`);
    } catch (err) {
      toast.error('Update failed.', { id: 'update-post' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gray-800 rounded-md shadow-md p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Edit Post</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (max 80 chars)"
            maxLength={80}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-300"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-300 h-32"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-300"
          />
          <button
            type="submit"
            className="w-full p-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
          >
            Update Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;