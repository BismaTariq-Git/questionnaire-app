import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../utils/supabaseClient';
import blackShoe from '../public/black.png'; 
import OrangeShoe from '../public/orangeshoe.png'; 
import Image from 'next/image';

const Step2 = () => {
  const [choice, setChoice] = useState('');
  const [surveyData, setSurveyData] = useState({});  
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const router = useRouter();
  const { email } = router.query;

  
  useEffect(() => {
    if (!email) {
      console.log('No email found in URL parameters');
      return; 
    }

    const fetchProgress = async () => {
      setLoading(true);
      console.log('Fetching data for email:', email);
      
   
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('email', email);

      if (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        return;
      }

      
      if (data.length === 0) {
        console.log('No data found for user, creating new record');
        await supabase
          .from('questions')
          .upsert({
            email,
            data: {}, 
            step: 1,
            status: 'in-progress',
          });
        setSurveyData({ data: {} });
      } else {
        console.log('User data found:', data);
        setSurveyData(data[0].data || {}); 
      }
      setLoading(false);
    };

    fetchProgress();
  }, [email]);

 
  const handleNext = async () => {
    if (!choice) {
        setError('Please select one option'); 
        return;
    }

    const updatedData = {
        ...surveyData, 
        step1: surveyData.step1 || '', 
        step2: {
            choice: choice,  
        }
    };

    try {
    
        const { data, error: fetchError } = await supabase
            .from('questions')
            .select('*')
            .eq('email', email);

        if (fetchError) {
            console.error("Error fetching data:", fetchError);
            alert("There was an issue fetching your data. Please try again.");
            return;
        }

        if (data.length === 0) {
            
            const { error: insertError } = await supabase
                .from('questions')
                .insert([
                    {
                        email,
                        data: updatedData,
                        step: 2,
                        status: 'in-progress',
                    },
                ]);

            if (insertError) {
                console.error("Error inserting data:", insertError);
                alert("There was an issue saving your progress. Please try again.");
                return;
            }
        } else {
        
            const { error: updateError } = await supabase
                .from('questions')
                .update({
                    data: updatedData,
                    step: 2,
                    status: 'in-progress',
                })
                .eq('email', email); 

            if (updateError) {
                console.error("Error updating data:", updateError);
                alert("There was an issue saving your progress. Please try again.");
                return;
            }
        }

       
        router.push(`/page3?email=${email}`);
    } catch (err) {
        console.error("Unexpected error:", err);
        alert("An unexpected error occurred. Please try again.");
    }
};

 
  const handlePrevious = () => {
    router.push(`/?email=${email}`);
  };

  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#4D4D4D] to-[#010101] text-white p-4">
      <h3 className="text-center font-signika font-bold text-[16.01px] leading-[19.72px] mb-2 decoration-white underline-offset-2" style={{ color: '#B6B6B6' }}>
        Question 2
      </h3>
      <h2 className="text-xl font-bold mb-4">What is your preferred choice?</h2>

      <div className="flex gap-4 sm:gap-6 mb-6 justify-center flex-wrap">
        <div
          onClick={() => setChoice('Nike Orange')}
          className={`cursor-pointer p-4 bg-[#6D6D6D] rounded-lg ${choice === 'Nike Orange' ? 'border-4 border-green-500' : ''} w-[150px] sm:w-[180px] flex flex-col items-center`}
        >
          <p className="text-center mt-2">Nike Orange</p>
          <Image src={OrangeShoe} alt="Nike Orange" width={160} height={160} className="rounded-lg" />
        </div>
        <div
          onClick={() => setChoice('Nike Black')}
          className={`cursor-pointer p-4 bg-[#6D6D6D] rounded-lg ${choice === 'Nike Black' ? 'border-4 border-green-500' : ''} w-[150px] sm:w-[180px] flex flex-col items-center`}
        >
          <p className="text-center mt-2">Nike Black</p>
          <Image src={blackShoe} alt="Nike Black" width={160} height={160} className="rounded-lg" />
        </div>
      </div>

     
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex gap-20 justify-center">
        <button
          onClick={handlePrevious}
          className="bg-pink-200 px-6 py-3  text-black font-bold rounded-full hover:bg-gray-700 transition"
        >
         ↖️ Back
        </button>
        <button
          onClick={handleNext}
          className="bg-lime-400 px-6 py-3 text-black font-bold rounded-full hover:bg-lime-500 transition"
        >
          Next ↗️
        </button>
      </div>
    </div>
  );
};

export default Step2;
