
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getPostById, updatePost } from '../../../api/postApi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


const EditPostPage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 16 / 9 }); 
  const [croppedImage, setCroppedImage] = useState(null); 
  const [imageRef, setImageRef] = useState(null); 
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Fetch post data on component mount
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

  // Handle image file selection and create preview
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Perform cropping and convert to File object
  const getCroppedImg = () => {
    if (!imageRef || !crop.width || !crop.height) return;
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      imageRef,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
    // Convert canvas to File object
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], imageFile.name, { type: imageFile.type });
        setCroppedImage(file);
      }
    }, imageFile.type);
  };

  // Handle form submission
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
      if (title) formData.append('title', title);
      if (content) formData.append('content', content);
      if (croppedImage) formData.append('image', croppedImage);
      await updatePost(id, formData);
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
            onChange={handleImageChange}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-300"
          />
          {imageSrc && (
            <div className="mt-4">
              <ReactCrop
                crop={crop}
                onChange={setCrop}
                onComplete={getCroppedImg}
                aspect={16 / 9}
              >
                <img
                  src={imageSrc}
                  onLoad={(e) => setImageRef(e.target)}
                  alt="Crop preview"
                />
              </ReactCrop>
            </div>
          )}
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
