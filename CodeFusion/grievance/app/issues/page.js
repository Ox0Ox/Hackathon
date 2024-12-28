import React from 'react';
import Link from 'next/link';

const Page = () => {
    
  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className='text-4xl font-bold mb-10 mt-5 text-center'>Report common issues</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <Link href={'/issues/waste-drainage'}><div className="carder hover:cursor-pointer hover:bg-blue-800 duration-300 bg-blue-950 rounded-xl p-4 text-center">
            <img src="/waste.png" alt="Waste" className="mx-auto mb-3" />
            <div className="text-white text-xl">Waste and Drainage</div>
          </div></Link>
          <Link href={'/issues/road'}><div className="carder hover:cursor-pointer hover:bg-blue-800 duration-300 bg-blue-950 rounded-xl p-4 text-center">
            <img src="/road1.png" alt="Road" className="mx-auto mb-3" />
            <div className="text-white text-xl">Road</div>
          </div></Link>
          <Link href={'/issues/electricity'}><div className="carder hover:cursor-pointer hover:bg-blue-800 duration-300 bg-blue-950 rounded-xl p-4 text-center">
            <img src="/electricity.png" alt="Electricity" className="mx-auto mb-3" />
            <div className="text-white text-xl">Electricity</div>
          </div></Link>
          <Link href={'/issues/community'}><div className="carder hover:cursor-pointer hover:bg-blue-800 duration-300 bg-blue-950 rounded-xl p-4 text-center">
            <img src="/community.png" alt="Community Disturbance" className="mx-auto mb-3" />
            <div className="text-white text-xl">Community Disturbance</div>
          </div></Link>
          <Link href={'/issues/transport'}><div className="carder hover:cursor-pointer hover:bg-blue-800 duration-300 bg-blue-950 rounded-xl p-4 text-center">
            <img src="/transport.png" alt="Public Transport" className="mx-auto mb-3" />
            <div className="text-white text-xl">Public Transport</div>
          </div></Link>
          <Link href={'/issues/water'}><div className="carder hover:cursor-pointer hover:bg-blue-800 duration-300 bg-blue-950 rounded-xl p-4 text-center">
            <img src="/water.png" alt="Water" className="mx-auto mb-3" />
            <div className="text-white text-xl">Water</div>
          </div></Link>
          <Link href={'/issues/other'}><div className="carder hover:cursor-pointer hover:bg-blue-800 duration-300 bg-blue-950 rounded-xl p-4 text-center">
            <img src="/other.png" alt="Other" className="mx-auto mb-3" />
            <div className="text-white text-xl">Other</div>
          </div></Link>
        </div>
      </div>
      <div className="all"></div>
    </>
  );
};

export default Page;
