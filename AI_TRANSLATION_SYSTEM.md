# AI-Powered Translation System

## Overview

The app now uses **AI Backend for dynamic translation** instead of hardcoded translation files. This provides:

- ✅ **Unlimited language support** - Add any language without code changes
- ✅ **Context-aware translations** - AI understands app context for better translations
- ✅ **Automatic caching** - Fast performance with local storage
- ✅ **Fallback support** - Works offline with cached translations
- ✅ **6 pre-translated + unlimited AI languages**

## Architecture

### 1. **Translation Service** (`utils/aiTranslation.ts`)
- Manages translation cache in AsyncStorage
- Batch translates text for efficiency
- 7-day cache expiry
- Automatic retry and fallback

### 2. **Backend API** (`utils/hustleAI.ts`)
```typescript
await hustleAI.translate({
  text: ['Hello', 'Welcome'],
  targetLanguage: 'es',
  sourceLanguage: 'en',
  context: 'HustleXP mobile app',
});
```

### 3. **Language Context** (`contexts/LanguageContext.tsx`)
- Toggle between **pre-translated** (6 languages) and **AI translation** (unlimited)
- Seamless language switching
- Real-time translation with caching

## Supported Languages

### Pre-Translated (Static)
- 🇺🇸 English
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇨🇳 Chinese (中文)
- 🇯🇵 Japanese (日本語)

### AI-Translated (Dynamic)
When AI Translation is enabled, you get:
- 🇸🇦 Arabic (العربية)
- 🇧🇷 Portuguese (Português)
- 🇷🇺 Russian (Русский)
- 🇮🇳 Hindi (हिन्दी)
- 🇰🇷 Korean (한국어)
- 🇮🇹 Italian (Italiano)
- **ANY other language** - Just add to the list!

## How It Works

### 1. **Toggle AI Translation** (Settings)
```
Settings → Language & Region → 🤖 AI Translation
```

### 2. **Translation Flow**

**Without AI Translation:**
```
User selects Spanish → Uses pre-translated content from constants/translations.ts
```

**With AI Translation:**
```
User selects Portuguese (not pre-translated)
↓
App fetches English text
↓
Checks local cache
↓
If not cached: Calls backend AI translation
↓
Caches result for 7 days
↓
Displays translated text
```

### 3. **Performance Optimization**

- **Batch requests**: Groups multiple texts into one API call
- **Smart caching**: Stores translations locally
- **Cache warming**: Preloads common phrases
- **Fallback**: Shows English if backend unavailable

## Backend Implementation Needed

Your Replit backend needs to add this endpoint:

```python
@app.post("/api/translate")
async def translate(request: TranslateRequest):
    """
    Translate texts using AI
    
    Request:
    {
        "texts": ["Hello", "Welcome"],
        "targetLanguage": "es",
        "sourceLanguage": "en",
        "context": "mobile app UI"
    }
    
    Response:
    {
        "translations": ["Hola", "Bienvenido"]
    }
    """
    # Use OpenAI/Anthropic/etc for translation
    prompt = f"""
    Translate the following texts from {sourceLanguage} to {targetLanguage}.
    Context: {context}
    Maintain tone and formality appropriate for a mobile app interface.
    
    Texts: {texts}
    
    Return only the translations in the same order, as a JSON array.
    """
    
    # Call your AI service
    response = await ai_service.translate(prompt)
    return {"translations": response}
```

## Usage Examples

### In Components

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function MyComponent() {
  const { t, currentLanguage, useAITranslation } = useLanguage();
  
  return (
    <View>
      <Text>{t('common.accept')}</Text>
      <Text>{t('tasks.instantMatch')}</Text>
      
      {useAITranslation && (
        <Badge>AI-Powered</Badge>
      )}
    </View>
  );
}
```

### Direct Translation

```typescript
import { aiTranslationService } from '@/utils/aiTranslation';

// Translate user-generated content
const translated = await aiTranslationService.translate(
  taskDescription,
  'fr',
  'en'
);
```

## Benefits

### For Users
- 🌍 Access app in their native language
- 🚀 Fast performance with caching
- ✨ Natural, context-aware translations
- 📱 Works offline with cached content

### For Developers
- 🎯 No manual translation files to maintain
- 🔄 Add languages instantly
- 📊 Translation analytics from backend
- 🛠 Easy to update/improve translations

## Settings UI

Users can toggle AI translation in Settings:

```
┌─────────────────────────────┐
│ 🌐 Language & Region        │
├─────────────────────────────┤
│ 🇫🇷 Language                │
│ Français              →     │
├─────────────────────────────┤
│ 🤖 AI Translation           │
│ Backend AI translating      │
│ all content           ●─────│
└─────────────────────────────┘
```

## Cache Management

```typescript
// Clear cache
await aiTranslationService.clearCache();

// Preload common phrases
await aiTranslationService.preloadLanguage('es', [
  'Welcome',
  'Sign In',
  'Tasks',
  // ... more phrases
]);
```

## Future Enhancements

- [ ] Voice translation
- [ ] Image text translation (OCR)
- [ ] Real-time chat translation
- [ ] Translation quality feedback
- [ ] Offline ML model for basic translations
- [ ] User-contributed translations
- [ ] Regional dialect support

## Notes

- **Fallback**: If AI backend is down, falls back to English or cached translations
- **Cost**: Each unique text+language combo is translated once then cached
- **Privacy**: Translations are processed by your backend (you control the data)
- **Quality**: AI provides context-aware, natural translations
