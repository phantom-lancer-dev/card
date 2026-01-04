import { CardData } from "../types";
import { APP_STORAGE_KEY } from "../constants";

const API_KEY_STORAGE_KEY = 'cardsnap_gemini_api_key';

// Helper to migrate old data format to new format
const migrateCard = (card: any): CardData => {
  return {
    ...card,
    phone: Array.isArray(card.phone) ? card.phone : (card.phone ? [card.phone] : []),
    email: Array.isArray(card.email) ? card.email : (card.email ? [card.email] : []),
  };
};

export const getCards = (): CardData[] => {
  try {
    const data = localStorage.getItem(APP_STORAGE_KEY);
    // Fallback to check v1 key if v2 is empty? 
    // For simplicity in this env, we just try to load and migrate whatever is there.
    if (!data) {
        const v1Data = localStorage.getItem('cardsnap_data_v1');
        if (v1Data) {
            const parsed = JSON.parse(v1Data);
            const migrated = parsed.map(migrateCard);
            // Save to new key
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(migrated));
            return migrated;
        }
        return [];
    }

    const parsed = JSON.parse(data);
    return parsed.map(migrateCard);
  } catch (e) {
    console.error("Failed to load cards", e);
    return [];
  }
};

export const saveCard = (card: CardData): CardData[] => {
  const cards = getCards();
  const index = cards.findIndex((c) => c.id === card.id);
  
  let newCards;
  if (index >= 0) {
    newCards = [...cards];
    newCards[index] = card;
  } else {
    newCards = [card, ...cards];
  }
  
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(newCards));
  return newCards;
};

export const deleteCard = (id: string): CardData[] => {
  const cards = getCards();
  const newCards = cards.filter((c) => c.id !== id);
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(newCards));
  return newCards;
};

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const saveApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const mockSyncToSheets = async (card: CardData): Promise<void> => {
  // Simulate network delay for sync
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Synced card ${card.id} to Google Sheets`);
      resolve();
    }, 1500);
  });
};