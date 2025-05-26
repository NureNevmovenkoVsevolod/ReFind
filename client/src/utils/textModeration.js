const profanityRegex = /\b(fuck|shit|bitch|cunt|ass)\b/gi;

// Базова перевірка на матюки та расистські вислови
const containsProfanity = (text) => {
  if (!text) return false;
  return profanityRegex.test(text);
};

// Перевірка на спам-паттерни
const containsSpamPatterns = (text) => {
  if (!text) return false;
  // Перевірка на повторювані символи
  const repeatedCharsPattern = /(.)\1{4,}/;
  // Перевірка на CAPS LOCK
  const capsPattern = /^[A-Z\s]{4,}$/;
  // Перевірка на спам-посилання
  const spamLinksPattern = /(https?:\/\/[^\s]+)/g;

  return (
    repeatedCharsPattern.test(text) ||
    capsPattern.test(text) ||
    (text.match(spamLinksPattern) || []).length > 2
  );
};

// Перевірка на образливі слова через API
const checkWithModerationAPI = async (text) => {
  try {
    const response = await fetch(process.env.REACT_APP_SERVER_URL + "/api/moderation/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return data.isInappropriate || false;
  } catch (error) {
    console.error("Error checking text with moderation API:", error);
    return false;
  }
};

// Головна функція перевірки тексту
export const validateText = async (text) => {
  if (!text) return { isValid: true };

  // Локальні перевірки
  if (containsProfanity(text)) {
    return {
      isValid: false,
      error: "Text contains inappropriate language"
    };
  }

  if (containsSpamPatterns(text)) {
    return {
      isValid: false,
      error: "Text contains spam patterns"
    };
  }

  // Перевірка через API
  const isInappropriate = await checkWithModerationAPI(text);
  if (isInappropriate) {
    return {
      isValid: false,
      error: "Text contains inappropriate content"
    };
  }

  return { isValid: true };
};
