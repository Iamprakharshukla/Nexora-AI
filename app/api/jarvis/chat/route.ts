import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getLocalMockResponse(message: string, properties: any[]) {
  const q = message.toLowerCase();
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

  const filtered = properties.filter(p => {
    if (city && p.city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
    if (bhk && p.bhk && p.bhk !== bhk) return false;
    if (maxPrice && p.price && p.price > maxPrice) return false;
    if (category && p.category && !p.category.toLowerCase().includes(category.toLowerCase())) return false;
    if (purpose && p.purpose && p.purpose !== purpose) return false;
    return true;
  });

  let reply = '';
  if (filtered.length > 0) {
    reply = `Namaste! I searched our exclusive luxury database and found **${filtered.length} properties** matching your request. Here is what we recommend:`;
  } else {
    reply = `Hello! I couldn't find exact matches for that request, but here are some of our preeminent estates from our general collection:`;
  }

  return {
    reply,
    matchedPropertyIds: (filtered.length > 0 ? filtered : properties.slice(0, 3)).map(p => p.id),
    isMocked: true
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
      console.warn('[Jarvis Chat API] GEMINI_API_KEY is not defined in .env. Using mock fallback mode.');
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
      return apiResponse({
        ...fallbackMock,
        reply: `*(Note: Using backup mode due to API key expiry/limitations)*\n\n${fallbackMock.reply}`
      });
    } catch (fallbackErr) {
      console.error('[Jarvis Chat API] Error in fallback:', fallbackErr);
      return apiError('Failed to process request.', 500);
    }
  }
}
