import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import supabase from '../utils/supabaseClient';

const Step3 = () => {
  const [selectedScores, setSelectedScores] = useState({ comfort: null, looks: null, price: null });
  const [errors, setErrors] = useState({ comfort: false, looks: false, price: false });

  const router = useRouter();
  const { email } = router.query;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!email) return; 

      try {
        console.log('Fetching survey progress for email:', email); 
        const response = await axios.get(`http://localhost:5001/api/survey/progress?email=${email}`);
        console.log('Survey progress:', response.data);
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
          return;
        }

    
        try {
          const response = await axios.post('http://localhost:5001/api/survey/submit-survey', {
            email,
            step1: data.data.step1,  
            step2: data.data.step2,  
            step3: selectedScores,   
          });

          
          if (response.status === 200) {
            router.push('/thank-you');
          } else {
            console.error('Failed to submit survey:', response.data);
          }
        } catch (axiosError) {
          console.error('Axios Error:', axiosError);
        }
      } catch (error) {
        console.error('Error submitting survey:', error);
      }
    }
  };

  const handleBack = () => {
    router.push(`/page2?email=${email}`); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#4D4D4D] to-[#010101] p-4">
      <div className=" max-w-lg w-full p-6 text-center space-y-6">
        <h2 className="text-white font-bold  uppercase text-xs tracking-wide">Question 2</h2>
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
              <p className="text-red-500  text-left mt-2 text-sm">Please select a score</p>
            )}
          </div>
        ))}
        <div className="flex justify-between pt-6">
          <button className="bg-pink-200 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-pink-300 transition duration-200" 
          onClick={handleBack}>
             ↖️  Back
          </button>
          <button
            onClick={handleSubmit}
            className="bg-white text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-pink-300 transition duration-200"
          >
            Send  ↗️
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3;
