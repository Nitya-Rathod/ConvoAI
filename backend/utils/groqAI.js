// const getAPIresponse = async (message) => {
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "openai/gpt-oss-20b",
//       messages: [
//         {
//           role: "user",
//           content: message,
//         },
//       ],
//     }),
//   };

//   try {
//     const response = await fetch(
//       "https://api.groq.com/openai/v1/chat/completions",
//       options,
//     );
//     const data = await response.json();

//     if (data.error) {
//       console.log("Groq API error:", data.error);
//       throw new Error(data.error.message || "Groq API request failed");
//     }

//     return data.choices[0].message.content;
//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// };

// export default getAPIresponse;

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
          role: "system",
          content:
            "You are a helpful, conversational assistant. Respond the way a knowledgeable person would in a natural chat — mostly in plain prose. " +
            "Only use Markdown structure (headers, tables, numbered lists) when the content genuinely calls for it — for example, a direct comparison between two or more things, step-by-step instructions, or code. " +
            "For general explanations, opinions, advice, or casual questions, write in clear paragraphs instead of breaking everything into tables and bullet points. " +
            "Keep responses reasonably concise — don't pad with unnecessary sections or restate the question as a heading.",
        },
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
