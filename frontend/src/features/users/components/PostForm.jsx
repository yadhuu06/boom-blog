import React, { useState, useEffect, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import toast from 'react-hot-toast';

const PostForm = ({ initialValues = {}, onSubmit, submitLabel }) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [content, setContent] = useState(initialValues.content || '');
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(initialValues.imageUrl || null);
  const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 16 / 9 });
  const [croppedImage, setCroppedImage] = useState(null);
  const imageRef = useRef(null);

  // Only set initial values when they arrive
  useEffect(() => {
    if (initialValues.title) setTitle(initialValues.title);
    if (initialValues.content) setContent(initialValues.content);
    if (initialValues.imageUrl) setImageSrc(initialValues.imageUrl);
  }, [initialValues]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = () => {
    if (!imageRef.current || !crop.width || !crop.height) return;
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], imageFile.name, { type: imageFile.type });
        setCroppedImage(file);
      }
    }, imageFile?.type);
  };

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

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (croppedImage) formData.append('image', croppedImage);

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        maxLength={80}
        className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 h-32"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600"
      />
      {imageSrc && (
        <ReactCrop
          crop={crop}
          onChange={setCrop}
          onComplete={getCroppedImg}
          aspect={16 / 9}
        >
          <img src={imageSrc} ref={imageRef} alt="Crop preview" />
        </ReactCrop>
      )}
      <button
        type="submit"
        className="w-full p-3 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        {submitLabel}
      </button>
    </form>
  );
};

export default PostForm;
