# 🚀 AI Translation - Quick Start Guide

## For Users

### How to Change Language:

1. **Open the app** → See the welcome screen
2. **Tap the globe icon** (🌍 top-right corner)
3. **Toggle "Enable AI Translation"** → Turn it ON
4. **Select your language** (e.g., Spanish 🇪🇸)
5. **Wait 10-20 seconds** → Watch the progress bar
6. **Done!** The entire app is now in your language

### Supported Languages:
- 🇺🇸 English
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇨🇳 Chinese (中文)
- 🇯🇵 Japanese (日本語)
- 🇸🇦 Arabic (العربية)
- 🇧🇷 Portuguese (Português)
- 🇷🇺 Russian (Русский)
- 🇮🇳 Hindi (हिन्दी)
- 🇰🇷 Korean (한국어)
- 🇮🇹 Italian (Italiano)

### Tips:
- **First time**: Takes 10-20 seconds to translate everything
- **Next time**: Instant! Everything is cached
- **Switching back**: Also instant from cache
- **Offline**: Once translated, works offline too

---

## For Developers

### Use Translation in Your Components:

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, currentLanguage } = useLanguage();
  
  return (
    <View>
      <Text>{t('common.accept')}</Text>
      <Text>{t('tasks.available')}</Text>
      <Text>{t('profile.level')}: {level}</Text>
    </View>
  );
}
```

### Translate Dynamic Content (Chat, Task Descriptions):

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function ChatComponent() {
  const { translateText } = useLanguage();
  
  const sendMessage = async (message: string, recipientLang: string) => {
    const translated = await translateText(message, recipientLang);
    // Send translated message to recipient
  };
}
```

### Use the Chat Translation Hook:

```typescript
import { useChatTranslation } from '@/hooks/useChatTranslation';

function ChatScreen() {
  const {
    translateMessage,
    translateToMyLanguage,
    isTranslating,
  } = useChatTranslation();
  
  const handleReceiveMessage = async (
    message: string,
    senderLang: string
  ) => {
    const result = await translateToMyLanguage(message, senderLang);
    
    if (result.isTranslated) {
      // Show: "Original: {originalText}"
      // "Translated: {translatedText}"
    }
  };
}
```

### Add New UI Text:

**Option 1: Use translation constants**
```typescript
// constants/translations.ts
export const translations = {
  en: {
    myFeature: {
      title: 'My New Feature',
      description: 'This is awesome',
    },
  },
};

// In component:
<Text>{t('myFeature.title')}</Text>
```

**Option 2: Add to translationExtractor.ts**
```typescript
// utils/translationExtractor.ts
const myFeatureTexts = [
  'My New Feature',
  'This is awesome',
];

myFeatureTexts.forEach(text => allTexts.add(text));
```

Then the AI will automatically translate it!

---

## Testing

### Manual Test:
1. Open app
2. Click globe icon
3. Enable AI translation
4. Select Spanish
5. Watch console logs:
```
[Language] Changing language to: es
[Language] Found 512 texts to translate
[Language] Translating batch 1/11 (50 texts)
...
[Language] ✅ Translation complete! 512 texts translated to es
```
6. Verify entire app is in Spanish
7. Switch to French → Should be instant if already cached
8. Switch back to Spanish → Should be instant

### Check Backend Health:
```bash
curl https://lunch-garden-dycejr.replit.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### Test Translation Endpoint:
```bash
curl -X POST https://lunch-garden-dycejr.replit.app/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": ["Tasks", "Profile", "Settings"],
    "targetLanguage": "es"
  }'
```

Should return:
```json
{
  "translations": ["Tareas", "Perfil", "Configuración"]
}
```

---

## Troubleshooting

### "Rate limit exceeded" error:
- **Wait 60 seconds** and try again
- The system automatically retries with backoff
- Check console: `[Language] Rate limited. Waiting 60s...`

### Translation not working:
1. Check if AI translation is enabled (toggle in language selector)
2. Check backend status: `curl https://lunch-garden-dycejr.replit.app/api/health`
3. Clear cache: Toggle AI translation OFF, then ON again
4. Check console logs for errors

### Backend not responding:
1. Check if Replit backend is running
2. Verify URL: `https://lunch-garden-dycejr.replit.app/api`
3. Check rate limits (120 requests/min)
4. The app will fallback to original text if backend is down

### Cache issues:
```typescript
// Clear translation cache:
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.removeItem('hustlexp_translation_cache');
await AsyncStorage.removeItem('hustlexp_ai_translation_enabled');
```

---

## Performance

- **Initial translation**: 10-20 seconds for 500+ texts
- **Subsequent switches**: < 50ms (instant)
- **Cache duration**: 7 days
- **Rate limit**: 120 requests/min = 12,000 texts/min
- **Cost**: ~$0.01/user/month with caching

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  User taps language selector                    │
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│  LanguageContext.changeLanguage(lang)           │
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│  preloadAllAppTranslations(lang)                │
│  - generateAllAppTexts() → 500+ texts           │
│  - Batch into 50 texts each                     │
│  - setTranslationProgress(0-100%)               │
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│  aiTranslationService.translate(batch, lang)    │
│  - Check AsyncStorage cache first               │
│  - If not cached, call backend API              │
│  - Store in cache for 7 days                    │
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│  Backend: POST /api/translate                   │
│  - OpenAI GPT-3.5-Turbo translation             │
│  - Context-aware (HustleXP gig economy)         │
│  - Rate limited: 120 req/min                    │
│  - Cached on backend for 7 days                 │
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│  Store in state: aiTranslationCache             │
│  - setAITranslationCache({ ...prev, ...new })  │
│  - Save to AsyncStorage for offline access      │
└──────────────────┬──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│  UI re-renders with translated text             │
│  - All t('key') calls return translated text    │
│  - Instant! No loading                          │
└─────────────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ Test translation on your device
2. ✅ Verify backend is running
3. ✅ Try all 12 languages
4. ✅ Test cross-language chat (if applicable)
5. 🚀 Launch to users!

**Your app is now multilingual! 🌍**
