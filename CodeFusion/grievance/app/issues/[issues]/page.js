'use client';
import React, { useState, useEffect } from 'react';
import { CiSquarePlus } from "react-icons/ci";
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const Issues = ({ params }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/getissue/${params.issues}`);
        console.log('Some response', response);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        console.log(data);
        setIssues(data); // Set issues directly to the fetched data
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message); // Capture error message for user feedback
      } finally {
        setLoading(false);
      }
    };

    if (params.issues) {
      fetchDashboardData();
    }
  }, [params.issues]);

  useEffect(() => {
    // If session exists and has pincode, set it
    if (session && session.users && session.users.pincode) {
      setPincode(session.users.pincode);
    }
  }, [session]);

  const handlePincodeChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPincode(value);
      setError('');
    } else {
      setError('Pincode must be a maximum of 6 digits and contain only numbers.');
    }
  };

  const handleSubmit = () => {
    if (pincode.length === 6) {
      console.log(`Submitted pincode: ${pincode}`);
    } else {
      setError('Please enter a valid 6-digit pincode.');
    }
  };

  const useCurrentPincode = () => {
    // if (session && session.user && session.user.pincode) {
    //   setPincode(session.user.pincode); // Use user's pincode from session
    // } else {
    //   setError('No pincode found in your session.');
    //   console.log(session.user);
      const pinner = 560100
      setPincode(pinner)
      // }
    
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
    <div className='p-5'>
      <h1 className='text-4xl font-bold'>Find or report problems on {params.issues} related issues</h1>
      <div className='flex justify-between items-center h-12'>
        <div>
          <h1 className='text-lg mt-2'>Please search your pincode region if the problem already exists and raise awareness else raise a new ticket</h1>
        </div>
        <div className=''>
          <div><span className='text-xl'>Enter pincode</span></div>
          <div className='mt-2 flex flex-col justify-center items-center'>
            <div>
              <button
                className='bg-green-500 text-white rounded-lg p-2'
                onClick={useCurrentPincode}
              >
                Use Default
              </button>
              <input
                className='mx-2 text-black rounded-lg p-2'
                type="text"
                value={pincode}
                onChange={handlePincodeChange}
              />
              <button
                className='bg-blue-500 text-white rounded-lg p-2'
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <Link href={`/issues/${params.issues}/postissue`}>
        <div className="w-28 py-2 hover:cursor-pointer duration-200 mx-auto mt-6 bg-gray-500 rounded-lg flex flex-col items-center justify-center text-white font-bold hover:bg-gray-600">
          <div className='p-2'>Raise Ticket</div>
        </div>
      </Link>
      <div className='text-xl mt-2'>Top issues-</div>
      {issues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {issues.map((issue, index) => (
            <div key={index} className="bg-blue-950 hover:bg-blue-800 duration-200 hover:cursor-pointer rounded-lg shadow-md p-4">
              <img src={issue.image} alt="Issue Image" className="w-full h-48 object-cover" />
              <h2 className="text-lg font-bold mt-2">Issue: {issue.title}</h2>
              <p className="text-white">Pincode: {issue.pincode}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-screen items-center justify-center relative bottom-10">
          <div className="text-center p-6 shadow-md rounded-lg">
            <h1 className="text-5xl font-bold text-white">No issues found</h1>
            <p className="mt-4 text-gray-500">
              Sorry, please try a different URL.
            </p>
          </div>
        </div>
      )}
      {error && <p className='text-red-500'>{error}</p>}
    </div>
  );
};

export default Issues;
