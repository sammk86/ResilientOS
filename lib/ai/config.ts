/**
 * AI Configuration
 * Centralized configuration for AI services (Groq)
 */

export const aiConfig = {
    groq: {
        apiKey: process.env.GROQ_API_KEY || '',
        model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
        temperature: 0.3, // Lower temperature for more consistent, focused analysis
    },
    enabled: !!process.env.GROQ_API_KEY,
} as const;
