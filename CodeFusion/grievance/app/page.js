import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex flex-col justify-center text-white h-1/2 items-center pt-10">
        <div className="flex justify-center items-center">
          <span className="font-bold text-5xl text-center">Be a responsible citizen</span>
          <span><img className="rounded-full" src="/help.gif" alt="" width={50} /></span>
        </div>
        <div className=" mt-10 text-center">
          <p>A public portal where you can post common problems in and around you</p>
          <Link href='/login'><button type="button" className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-5 hover:font-bold duration-200 w-32">Start Now</button></Link>
          <Link href='/about'><button type="button" className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-5 hover:font-bold duration-200 w-32">Read More</button></Link>
        </div>
      </div>
      <div className="bg-white h-1 opacity-10 mt-10"></div>
      <div className="text-white flex flex-col items-center">
        <div className="container mx-auto">
          <h1 className="text-center mt-10 text-3xl font-bold">Why Use VoiceIT?</h1>
          <div className="flex gap-5 ml-5 mr-5 justify-between">
            <div className="item flex flex-col justify-center items-center mt-10 w-full">
              <img className="bg-blue-600 rounded-full" src="/spread.gif" alt="" width={150} />
              <p className="font-bold mt-5">Spread the Word</p>
              <p>Help people in your locality know about occuring problems</p>
            </div>
            <div className="item flex flex-col justify-center items-center mt-10 w-full">
              <img className="bg-blue-600 rounded-full" src="/solution.gif" alt="" style={{ width: '150px', height: '150px' }} />
              <p className="font-bold mt-5">Get solutions ASAP</p>
              <p className="text-center">Based on the severity of the problem concerned officials will be notified and your problem will be solved accordingly</p>
            </div>
            <div className="item flex flex-col justify-center items-center mt-10 w-full">
              <img className="bg-blue-600 rounded-full" src="/problem.gif" alt="" width={150} />
              <p className="font-bold mt-5">Know Problems around you</p>
              <p>Get to know problems in your locality and avoid them</p>
            </div>
          </div>
        </div>
        <div className="bg-white h-1 opacity-10 mt-10 w-full"></div>
        <div className="text-white flex flex-col items-center">
          <div className="container mx-auto">
            <h1 className="text-center mt-10 text-3xl font-bold">Learn More</h1>
          </div>
        </div>
        <video
          className="mt-10 mb-10"
          width="560"
          height="315"
          controls // Adds play, pause, and volume controls
          referrerPolicy="strict-origin-when-cross-origin"
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

      </div>

    </>
  );
}
