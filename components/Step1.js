import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import shoeImage from "../public/Shoe.png"
import unionShape from "../public/arrow.png";
import supabase from "../utils/supabaseClient";

const Step1 = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleStartSurvey = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

  
    if (!email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
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
        setError("An error occurred while checking your survey status.");
        setLoading(false);
        return;
      }

      const userProgress = data[0];

      if (userProgress?.status === "completed") {
        router.push("/thank-you");
      } else if (userProgress?.status === "in-progress") {
        router.push(`/page${userProgress.step }?email=${email}`);
      } else {
        router.push(`/page2?email=${email}`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-800 to-black">
      <div className="relative flex w-full max-w-6xl px-4 md:px-10 flex-col md:flex-row">
        <Image
          src={unionShape}
          alt="Arrow Shape"
          width={300}
          height={300}
          className="absolute top-0 left-0 z-0 opacity-80"
        />

        <div className="relative w-full sm:w-1/2 flex items-center justify-center z-10 mb-8 sm:mb-0">
          <Image
            src={shoeImage}
            alt="Shoe"
            width={600}
            height={500}
            priority
            className="w-auto h-auto sm:w-2/3 md:w-3/4 lg:w-3/5 transform -translate-y-8 -translate-x-5"
          />
        </div>

        <div className="w-full sm:w-1/2 p-10 flex flex-col justify-center z-20">
          <h1 className="text-3xl font-bold mb-4 text-center text-white">
            Questionnaire
          </h1>
          <div className="bg-pink-200 p-4 rounded-lg text-gray-800 mb-6">
            <h2 className="text-lg font-semibold">Welcome!</h2>
            <p className="text-sm">
              We&apos;re excited to hear your thoughts, ideas, and insights! Your
              genuine feedback is invaluable to us!
            </p>
          </div>

          <form onSubmit={handleStartSurvey} className="space-y-4">
            <div className="relative">
              <input
                
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 rounded-full bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 `}
                aria-describedby={error ? "error-message" : undefined}
              />
              {error && (
                <p
                  id="error-message"
                  className="text-red-500 text-sm mt-2"
                  aria-live="assertive"
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-full bg-lime-400 hover:bg-lime-500 transition-colors text-black font-semibold flex justify-between items-center mt-4"
            >
              {loading ? "Loading..." : "Start Survey"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Step1;
