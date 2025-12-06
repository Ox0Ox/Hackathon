import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    // 1. A single container for the entire page.
    // This removes the conflict caused by multiple top-level divs.
    <div className="flex flex-col items-center text-white w-full">

      {/* Section 1: Hero */}
      {/* I've removed the problematic `h-1/2` class. */}
      <section className="flex flex-col justify-center items-center text-center py-16 px-4">
        <div className="flex justify-center items-center gap-4">
          <span className="font-bold text-5xl">Be Vigilant, Be safe</span>
          {/* Using <img> is fine, but Next.js <Image> is often better for optimization */}
          <img className="rounded-full" src="/help.gif" alt="Helping hand animation" width={50} />
        </div>
        <div className="mt-10">
          <p>A public portal where you can post common problems in and around you</p>
          <div className="flex justify-center gap-4 mt-5">
            <Link href='/login'>
              <button type="button" className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:font-bold duration-200 w-32">Start Now</button>
            </Link>
            <Link href='/about'>
              <button type="button" className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:font-bold duration-200 w-32">Read More</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="bg-white h-px opacity-10 w-full max-w-screen-lg"></div>

      {/* Section 2: Features */}
      <section className="container mx-auto py-16 px-4">
        <h1 className="text-center text-3xl font-bold">Why Use VigilAI?</h1>
        {/* Made this section responsive for smaller screens */}
        <div className="flex flex-col md:flex-row gap-8 mt-10 text-center">
          <div className="item flex flex-col items-center flex-1">
            <img className="bg-blue-600 rounded-full" src="/spread.gif" alt="Spreading the word animation" width={150} />
            <p className="font-bold mt-5">Spread the Word</p>
            <p>Help people in your locality know about occuring problems</p>
          </div>
          <div className="item flex flex-col items-center flex-1">
            <img className="bg-blue-600 rounded-full" src="/solution.gif" alt="Solution finding animation" style={{ width: '150px', height: '150px' }} />
            <p className="font-bold mt-5">Get solutions ASAP</p>
            <p>Based on the severity of the problem concerned officials will be notified and your problem will be solved accordingly</p>
          </div>
          <div className="item flex flex-col items-center flex-1">
            <img className="bg-blue-600 rounded-full" src="/problem.gif" alt="Problem identification animation" width={150} />
            <p className="font-bold mt-5">Know Problems around you</p>
            <p>Get to know problems in your locality and avoid them</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="bg-white h-px opacity-10 w-full max-w-screen-lg"></div>

      {/* Section 3: Video */}
      <section className="container mx-auto py-16 px-4 flex flex-col items-center">
        <h1 className="text-center text-3xl font-bold">Learn More</h1>
        {/* Placed video in a container and made it responsive */}
        <div className="mt-10 w-full max-w-3xl">
          <video
            className="w-full h-auto rounded-lg shadow-lg"
            controls
            referrerPolicy="strict-origin-when-cross-origin"
          >
            <source src="/video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

    </div>
  );
}
