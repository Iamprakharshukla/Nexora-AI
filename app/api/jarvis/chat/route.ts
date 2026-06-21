import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getLocalMockResponse(message: string, properties: any[]) {
  const q = message.toLowerCase().trim();
  
  // 1. Check for greetings
  const greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'hola', 'start', 'starr'];
  const isGreeting = greetings.some(g => q === g || q.startsWith(g + ' ') || q.startsWith(g + ',') || q.startsWith(g + '!'));
  
  // 2. Extract criteria
  let city: string | null = null;
  if (q.includes('mumbai') || q.includes('bombay')) city = 'Mumbai';
  else if (q.includes('gurugram') || q.includes('gurgaon')) city = 'Gurugram';
  else if (q.includes('bengaluru') || q.includes('bangalore')) city = 'Bengaluru';
  else if (q.includes('delhi') || q.includes('ncr')) city = 'Delhi';
  else if (q.includes('pune')) city = 'Pune';
  else if (q.includes('hyderabad')) city = 'Hyderabad';

  let bhk: number | null = null;
  const bhkMatch = q.match(/(\d+)\s*bhk/);
  if (bhkMatch) bhk = parseInt(bhkMatch[1]);

  let maxPrice: number | null = null;
  const croreMatch = q.match(/(?:under|below|less than|within)\s*(?:rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:crore|cr)/);
  const lakhMatch = q.match(/(?:under|below|less than|within)\s*(?:rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)/);
  if (croreMatch) maxPrice = parseFloat(croreMatch[1]) * 10000000;
  else if (lakhMatch) maxPrice = parseFloat(lakhMatch[1]) * 100000;

  let category: string | null = null;
  if (q.includes('villa') || q.includes('mansion')) category = 'Villa';
  else if (q.includes('penthouse') || q.includes('duplex')) category = 'Penthouse';
  else if (q.includes('apartment') || q.includes('flat')) category = 'Apartment';

  let purpose: 'BUY' | 'RENT' | null = null;
  if (q.includes('rent') || q.includes('lease')) purpose = 'RENT';
  else if (q.includes('buy') || q.includes('sale') || q.includes('purchase')) purpose = 'BUY';

  // 3. Formulate response based on intent
  if (isGreeting) {
    return {
      reply: "Namaste and welcome to Nexora Luxury Estates. I am Jarvis, your digital concierge. How may I assist you with your premium property search today? I can help you find villas, duplexes, or apartments across Mumbai, Gurugram, Bengaluru, and other elite hubs.",
      matchedPropertyIds: properties.slice(0, 3).map(p => p.id)
    };
  }

  if (q.includes('who are you') || q.includes('what can you do') || q.includes('how work') || q.includes('help')) {
    return {
      reply: "I am Jarvis, Nexora's AI real estate advisor. I specialize in sourcing ultra-luxury estates, analyzing market yields, and coordinating site visits for our elite clients. You can ask me to find specific BHK configurations, villas under a target budget, or rental listings in any premium locality.",
      matchedPropertyIds: []
    };
  }

  if (q.includes('visit') || q.includes('schedule') || q.includes('book') || q.includes('contact') || q.includes('call')) {
    return {
      reply: "I would be delighted to schedule a private walkthrough or site visit for you. Please let me know your preferred date and time, or drop your contact details in our listing wizard, and our relationship managers will coordinate it immediately.",
      matchedPropertyIds: []
    };
  }

  // Filter properties based on extracted search criteria
  const filtered = properties.filter(p => {
    if (city && p.city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
    if (bhk && p.bhk && p.bhk !== bhk) return false;
    if (maxPrice && p.price && p.price > maxPrice) return false;
    if (category && p.category && !p.category.toLowerCase().includes(category.toLowerCase())) return false;
    if (purpose && p.purpose && p.purpose !== purpose) return false;
    return true;
  });

  if (filtered.length > 0) {
    const firstP = filtered[0];
    const cityText = city ? ` in ${city}` : '';
    const bhkText = bhk ? ` featuring ${bhk} BHK` : '';
    const typeText = category ? ` ${category}s` : ' luxury portfolios';
    const priceText = maxPrice ? ` under ₹${(maxPrice / 10000000).toFixed(1)} Cr` : '';

    const reply = `I searched our database and curated an exclusive selection of **${filtered.length}${typeText}**${cityText}${bhkText}${priceText} matching your criteria. Among these is the prestigious **${firstP.name}** in ${firstP.locality || 'Elite Locality'}, ${firstP.city}. Here are the matched portfolios:`;

    return {
      reply,
      matchedPropertyIds: filtered.map(p => p.id)
    };
  }

  // Default Fallback search
  const activeCity = city || 'Mumbai';
  const fallbackProps = properties.filter(p => p.city?.toLowerCase().includes(activeCity.toLowerCase()));
  const showProps = fallbackProps.length > 0 ? fallbackProps.slice(0, 3) : properties.slice(0, 3);
  
  const reply = `I couldn't locate an exact match for that configuration in our active portfolios. However, here are some of our finest listings ${city ? `in ${city}` : ''} that represent peak architectural elegance and high investment value:`;

  return {
    reply,
    matchedPropertyIds: showProps.map(p => p.id)
  };
}

