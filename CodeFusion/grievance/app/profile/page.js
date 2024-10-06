'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './getCroppedImg'; // Adjust the path if needed

const ProfileForm = () => {
    const { data: session } = useSession();
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        pincode: '', // Initialize pincode in formData
        gender: '',
    });

    const [errors, setErrors] = useState({});
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [cropping, setCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [image, setImage] = useState(null);
    const [imageCleared, setImageCleared] = useState(false); // Track if image is cleared
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchUserProfile = async () => {
            console.log(session?.user);
            setLoading(true);
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/user-profile/${session.user.id}`); // Replace with your API endpoint
                    if (!response.ok) {
                        throw new Error('Failed to fetch user profile');
                    }
                    const userProfile = await response.json();
                    setFormData({
                        username: userProfile.username || '',
                        email: userProfile.email || '',
                        phone: userProfile.phone || '',
                        pincode: userProfile.pincode || '', // Populate pincode from userProfile
                        gender: userProfile.gender || '',
                    });

                    // Check if image is cleared
                    if (userProfile.image === 'cleared') {
                        setImageCleared(true);
                        setCroppedImage(null);
                    } else {
                        setImageCleared(false);
                        setCroppedImage(userProfile.image || null);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                } finally {
                    setLoading(false); // End loading
                }
            }
        };

        fetchUserProfile();
    }, [session]);
    
    
    const handleCropComplete = async (croppedArea, croppedAreaPixels) => {
        try {
            const croppedImg = await getCroppedImg(image, croppedAreaPixels);
            setCroppedImage(croppedImg);
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    const closeCropper = () => {
        setCropping(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Allow unchecking radio buttons for gender
        if (name === 'gender' && formData.gender === value) {
            setFormData((prevState) => ({ ...prevState, gender: '' })); // Uncheck if selected
        } else {
            setFormData((prevState) => ({ ...prevState, [name]: value }));
        }

        setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const formElements = Array.from(e.target.form.elements);
            const currentIndex = formElements.indexOf(e.target);
            const nextElement = formElements[currentIndex + 1];
            if (nextElement) {
                nextElement.focus();
            } else {
                handleSubmit(e);
            }
        }
    };

    const validateForm = async () => {
        let errors = {};
        const userId = session?.user?.id;

        if (formData.username) {
            try {
                const response = await fetch(`/api/check-username?username=${encodeURIComponent(formData.username)}&userId=${encodeURIComponent(userId)}`);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const result = await response.json();
                
                if (result.exists) {
                    errors.username = 'Username already exists';
                }
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        }

        if (formData.phone) {
            if (!/^\d+$/.test(formData.phone)) {
                errors.phone = 'Phone number must be digits only';
            }
        }

        if (formData.phone && !formData.gender) {
            errors.gender = 'Gender is required if phone number is provided';
        }
        if (formData.pincode) {
            if (!/^\d{1,6}$/.test(formData.pincode)) {
                errors.pincode = 'Pincode must be 6 digits or less';
            }
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = await validateForm();
        if (Object.keys(validationErrors).length === 0) {
            try {
                if (!session?.user?.id) {
                    throw new Error('User ID is missing');
                }

                const payload = {
                    id: session.user.id,
                    ...formData,
                    image: croppedImage || (imageCleared ? 'cleared' : session.user.image),
                };

                const response = await fetch('/api/user', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                console.log('Profile Data Updated:', result);
            } catch (error) {
                console.error('Error updating profile data:', error);
            }
        } else {
            setErrors(validationErrors);
        }
    };

    const clearImage = () => {
        setProfilePicFile(null);
        setImage(null);
        setCroppedImage(null);
        setImageCleared(true);
        document.getElementById('profilePicUpload').value = null;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfilePicFile(imageUrl);
            setImage(imageUrl);
            setCropping(true);
            document.getElementById('profilePicUpload').value = null;
        }
    };

    const uploadDefaultImage = () => {
        setCroppedImage(session.user.image);
        setImageCleared(false);
    };

    if (loading) {
        return (
          <div className='flex justify-center items-center h-screen relative bottom-20'>
            <h1 className='text-3xl text-gray-700'>Loading...</h1>
    
            <div role="status">
              <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
    
          </div>
        );
      }

    return (
        <div className='container mx-auto'>
            <div className="max-w-md mx-auto p-4 rounded-lg shadow-md">
                <h2 className="text-5xl font-bold mb-4 text-white text-center">Profile Details</h2>
                <div className="flex justify-center mb-5 relative">
                    <div
                        className="mt-5 h-36 w-36 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                        onClick={() => document.getElementById('profilePicUpload').click()}
                    >
                        {croppedImage ? (
                            <img
                                src={croppedImage}
                                alt="Profile Pic"
                                className="rounded-full h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-500">Profile Pic</span>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="profilePicUpload"
                        onChange={handleFileUpload}
                    />
                    {croppedImage && (
                        <>
                            <label
                                htmlFor="profilePicUpload"
                                className="absolute top-0 right-0 bg-gray-500 text-white px-2 py-1 rounded cursor-pointer"
                            >
                                Change
                            </label>
                            {croppedImage !== session?.user?.image && (
                                <button
                                    onClick={() => setCropping(true)}
                                    className="absolute top-12 right-0 bg-blue-500 text-white px-2 py-1 rounded cursor-pointer"
                                >
                                    Crop
                                </button>
                            )}
                            <button
                                onClick={clearImage}
                                className="absolute mt-5 top-20 right-0 bg-red-500 text-white px-2 py-1 rounded cursor-pointer"
                            >
                                Clear
                            </button>
                        </>
                    )}
                </div>

                {session?.user?.image && !croppedImage && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={uploadDefaultImage}
                            className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            Upload Default Image
                        </button>
                    </div>
                )}

                {cropping && (
                    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                        <div className="relative w-1/2 h-1/2 bg-white rounded-lg p-4">
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                                style={{ containerStyle: { width: '100%', height: '100%' } }}
                            />
                            <button
                                onClick={closeCropper}
                                className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className='text-black'>
                    <label className="block mb-2 text-white">Username</label>
                    <input
                        type="text"
                        name="username"
                        className="block w-full p-2 rounded-md border border-gray-300"
                        value={formData.username}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                    />
                    {errors.username && <span className="text-red-500">{errors.username}</span>}

                    <label className="block mt-4 mb-2 text-white">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        className="block w-full p-2 rounded-md border border-gray-300"
                        value={formData.phone}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                    />
                    {errors.phone && <span className="text-red-500">{errors.phone}</span>}
                    <label className="block mt-4 mb-2 text-white">Pincode</label>
                    <input
                        type="text"
                        name="pincode"
                        className="block w-full p-2 rounded-md border border-gray-300"
                        value={formData.pincode}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                    />
                    {errors.pincode && <span className="text-red-500">{errors.pincode}</span>}

                    <label className="block mt-4 mb-2 text-white">Gender</label>
                    <div className="flex space-x-4">
                        <label className="text-white">
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={formData.gender === 'male'}
                                onChange={handleChange}
                            />
                            Male
                        </label>
                        <label className="text-white">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={formData.gender === 'female'}
                                onChange={handleChange}
                            />
                            Female
                        </label>
                    </div>
                    {errors.gender && <span className="text-red-500">{errors.gender}</span>}

                    <button
                        type="submit"
                        className="mt-8 bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileForm;
