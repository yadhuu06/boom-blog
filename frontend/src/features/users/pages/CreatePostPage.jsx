// pages/CreatePostPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createPost } from '../../../api/postApi';
import PostForm from '../components/PostForm';

const CreatePostPage = () => {
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    try {
      toast.loading("Creating post...", { id: "post" });
      await createPost(formData);
      toast.success("Post created!", { id: "post" });
      navigate("/");
    } catch (err) {
      toast.error("Create failed.", { id: "post" });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-6">Create Post</h1>
        <PostForm onSubmit={handleCreate} submitLabel="Create Post" />
      </div>
    </div>
  );
};

export default CreatePostPage;
