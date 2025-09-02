
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { createPost } from '../../../api/postApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Component for creating a new post with image cropping
const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null); // Source for image preview
  const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 16 / 9 }); // Crop settings
  const [croppedImage, setCroppedImage] = useState(null); // Cropped image file
  const [imageRef, setImageRef] = useState(null); // Reference to image element
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

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
      toast.error("Title and content required.");
      return;
    }
    if (title.length > 80) {
      toast.error("Title max 80 characters.");
      return;
    }
    try {
      toast.loading("Creating post...", { id: "create-post" });
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (croppedImage) {
        formData.append('image', croppedImage);
      }
      await createPost(formData);
      toast.success("Post created!", { id: "create-post" });
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Create failed.", { id: "create-post" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-2xl"
      >
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-4xl font-extrabold text-cyan-300 mb-8 text-center tracking-wide"
        >
          Create a New Post
        </motion.h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Title (max 80 characters)</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              maxLength={80}
              className="w-full p-4 rounded-lg bg-gray-800 text-white border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 placeholder-gray-500"
              required
            />
            <p className="mt-1 text-sm text-gray-400">{title.length}/80</p>
          </motion.div>
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              className="w-full p-4 rounded-lg bg-gray-800 text-white border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 placeholder-gray-500 h-48 resize-y"
              required
            />
          </motion.div>
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">Upload Image (optional)</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-4 rounded-lg bg-gray-800 text-white border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600/50 file:text-cyan-100 file:hover:bg-cyan-600"
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
          </motion.div>
          <motion.button
            type="submit"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-4 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-all duration-300 font-semibold text-lg shadow-lg"
          >
            Create Post
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePostPage;