export async function POST(req: NextRequest) {
  let messageText = '';
  let propertiesList: any[] = [];
  try {
    const { message, history } = await req.json();
    messageText = message || '';

    if (!message) {
      return apiError('Message is required.', 400);
    }

    // Retrieve approved properties
    const properties = await prisma.property.findMany({
      where: { isApproved: true }
    });
    propertiesList = properties;

    // Try calling Python ML Chatbot Server first!
    try {
      const pythonRes = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, history })
      });

      if (pythonRes.ok) {
        const pythonData = await pythonRes.json();
        return apiResponse({
          reply: pythonData.reply,
          matchedPropertyIds: pythonData.matchedPropertyIds || [],
          isMl: true,
          intent: pythonData.intent
        });
      }
      console.warn('[Jarvis Chat API] Python ML server returned non-ok response. Falling back.');
    } catch (pythonErr) {
      console.warn('[Jarvis Chat API] Python ML server is offline or unreachable. Falling back.');
    }

    // Fallback to Google Gemini (if API Key is present) or Local Mock
    const propertiesContext = properties.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      city: p.city,
      locality: p.locality,
      bhk: p.bhk,
      category: p.category,
      purpose: p.purpose,
      carpetArea: p.carpetArea,
      facing: p.facing,
      furnishing: p.furnishing
    }));

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const mockRes = getLocalMockResponse(messageText, propertiesList);
      return apiResponse(mockRes);
    }

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are Jarvis, a highly professional AI Real Estate Chatbot for Nexora Luxury Estates. 
The client is looking for properties or asking questions.
Here is the chat history:
${JSON.stringify(history || [])}
Current user message: "${messageText}"

Here is the database of available luxury properties:
${JSON.stringify(propertiesContext)}

Provide a reply in a professional real-estate advisor tone. Bold key property names or parameters if appropriate.
If the user is inquiring or searching for properties matching certain parameters (like city, BHK, category, price, purpose), search the property database and list the IDs of matches in 'matchedPropertyIds'. If they are not searching for properties, return an empty array.

Return EXACTLY a JSON object matching this schema:
{
  "reply": "string (conversational Markdown response)",
  "matchedPropertyIds": ["string (matching property IDs)"]
}
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    const parsed = JSON.parse(text);

    return apiResponse({
      reply: parsed.reply,
      matchedPropertyIds: parsed.matchedPropertyIds || []
    });
  } catch (err) {
    console.error('[Jarvis Chat API] Error during Gemini generation, falling back:', err);
    try {
      const fallbackMock = getLocalMockResponse(messageText || 'hi', propertiesList.length > 0 ? propertiesList : await prisma.property.findMany({ where: { isApproved: true } }));
      return apiResponse(fallbackMock);
    } catch (fallbackErr) {
      console.error('[Jarvis Chat API] Error in fallback:', fallbackErr);
      return apiError('Failed to process request.', 500);
    }
  }
}
