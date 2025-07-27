export async function getInfo(promptText) {
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;; 

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    // console.log("Gemini Raw Response:", JSON.stringify(data, null, 2));

    const res= data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    return res.replace(/\*/g, '');
  } catch (error) {
    console.log("Error fetching info from Gemini:", error);
    return "Error fetching data.";
  }
}
