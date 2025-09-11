
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPostById, updatePost } from '../../../api/postApi';
import PostForm from '../components/PostForm';
import { useSelector } from 'react-redux';

const EditPostPage = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState({});

  useEffect(() => {
    const fetchPost = async () => {
      try {
        toast.loading("Fetching post...", { id: "post" });
        const post = await getPostById(id);
        if (post.author_id !== user.id) {
          toast.error("Not authorized.", { id: "post" });
          navigate(`/posts/${id}`);
          return;
        }
        setInitialValues({
          title: post.title,
          content: post.content,
          imageUrl: post.image_url,
        });
        toast.dismiss("post");
      } catch (err) {
        toast.error("Failed to fetch post.", { id: "post" });
      }
    };
    fetchPost();
  }, [id, user.id, navigate]);

  const handleUpdate = async (formData) => {
    try {
      toast.loading("Updating post...", { id: "post" });
      await updatePost(id, formData);
      toast.success("Post updated!", { id: "post" });
      navigate(`/posts/${id}`);
    } catch (err) {
      toast.error("Update failed.", { id: "post" });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-6">Edit Post</h1>
        <PostForm
          initialValues={initialValues}
          onSubmit={handleUpdate}
          submitLabel="Update Post"
        />
      </div>
    </div>
  );
};

export default EditPostPage;
