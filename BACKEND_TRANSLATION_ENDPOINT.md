# Backend Translation Endpoint Specification

## Endpoint: POST `/api/translate`

Add this endpoint to your Replit backend to enable AI-powered translations.

## Request Format

```json
{
  "texts": ["Hello", "Welcome to HustleXP", "Sign In"],
  "targetLanguage": "es",
  "sourceLanguage": "en",
  "context": "HustleXP mobile app - gig economy platform"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `texts` | `string[]` | Yes | Array of texts to translate |
| `targetLanguage` | `string` | Yes | Target language code (e.g., 'es', 'fr', 'zh') |
| `sourceLanguage` | `string` | No | Source language code (defaults to 'en') |
| `context` | `string` | No | Context for better translation quality |

## Response Format

```json
{
  "translations": [
    "Hola",
    "Bienvenido a HustleXP",
    "Iniciar Sesión"
  ]
}
```

### Response Structure

| Field | Type | Description |
|-------|------|-------------|
| `translations` | `string[]` | Translated texts in same order as input |

## Python Implementation Example

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import openai  # or anthropic, or any AI service

router = APIRouter()

class TranslateRequest(BaseModel):
    texts: List[str]
    targetLanguage: str
    sourceLanguage: Optional[str] = "en"
    context: Optional[str] = "mobile app UI"

class TranslateResponse(BaseModel):
    translations: List[str]

@router.post("/translate")
async def translate(request: TranslateRequest) -> TranslateResponse:
    """
    Translate texts using AI with context awareness
    """
    try:
        # Validate input
        if not request.texts:
            raise HTTPException(status_code=400, detail="No texts provided")
        
        if len(request.texts) > 100:
            raise HTTPException(status_code=400, detail="Too many texts (max 100)")
        
        # Build AI prompt
        texts_formatted = "\n".join([f"{i+1}. {text}" for i, text in enumerate(request.texts)])
        
        prompt = f"""You are a professional translator for a mobile app called HustleXP, a gig economy platform.

Translate the following texts from {request.sourceLanguage} to {request.targetLanguage}.

Context: {request.context}

Important guidelines:
- Maintain the tone appropriate for mobile app UI (clear, friendly, concise)
- Keep technical terms and proper nouns when appropriate
- Preserve placeholders like {{name}}, {{count}}, etc.
- Maintain the same level of formality
- Consider cultural nuances

Texts to translate:
{texts_formatted}

Respond with ONLY a JSON array of translated strings in the exact same order, nothing else.
Example: ["translated text 1", "translated text 2"]
"""

        # Call OpenAI (or your preferred AI service)
        response = openai.ChatCompletion.create(
            model="gpt-4",  # or gpt-3.5-turbo for cost savings
            messages=[
                {"role": "system", "content": "You are a professional translator. Respond only with JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,  # Lower temperature for consistency
        )
        
        # Parse response
        import json
        translations = json.loads(response.choices[0].message.content)
        
        # Validate response
        if len(translations) != len(request.texts):
            raise ValueError("Translation count mismatch")
        
        return TranslateResponse(translations=translations)
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        print(f"Translation error: {e}")
        # Fallback: return original texts
        return TranslateResponse(translations=request.texts)

# Add to your main app
# app.include_router(router, prefix="/api")
```

## Node.js/Express Implementation

```javascript
const express = require('express');
const OpenAI = require('openai');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/translate', async (req, res) => {
  try {
    const { texts, targetLanguage, sourceLanguage = 'en', context = 'mobile app UI' } = req.body;
    
    // Validate
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'No texts provided' });
    }
    
    if (texts.length > 100) {
      return res.status(400).json({ error: 'Too many texts (max 100)' });
    }
    
    // Build prompt
    const textsFormatted = texts.map((t, i) => `${i + 1}. ${t}`).join('\n');
    
    const prompt = `You are a professional translator for HustleXP mobile app.

Translate from ${sourceLanguage} to ${targetLanguage}.
Context: ${context}

Guidelines:
- Mobile app UI tone (clear, friendly, concise)
- Keep technical terms when appropriate
- Preserve placeholders like {name}, {count}
- Maintain formality level

Texts:
${textsFormatted}

Respond with ONLY a JSON array of translations in exact order.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a professional translator. Respond only with JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });
    
    const translations = JSON.parse(response.choices[0].message.content);
    
    if (translations.length !== texts.length) {
      throw new Error('Translation count mismatch');
    }
    
    res.json({ translations });
    
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback: return original texts
    res.json({ translations: req.body.texts });
  }
});

