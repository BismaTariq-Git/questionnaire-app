import { useState } from "react";
import { useRouter } from "next/router";
import shoeImage from "../public/shoe.png";
import supabase from "../utils/supabaseClient";
import Image from "next/image";
import unionShape from "../public/arrow.png";

const Step1 = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleStartSurvey = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      
      const { data, error } = await supabase
        .from("questions") 
        .select("status, step")
        .eq("email", email)
        .limit(1); 

      if (error) {
        console.error("Error checking survey status:", error.message);
        setError("Error checking survey status");
        return;
      }

      if (!data || data.length === 0) {
        
        router.push(`/page2?email=${email}`);
      } else {
        
        const userProgress = data[0]; 

        if (userProgress.status === "completed") {
       
          router.push("/thank-you");
        } else if (userProgress.status === "in-progress") {
       
          if (userProgress.step && userProgress.step >= 2) {
            router.push(`/page${userProgress.step}?email=${email}`);
          } else {
            
            router.push(`/page2?email=${email}`);
          }
        }
      }
    } catch (err) {
      setError("Error checking survey status");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#4D4D4D] to-[#010101]">
      <div className="relative flex w-full max-w-6xl overflow-hidden px-4 md:px-10 flex-col md:flex-row">
       
        <div className="absolute top-0 left-0 z-0 opacity-80">
          <Image
            src={unionShape}
            alt="Arrow Shape"
            width={300} 
            height={300} 
            className="opacity-80"
          />
        </div>

        
        <div className="relative w-full sm:w-1/2 flex items-center justify-center z-10 mb-8 sm:mb-0">
          <Image
            src={shoeImage}
            alt="Shoe"
            width={600} 
            height={500} 
            priority
            className="w-auto h-auto sm:w-2/3 md:w-3/4 lg:w-3/5 transform -translate-y-8 -translate-x-5 z-10"
          />
        </div>

       
        <div
          className="absolute opacity-30 left-[-41px] top-[588.21px] bg-black"
          style={{
            width: "494px",
            height: "35px",
            borderRadius: "50%",
          }}
        ></div>

       
        <div className="w-1/2 p-10 flex flex-col justify-center relative z-20">
          <h1 className="text-3xl font-bold mb-4 text-center text-white">
            Questionnaire
          </h1>
          <div className="bg-pink-200 p-4 rounded-lg text-gray-800 mb-6">
            <h2 className="text-lg font-semibold">Welcome!</h2>
            <p className="text-sm">
              We're excited to hear your thoughts, ideas, and insights! Don’t
              worry about right or wrong answers—just speak from the heart. Your
              genuine feedback is invaluable to us!
            </p>
          </div>

        
          <form className="space-y-4" onSubmit={handleStartSurvey}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-full bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-full bg-lime-400 hover:bg-lime-500 transition-colors text-black font-semibold flex justify-between items-center mt-4 mb-6"
            >
              <span>Start Survey</span>
              <span>↗️</span>
            </button>
          </form>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Step1;
