'use client'
import React, { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './getCroppedImg'; // Adjust path if needed
import { useSession } from 'next-auth/react';
import { CiSquarePlus } from "react-icons/ci";
import { IoFileTrayFullOutline } from "react-icons/io5";
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';


const postissue = () => {
  const params = useParams();
  const router = useRouter()
  const issueslug = params.issues
  console.log(issueslug);
  const [bannerFile, setBannerFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState([]); // Array to store multiple file names
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImage, setCroppedImage] = useState(null);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [sol, setSol] = useState('');
  const { data: session } = useSession();// Loading state
  const [fetchfile, setfetchfile] = useState([]);
  const [showfile, setshowfile] = useState(false);
  const [uploadingfiles, setuploadingfiles] = useState([])
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');


   // Only run effect when user session ID is available

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    console.log(e.target.files);
    console.log(file);
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBannerFile(imageUrl);
      setImage(imageUrl);
      setCropping(true); // Start cropping after upload
    }
  };

  const handleCropComplete = async (croppedArea, croppedAreaPixels) => {
    try {
      const croppedImg = await getCroppedImg(image, croppedAreaPixels);
      setCroppedImage(croppedImg);
      setBannerFile(croppedImg); // Update the banner file with the cropped image
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const closeCropper = () => {
    setCropping(false);
  };

  const startCropping = () => {
    setCropping(true);
  };

  const clearBanner = () => {
    setBannerFile(null);
    setCroppedImage(null);
    setImage(null);
    if (image) {
      URL.revokeObjectURL(image); // Revoke the object URL to free memory
    }
  };

  const handleFileUploadForFiles = (e) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFile(prevFiles => [...prevFiles, ...fileNames]); // Append new files to existing ones
      console.log('Selected files for upload:', fileNames); // Log file names
  
      console.log('THESE ARE THE FILES', files);
      for (let file of files) {
        const reader = new FileReader();
        
        // When the file is read successfully, the result will be the data URL
        reader.onloadend = () => {
          const dataUrl = reader.result; // This will be the data URL of the file
          console.log('Data URL:', dataUrl);
  
          // Update the state with the new data URL
          setuploadingfiles(prevFiles => [...prevFiles, dataUrl]);
        };
        
        // Read the file as a data URL
        reader.readAsDataURL(file);
      }
    }
  };
  

  const handleUpdate = async (e) => {
    try {
      const userId = session?.user?.id; // Replace with actual user ID from session or context
      const userName = session?.user?.name; // Replace with actual user ID from session or context
      console.log(userId);
      console.log(croppedImage);
      console.log(bannerFile);
  
      // Construct the payload based on the IssueSchema
      const payload = {
        postby: userName, // User ID or username of the person posting the issue
        issuetype: issueslug, // You can set this to the relevant issue type
        image: croppedImage || bannerFile,
        title,
        desc,
        pincode,
        uploadedFile: uploadingfiles, // If you still want to include uploaded files
        // Include other fields as necessary
      };
  
      // Step 4: Send the updated data to the server
      const response = await fetch('/api/issue', { // Change to your issue API endpoint
        method: 'POST', // Use POST for creating a new issue
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log('Issue created successfully:', result);
  
      // Reset form after submission
      setUploadedFile([]);
      // setTitle('');
      // setDesc('');
      // setPincode('');
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };
  
  
  const viewfile = () =>{
    setshowfile(!showfile);
  };

  const goback = () =>{
    router.push(`/issues/${issueslug}`)
  }
  const handlePincodeChange = (e) => {
    const value = e.target.value;
    // Only allow digits and max length of 6
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPincode(value);
      setError('');
    } else {
      setError('Pincode must be a maximum of 6 digits and contain only numbers.');
    }
  };

  const useCurrentPincode = () => {
    // Logic to fetch and use the user's current pincode
    // For example, this might use the Geolocation API or a service
    const currentPincode = '560100'; // Replace with actual logic to get user's pincode
    setPincode(currentPincode);
  };
  

  if (showfile) {
    return (
      <>
        <ul className="text-white p-2">
          {fetchfile.map((file, index) => (
            <li key={index}>
              {/* Download button for each file */}
              <a href={file} download={`file_${index}`} className="text-white">
                <button className="text-white">
                  Download File {index + 1}
                </button>
              </a>
            </li>
          ))}
        </ul>
        <button className="text-white" onClick={viewfile}>
          Go Back :D
        </button>
      </>
    );
  }
  

 

  return (
    <>
    <div className='pt-5'>
      <div className="relative mx-auto w-[1000px] h-96">
        <div className="cover w-full h-full bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500 hover:opacity-80 cursor-pointer">
            {bannerFile ? 'Change Banner' : 'Upload Photo'}
          </span>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            id="bannerUpload"
          />
        </div>
        <label htmlFor="bannerUpload" className="absolute inset-0">
          <div className="absolute inset-0 cursor-pointer" />
        </label>
        {bannerFile && (
          <>
            <img src={bannerFile} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute bottom-2 right-2 flex space-x-2">
              <label htmlFor="bannerUpload" className="bg-gray-700 text-white px-2 py-1 rounded cursor-pointer">
                Change
              </label>
              <button
                onClick={startCropping}
                className="bg-blue-500 text-white px-2 py-1 rounded cursor-pointer"
              >
                Crop
              </button>
              <button
                onClick={clearBanner}
                className="bg-red-500 text-white px-2 py-1 rounded cursor-pointer"
              >
                Clear
              </button>
            </div>
          </>
        )}

        {cropping && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="absolute w-1/3 h-3/4 bg-white rounded-lg p-4">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1000 / 384} // Aspect ratio for banner
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
              <button
                onClick={closeCropper}
                className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="w-1/2 mx-auto">
          <h1 className="text-white mb-2">Enter title</h1>
          <input
            className="w-full p-2 rounded-xl text-black"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="w-1/2 mx-auto mt-6">
          <h1 className="text-white mb-2 flex items-center">
            Describe your problem
          </h1>
          <textarea
            className="w-full p-2 align-text-top rounded-xl min-h-full text-black"
            type="text"
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
          />
        </div>
        <div className="w-1/2 mx-auto mt-6">
          <h1 className="text-white mb-2 flex items-center ">
            Suggest Solution (optional)
          </h1>
          <textarea
            className="w-full p-2 align-text-top rounded-xl min-h-full text-black"
            type="text"
            onChange={(e) => setSol(e.target.value)}
            rows={3}
          />
        </div>
        <div className='flex justify-center items-center w-1/2 mx-auto gap-5'>
        <div className="w-1/2 mx-auto mt-6">
          <div className='flex gap-2 items-center justify-center h-20'>
          <h1 className="text-white flex items-center justify-center">
            Enter Pincode
          </h1>
          <button
                      className='bg-green-500 text-white rounded-lg p-2'
                      onClick={useCurrentPincode}
                    >
                      Use Default
                    </button>
                    </div>
          <input
            className="w-full p-2 rounded-xl h-10 text-black"
            type="text"
            value={pincode}
            onChange={handlePincodeChange}
          />
        </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div className='flex text-white justify-center w-full items-center'>
          <div className='flex flex-col items-center'>
            <label htmlFor="fileUpload" className="cursor-pointer">
              <div className="w-40 h-40 mr-2 bg-gray-500 rounded-lg flex flex-col items-center justify-center text-white font-bold hover:bg-gray-600">
                <div className='p-2'>Upload Files</div>
                <div className='p-2'>(Optional)</div>
                <div className='text-white text-3xl'><CiSquarePlus /></div>
              </div>

              <input
                type="file"
                accept="*"
                multiple  // Allow multiple file selection
                style={{ display: 'none' }}
                id="fileUpload"
                onChange={handleFileUploadForFiles}
              />

            </label>

            {uploadedFile.length > 0 && (
              <ul className="text-white mt-2">
                {uploadedFile.map((file, index) => (
                  <li key={index}>Uploaded File: {file}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className='flex mt-8 gap-5 items-center justify-center'>
        <button
          onClick={goback}
          className="bg-red-500 text-white rounded-md mb-5 px-4 py-2"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mb-5"
        >
          Upload Issue
        </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default postissue;
