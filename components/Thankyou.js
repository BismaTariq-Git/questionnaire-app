import React, { useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import supabase from "../utils/supabaseClient";
import Image from "next/image";
import shoeImage from "../public/Shoe.png";
import unionShape from "../public/arrow.png";

const ThankYou = () => {
  const router = useRouter();
  const { email } = router.query;

  useEffect(() => {
    const submitToMongoDB = async () => {
      if (!email) {
        console.log("Email not found");
        return;
      }

      console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL); // Debugging line

      // Fetch data from Supabase using email
      const { data } = await supabase
        .from("questions")
        .select("data")
        .eq("email", email)
        .single();

      if (!data) return;

      try {
        // Use axios to submit the data to the backend API
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/survey/submit-survey`,
          {
            email,
            step1: data.data.step1,
            step2: data.data.step2,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        // If the request is successful, update status in Supabase
        if (response.status === 200) {
          await supabase
            .from("questions")
            .update({ status: "completed" })
            .eq("email", email);
        }
      } catch (error) {
        console.error("Error submitting data:", error);
      }
    };

    // Only run submitToMongoDB if email is available
    if (email) {
      submitToMongoDB();
    }
  }, [email]);

  const handleBack = () => {
    if (email) {
      router.push(`/page2?email=${email}`);
    } else {
      console.log("Email is undefined, cannot navigate back.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#4D4D4D] to-[#010101]">
      <div className="relative flex w-full max-w-6xl overflow-hidden px-4 md:px-10 flex-col md:flex-row">
        <div className="absolute top-0 left-0 z-0 opacity-80">
          <Image
            src={unionShape}
            alt="Arrow Shape"
            width={250}
            height={300}
            className="opacity-80"
          />
        </div>

        <div className="relative w-full sm:w-1/2 flex items-center justify-center z-10 mb-8 sm:mb-0">
          <Image
            src={shoeImage}
            alt="Shoe"
            width={250}
            height={250}
            priority
            className="w-auto h-auto sm:w-2/3 md:w-3/4 lg:w-1/2 z-10"
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

        <div className="w-full sm:w-1/2 p-6 sm:p-10 flex flex-col justify-center text-center sm:text-left z-20">
          <h1 className="text-white text-right text-[50px] md:text-[80.35px] font-bold leading-[60px] md:leading-[105.15px] font-signika">
            THANK YOU
          </h1>
          <p className="text-lg sm:text-xl text-white mb-6 text-right">
            for your feedback!
          </p>

          <div className="flex justify-center sm:justify-start gap-4">
          <button
  onClick={handleBack}
  className="bg-[#EDB6D2] text-black font-bold px-6 py-3 rounded-full transition hover:bg-[#EDB6D2] flex items-center gap-2"
>
  <svg
    width="24"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="icon"
  >
    <path
      d="M4 20L20 4M20 4V16M20 4H8"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
  Back
</button>

<button
  onClick={() => router.push("/")}
  className="bg-white text-black font-bold px-6 py-3 rounded-full transition hover:bg-lime-400 flex items-center gap-2"
>
  Back to Home
  <svg
    width="24"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="icon"
  >
    <path
      d="M4 20L20 4M20 4V16M20 4H8"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
