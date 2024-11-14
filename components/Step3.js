import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import supabase from '../utils/supabaseClient';

const Step3 = () => {
  const [selectedScores, setSelectedScores] = useState({ comfort: null, looks: null, price: null });
  const [errors, setErrors] = useState({ comfort: false, looks: false, price: false });
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();
  const { email } = router.query;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!email) return;

      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('email', email)
          .single();

        if (error) {
          console.error("Error fetching data:", error);
          return;
        }

        if (data && data.data.step3) {
          setSelectedScores({
            comfort: data.data.step3.comfort || null,
            looks: data.data.step3.looks || null,
            price: data.data.step3.price || null,
          });
        }
      } catch (error) {
        console.error('Error fetching survey progress:', error);
      }
    };

    fetchProgress();
  }, [email]);

  const handleScoreChange = (aspect, score) => {
    setSelectedScores((prevScores) => ({
      ...prevScores,
      [aspect]: score,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [aspect]: false,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      comfort: !selectedScores.comfort,
      looks: !selectedScores.looks,
      price: !selectedScores.price,
    };
    setErrors(newErrors);

    if (!Object.values(newErrors).includes(true)) {
      setLoading(true); // Set loading to true when submission starts

      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('email', email)
          .single();

        if (error) {
          console.error("Error fetching data:", error);
          setLoading(false); // Reset loading state on error
          return;
        }

        const updatedData = {
          ...data.data,
          step3: selectedScores,
        };

        const { error: upsertError } = await supabase
          .from('questions')
          .upsert({
            email,
            data: updatedData,
            step: 3,
            status: 'completed',
          }, { onConflict: ['email'] });

        if (upsertError) {
          console.error('Error updating survey:', upsertError);
          setLoading(false); // Reset loading state on error
          return;
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/survey/submit-survey`,
            {
              email,
              step1: data.data.step1,
              step2: data.data.step2,
              step3: selectedScores,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.status === 200) {
            router.push(`/thank-you?email=${email}`);
          } else {
            console.error('Failed to submit survey:', response.data);
          }
        } catch (axiosError) {
          console.error('Axios Error:', axiosError);
        }
      } catch (error) {
        console.error('Error submitting survey:', error);
      } finally {
        setLoading(false); // Reset loading state after submission attempt
      }
    }
  };

  const handleBack = () => {
    router.push(`/page2?email=${email}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#4D4D4D] to-[#010101] p-4">
      <div className=" max-w-lg w-full p-6 text-center space-y-6">
        <h2 className="text-white font-bold uppercase text-xs tracking-wide">Question 2</h2>
        <h1 className="text-xl font-semibold text-white">
          How important are these aspects for you?
        </h1>
        {['comfort', 'looks', 'price'].map((aspect, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center font-bold justify-between bg-white rounded-full px-4 py-2">
              <span className="text-black capitalize">{aspect}</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreChange(aspect, score)}
                    className={`w-6 h-6 rounded-full ${selectedScores[aspect] >= score ? 'bg-black' : 'bg-gray-500'} focus:outline-none`}
                  ></button>
                ))}
              </div>
            </div>
            {errors[aspect] && (
              <p className="text-red-500 text-left mt-2 text-sm">Please select a score</p>
            )}
          </div>
        ))}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleBack}
            className="bg-pink-200 px-6 py-3 text-black font-bold rounded-full hover:bg-gray-700 transition flex items-center gap-2"
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
                d="M20 20L4 4M4 4V16M4 4H16"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading} // Disable button when loading
            className="bg-white text-gray-800 w-full sm:w-auto px-4 sm:px-6 py-2 rounded-full font-semibold hover:bg-pink-300 transition duration-200 text-sm sm:text-base flex items-center justify-center"
          >
            {loading ? (
              <svg
                className="w-5 h-5 animate-spin mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v4m0 0l2-2m-2 2l-2-2m2 0l2 2"
                />
              </svg>
            ) : (
              <>
                Submit <span className="ml-2">↗️</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


export default Step3;
