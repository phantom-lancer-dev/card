export const GEMINI_MODEL = 'models/gemini-3-flash-preview';

export const CARD_PROMPT = `
Analyze this business card image and extract the following information 
in JSON format. 

Instructions:
1. Be strict—only extract what is clearly visible or inferred from a QR code.
2. If a field is missing, return null. DO NOT use placeholders like "N/A" or "Unknown".
3. Check for a QR code. If one is present and visually decodable as a URL or vCard, use its content to fill in missing details (e.g., website, email, phone).
4. If a URL is found (text or QR), prioritize it for the 'website' field.

Required JSON structure:
{
  "name": "string or null",
  "company": "string or null",
  "phone": ["string array of phone numbers"],
  "email": ["string array of emails"],
  "website": "string or null",
  "description": "string (what company does, or person's role)",
  "tags": ["array of 2-4 relevant category tags"]
}

Return ONLY valid JSON.
`;

export const APP_STORAGE_KEY = 'cardsnap_data_v2'; // Bumped version to force fresh start or handling