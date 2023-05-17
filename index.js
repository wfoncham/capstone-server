const { Configuration, OpenAIApi } = require('openai');
const cors = require('cors')
const express = require("express");

const app = express();
app.use(cors())
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function generatePrompt(gender, letter, region) {
    let genderString = ''
    if (gender === 'M') {
      genderString = 'boy'
    }
    else if (gender === 'F') {
      genderString = 'girl'
    }
    return `Suggest one random ${genderString} name from ${region} starting with the letter ${letter}`;
  }
  

//call the openai completion endpoint
app.post("/", async (req,res)=>{

    if (!configuration.apiKey) {
        res.status(500).json({
          error: {
            message: "OpenAI API key not configured.",
          }
        });
        return;
      }
    
      const gender = req.body.gender.toUpperCase() || '';
      if (gender.trim().length === 0) {
        res.status(400).json({
          error: {
            message: "Please enter a valid gender",
          }
        });
        return;
      }
      const letter = req.body.letter.toUpperCase() || '';
      if (letter.trim().length === 0) {
        res.status(400).json({
          error: {
            message: "Please enter a valid letter",
          }
        });
        return;
      }
      const region = req.body.region || '';
      if (region.trim().length === 0) {
        res.status(400).json({
          error: {
            message: "Please enter a valid region",
          }
        });
        return;
      }
    
      try {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: generatePrompt(gender, letter, region),
          temperature: 0.9,
        });
        console.log(JSON.stringify(completion.data.choices));
        res.status(200).json({ result: completion.data.choices[0].text });
      } catch(error) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
          console.error(error.response.status, error.response.data);
          res.status(error.response.status).json(error.response.data);
        } else {
          console.error(`Error with OpenAI API request: ${error.message}`);
          res.status(500).json({
            error: {
              message: 'An error occurred during your request.',
            }
          });
        }
      }
    


});

app.listen(process.env.PORT || 5000);