module.exports = router;
```

## Alternative: Using Anthropic Claude

```python
import anthropic

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

@router.post("/translate")
async def translate(request: TranslateRequest) -> TranslateResponse:
    texts_formatted = "\n".join([f"{i+1}. {text}" for i, text in enumerate(request.texts)])
    
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""Translate these texts from {request.sourceLanguage} to {request.targetLanguage}.
Context: {request.context}

Texts:
{texts_formatted}

Respond with ONLY a JSON array of translations."""
        }]
    )
    
    translations = json.loads(message.content[0].text)
    return TranslateResponse(translations=translations)
```

## Testing the Endpoint

### Using cURL

```bash
curl -X POST https://your-backend.replit.app/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["Hello", "Welcome"],
    "targetLanguage": "es",
    "sourceLanguage": "en",
    "context": "mobile app"
  }'
```

### Expected Response

```json
{
  "translations": ["Hola", "Bienvenido"]
}
```

## Optimization Tips

### 1. **Caching**
```python
from functools import lru_cache
import hashlib

def cache_key(texts, target_lang, source_lang):
    content = f"{source_lang}:{target_lang}:{','.join(texts)}"
    return hashlib.md5(content.encode()).hexdigest()

# Store in Redis or database
cache = {}

@router.post("/translate")
async def translate(request: TranslateRequest):
    key = cache_key(request.texts, request.targetLanguage, request.sourceLanguage)
    
    if key in cache:
        return TranslateResponse(translations=cache[key])
    
    # ... perform translation ...
    
    cache[key] = translations
    return TranslateResponse(translations=translations)
```

### 2. **Batch Processing**
```python
# Process in batches to avoid token limits
MAX_BATCH_SIZE = 50

def split_into_batches(texts, batch_size=MAX_BATCH_SIZE):
    for i in range(0, len(texts), batch_size):
        yield texts[i:i + batch_size]
```

### 3. **Rate Limiting**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/translate")
@limiter.limit("100/minute")  # 100 requests per minute
async def translate(request: TranslateRequest):
    # ... translation logic ...
```

## Error Handling

```python
from enum import Enum

class TranslationError(str, Enum):
    NO_TEXTS = "no_texts_provided"
    TOO_MANY = "too_many_texts"
    INVALID_LANG = "invalid_language_code"
    AI_ERROR = "ai_service_error"
    PARSE_ERROR = "response_parse_error"

@router.post("/translate")
async def translate(request: TranslateRequest):
    try:
        if not request.texts:
            raise HTTPException(
                status_code=400,
                detail={"error": TranslationError.NO_TEXTS}
            )
        
        # ... translation logic ...
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail={"error": TranslationError.PARSE_ERROR}
        )
    except Exception as e:
        # Log error but don't expose details
        logger.error(f"Translation failed: {e}")
        
        # Graceful fallback
        return TranslateResponse(translations=request.texts)
```

## Monitoring

```python
import time
from prometheus_client import Counter, Histogram

translation_requests = Counter('translation_requests_total', 'Total translation requests')
translation_duration = Histogram('translation_duration_seconds', 'Translation duration')

@router.post("/translate")
async def translate(request: TranslateRequest):
    translation_requests.inc()
    
    start_time = time.time()
    try:
        # ... translation logic ...
        return response
    finally:
        duration = time.time() - start_time
        translation_duration.observe(duration)
```

## Cost Optimization

### Model Selection

| Model | Cost/1K tokens | Speed | Quality | Best For |
|-------|----------------|-------|---------|----------|
| GPT-4 | $0.03 input | Slow | Best | Critical UI text |
| GPT-3.5-Turbo | $0.001 input | Fast | Good | Bulk translation |
| Claude Sonnet | $0.003 input | Fast | Best | Balance |

### Recommendation

```python
def get_model_for_request(text_count, is_critical=False):
    if is_critical or text_count < 10:
        return "gpt-4"
    else:
        return "gpt-3.5-turbo"  # 30x cheaper!
```

## Security

```python
# Add API key authentication
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

@router.post("/translate")
async def translate(
    request: TranslateRequest,
    api_key: str = Depends(api_key_header)
):
    if api_key != os.environ.get("FRONTEND_API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API key")
    
    # ... translation logic ...
```

## Integration with Existing Replit Backend

Add to your existing `main.py` or `app.py`:

```python
from translation_router import router as translation_router

app.include_router(translation_router, prefix="/api", tags=["translation"])
```

That's it! Your backend is now ready to handle AI-powered translations.
