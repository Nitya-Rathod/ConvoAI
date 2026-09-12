import dotenv from "dotenv";

const getAPIresponse = async (message) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  };

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      options,
    );
    const data = await response.json();

    if (data.error) {
      console.log("Groq API error:", data.error);
      throw new Error(data.error.message || "Groq API request failed");
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default getAPIresponse;
