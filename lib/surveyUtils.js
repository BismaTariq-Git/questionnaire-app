//EXTRE FILEEE


import connectToDatabase from './mongodb';
import SurveyResponse from '../models/Survey';
import supabase from './supabaseClient';

// Check survey status in Supabase
export const checkSurveyStatus = async (email) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('status')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching survey status from Supabase:', error);
      return null;
    }
    
    return data?.status ?? null;
  } catch (error) {
    console.error('Error in checkSurveyStatus:', error);
    return null;
  }
};

// Get in-progress survey from Supabase
export const getInProgressSurvey = async (email) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('step, data, status')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching in-progress survey from Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getInProgressSurvey:', error);
    return null;
  }
};

// Get Survey Progress (New Function)
export const getSurveyProgress = async (email) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('step, status, data')
      .eq('email', email)
      

    if (error) {
      console.error('Error fetching survey progress:', error);
      return null;
    }

    return data ? { step: data.step, status: data.status, data: data.data } : null;
  } catch (error) {
    console.error('Error in getSurveyProgress:', error);
    return null;
  }
};

// Save survey progress to Supabase
export const saveSurveyProgress = async (email, step, data) => {
  // Validate input data
  if (!email || !step || !data) {
    console.error('Missing required fields: email, step, or data');
    return null;
  }

  // Check if an entry with this email already exists
  const { data: existingData, error: fetchError } = await supabase
    .from('questions')
    .select('email, data')
    .eq('email', email)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {  // 'PGRST116' means no rows found
    console.error('Error fetching survey data:', fetchError.message);
    return null;
  }

  let updatedData;

  if (existingData) {
    // If record exists, merge the new step data with the existing data
    const existingSurveyData = existingData.data || {};
    existingSurveyData[`step${step}`] = data;  // Add/update data for the current step

    // Update the existing record
    const { data: updatedSurveyData, error: updateError } = await supabase
      .from('questions')
      .update({
        data: existingSurveyData,  // Update the entire data object
        step,                      // Optionally update the current step
        status: 'in-progress',     // Keep the status as in-progress
      })
      .eq('email', email);

    if (updateError) {
      console.error('Error updating survey progress:', updateError.message);
      return null;
    }

    updatedData = updatedSurveyData;
  } else {
    // If no record exists, create a new record with the step data
    const { data: savedData, error: insertError } = await supabase
      .from('questions')
      .insert({
        email,
        step,
        data: { [`step${step}`]: data },  // Create data object for the first step
        status: 'in-progress',
      });

    if (insertError) {
      console.error('Error saving survey progress to Supabase:', insertError.message);
      return null;
    }

    updatedData = savedData;
  }

  return updatedData;
};

// Mark survey as completed in Supabase
export const markSurveyAsCompleted = async (email) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .update({ status: 'completed' })
      .eq('email', email);

    if (error) {
      console.error('Error marking survey as completed in Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in markSurveyAsCompleted:', error);
    return null;
  }
};

// Store completed survey in MongoDB
export const storeSurveyInMongoDB = async (surveyData) => {
  await connectToDatabase();

  if (!surveyData.email || !surveyData.first_question || !surveyData.second_question) {
    console.error('Incomplete survey data:', surveyData);
    return;
  }

  const survey = new SurveyResponse({
    email: surveyData.email,
    first_question: surveyData.first_question,
    second_question: surveyData.second_question,
    status: 'completed',
  });

  try {
    await survey.save();
    console.log('Survey successfully saved to MongoDB');
  } catch (error) {
    console.error('Error saving survey to MongoDB:', error);
  }
};

// Delete survey data from Supabase after completion
export const deleteSupabaseSurveyData = async (email) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .delete()
      .eq('email', email);

    if (error) {
      console.error('Error deleting Supabase survey data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteSupabaseSurveyData:', error);
    return null;
  }
};

// Function to call backend API for MongoDB storage
export const transferToMongoDB = async (surveyData) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/submit-survey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(surveyData),
    });

    if (!response.ok) {
      throw new Error('Failed to save survey data to MongoDB via backend API');
    }

    const result = await response.json();
    console.log('Survey data successfully transferred to MongoDB:', result);
    return result;
  } catch (error) {
    console.error('Error transferring survey data to MongoDB:', error);
    return null;
  }
};
