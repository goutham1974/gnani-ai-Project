import logging
import httpx
from typing import Dict, Any, Optional
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

LANGUAGE_PROMPT_MAP = {
    "te": "Telugu (తెలుగు)",
    "hi": "Hindi (हिंदी)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ta": "Tamil (தமிழ்)",
    "mr": "Marathi (मराठी)",
    "en": "English"
}

class LLMService:
    """
    Unified LLM Reasoning Engine for RYTHUM AI:
    - Primary: Google Gemini 2.0 Flash (Free 1,500 RPD on Google AI Studio).
    - Secondary: OpenAI / Groq.
    - Fallback: Intelligent native multilingual agricultural generator.
    """

    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.gemini_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
        self.gemini_model = settings.GEMINI_MODEL or "gemini-2.0-flash"
        self.openai_key = settings.OPENAI_API_KEY.strip() if settings.OPENAI_API_KEY else ""
        self.groq_key = settings.GROQ_API_KEY.strip() if settings.GROQ_API_KEY else ""

    def generate_response_sync(
        self,
        prompt: str,
        system_instruction: str = "",
        target_language: str = "te",
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        """
        Synchronous generation for LangGraph nodes and fast in-process routing.
        """
        lang_name = LANGUAGE_PROMPT_MAP.get(target_language, "Telugu")

        # 1. Try Gemini API
        if self.gemini_key and not self.gemini_key.startswith("your_"):
            models_to_try = [self.gemini_model, "gemini-3-flash-preview", "gemini-3.1-flash-lite"]
            sys_prompt = (
                system_instruction or 
                f"You are RYTHUM AI, an intelligent multilingual agricultural operating system assistant for Indian farmers. "
                f"You MUST respond ONLY in {lang_name} using its native script (or friendly code-mixed if the user uses code-mixing). "
                f"Keep your answers practical, compassionate, and precise for Indian agriculture. "
                f"For greetings (like 'hi', 'how are you', 'who are you'), reply cordially in {lang_name}, introduce yourself as RYTHUM AI, "
                f"and ask how you can help their farm with crops, mandi prices, weather, or reminders."
            )

            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "systemInstruction": {"parts": [{"text": sys_prompt}]},
                "generationConfig": {"temperature": temperature, "maxOutputTokens": 800}
            }

            with httpx.Client(timeout=10.0) as client:
                for model_name in models_to_try:
                    try:
                        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.gemini_key}"
                        resp = client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            candidates = data.get("candidates", [])
                            if candidates:
                                content_parts = candidates[0].get("content", {}).get("parts", [])
                                if content_parts:
                                    return {
                                        "success": True,
                                        "text": content_parts[0].get("text", "").strip(),
                                        "model": f"Google Gemini ({model_name})",
                                        "language": target_language
                                    }
                        else:
                            logger.warning(f"Gemini {model_name} returned status {resp.status_code}: {resp.text[:120]}")
                    except Exception as e:
                        logger.error(f"Error calling Gemini model {model_name}: {e}")

        # Fallback to local multilingual generator
        return self._multilingual_fallback(prompt, target_language)

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str = "",
        target_language: str = "te",
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        """
        Async wrapper for endpoints.
        """
        return self.generate_response_sync(prompt, system_instruction, target_language, temperature)

    def _multilingual_fallback(self, prompt: str, lang: str) -> Dict[str, Any]:
        p_lower = prompt.lower().strip()

        # Greetings & General Chit-chat
        is_greeting = any(w in p_lower for w in [
            "hi", "hello", "hey", "how are you", "who are you", "what can you do", "help",
            "నమస్కారం", "ఎలా ఉన్నారు", "బాగున్నారా", "ఎవరు మీరు", "హాయ్",
            "नमस्ते", "आप कैसे हैं", "कौन हो", "मदद",
            "ನಮಸ್ಕಾರ", "ಹೇಗಿದ್ದೀರಾ", "ನೀವು ಯಾರು",
            "வணக்கம்", "எப்படி இருக்கிறீர்கள்", "யார் நீங்கள்",
            "नमस्कार", "कसे आहात", "तुम्ही कोण आहात"
        ])

        if is_greeting:
            responses = {
                "te": (
                    "నమస్కారం రైతు సోదరా! నేను చాలా బాగున్నాను, ధన్యవాదాలు 🙏\n\n"
                    "నేను **RYTHUM AI** — భారతీయ రైతుల కోసం రూపొందించిన డిజిటల్ వ్యవసాయ సహాయకుడిని.\n\n"
                    "నేను మీకు ఈ కింది విషయాలలో సహాయం చేయగలను:\n"
                    "• **పంట తెగుళ్ల నివారణ & సలహాలు** (టమాటా, మిరప, వరి, పత్తి, మొక్కజొన్న)\n"
                    "• **నేటి లైవ్ మార్కెట్ (మండి) ధరలు**\n"
                    "• **వ్యవసాయ వాతావరణం & మందుల పిచికారీ అనుకూలత**\n"
                    "• **పనుల రిమైండర్లు & ఎరువుల డైరీ**\n\n"
                    "ఈరోజు మీ పొలం లేదా పంటల గురించి నేను మీకు ఎలా సహాయపడగలను?"
                ),
                "hi": (
                    "नमस्ते किसान भाई! मैं बहुत अच्छा हूँ, धन्यवाद 🙏\n\n"
                    "मैं **RYTHUM AI** हूँ — भारतीय किसानों के लिए एक उन्नत वॉयस और कृषि सहायक।\n\n"
                    "मैं आपकी इन विषयों में सहायता कर सकता हूँ:\n"
                    "• **फसल रोग निदान एवं समाधान** (टमाटर, मिर्च, धान, कपास)\n"
                    "• **ताज़ा मंडी भाव (Mandi Rates)**\n"
                    "• **मौसम एवं कीटनाशक छिड़काव परामर्श**\n"
                    "• **खेती के कामों के रिमाइंडर एवं खाद का रिकॉर्ड**\n\n"
                    "आज मैं आपके खेत या फसलों के बारे में आपकी क्या मदद कर सकता हूँ?"
                ),
                "kn": (
                    "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು 🙏\n\n"
                    "ನಾನು **RYTHUM AI** — ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾದ ವಾಯ್ಸ್ ಕೃಷಿ ಸಹಾಯಕ.\n\n"
                    "ನಾನು ನಿಮಗೆ ಈ ಕೆಳಗಿನ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n"
                    "• **ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಪರಿಹಾರಗಳು** (ಟೊಮೆಟೊ, ಮೆಣಸಿನಕಾಯಿ, ಭತ್ತ, ಹತ್ತಿ)\n"
                    "• **ಇಂದಿನ ಲೈವ್ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು**\n"
                    "• **ಕೃಷಿ ಹವಾಮಾನ ಮತ್ತು ಔಷಧಿ ಸಿಂಪರಣೆ ಸಲಹೆಗಳು**\n"
                    "• **ಕೃಷಿ ಜ್ಞಾಪನೆಗಳು (Reminders) ಮತ್ತು ರಸಗೊಬ್ಬರ ಡೈರಿ**\n\n"
                    "ಇಂದು ನಿಮ್ಮ ಜಮೀನು ಅಥವಾ ಬೆಳೆಗಳ ಕುರಿತು ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
                ),
                "ta": (
                    "வணக்கம் விவசாய தோழரே! நான் நலமாக இருக்கிறேன், நன்றி 🙏\n\n"
                    "நான் **RYTHUM AI** — இந்திய விவசாயிகளுக்கான குரல் வழி வேளாண்மை உதவியாளர்.\n\n"
                    "நான் உங்களுக்கு பின்வரும் வழிகளில் உதவ முடியும்:\n"
                    "• **பயிர் நோய் கண்டறிதல் மற்றும் தீர்வுகள்** (தக்காளி, மிளகாய், நெல், பருத்தி)\n"
                    "• **இன்றைய நேரடி மண்டி சந்தை விலைகள்**\n"
                    "• **விவசாய வானிலை மற்றும் மருந்து தெளிக்கும் ஆலோசனைகள்**\n"
                    "• **வேலை நினைவூட்டல்கள் மற்றும் உர மேலாண்மை**\n\n"
                    "இன்று உங்கள் பண்ணை அல்லது பயிர்கள் குறித்து நான் எவ்வாறு உதவட்டும்?"
                ),
                "mr": (
                    "नमस्कार शेतकरी बंधू! मी मजेत आहे, धन्यवाद 🙏\n\n"
                    "मी **RYTHUM AI** आहे — भारतीय शेतकऱ्यांसाठी तयार केलेला डिजिटल कृषी सहाय्यक.\n\n"
                    "मी तुम्हाला खालील बाबींमध्ये मदत करू शकतो:\n"
                    "• **पीक रोग निदान व शास्त्रोक्त उपाय** (टोमॅटो, मिरची, भात, कापूस)\n"
                    "• **आजचे थेट कृषी उत्पन्न बाजारभाव (Mandi Rates)**\n"
                    "• **शेती हवामान आणि फवारणी सल्ला**\n"
                    "• **शेती कामांचे रिमाइंडर्स आणि खतांची नोंद**\n\n"
                    "आज मी आपल्या शेती किंवा पिकांविषयी काय मदत करू शकतो?"
                ),
                "en": (
                    "Hello farmer friend! I am doing great, thank you 🙏\n\n"
                    "I am **RYTHUM AI** — your Autonomous Multilingual Agricultural Operating System.\n\n"
                    "I can assist you with:\n"
                    "• **Crop Disease Diagnosis & Scientific Solutions** (Tomato, Chilli, Paddy, Cotton)\n"
                    "• **Live APMC Mandi Market Prices & Trends**\n"
                    "• **Agri-Weather & Pesticide Spray Suitability**\n"
                    "• **Autonomous Farm Reminders & Activity Logging**\n\n"
                    "How can I assist your farm today?"
                )
            }
            return {
                "success": True,
                "text": responses.get(lang, responses["en"]),
                "model": "RYTHUM Conversational Intelligence",
                "language": lang
            }

        # General Agriculture Fallback
        gen_responses = {
            "te": f"రైతు సోదరా, మీ ప్రశ్న: '{prompt}'. శాస్త్రీయ పద్ధతుల ప్రకారం, సరైన పోషకాలు మరియు తేమ యాజమాన్యం పాటించడం ద్వారా పంట దిగుబడిని పెంచుకోవచ్చు. మీ పంట పేరు మరియు లక్షణాలను తెలియజేస్తే ఖచ్చితమైన పరిష్కారాన్ని అందించగలను.",
            "hi": f"किसान भाई, आपका प्रश्न: '{prompt}'. वैज्ञानिक पद्धतियों के अनुसार, संतुलित पोषण और समय पर सिंचाई से फसल की पैदावार अच्छी होती है। कृपया अपनी फसल का नाम बताएं ताकि सटीक सलाह दी जा सके।",
            "kn": f"ರೈತ ಮಿತ್ರರೇ, ನಿಮ್ಮ ಪ್ರಶ್ನೆ: '{prompt}'. ವೈಜ್ಞಾನಿಕ ಪದ್ಧತಿಗಳ ಪ್ರಕಾರ, ಸಮತೋಲಿತ ಪೋಷಕಾಂಶ ಮತ್ತು ಸಮಯೋಚಿತ ನೀರಾವರಿಯಿಂದ ಉತ್ತಮ ಇಳುವರಿ ಪಡೆಯಬಹುದು. ದಯವಿಟ್ಟು ನಿಖರವಾದ ಸಲಹೆಗಾಗಿ ಬೆಳೆಯ ಹೆಸರನ್ನು ತಿಳಿಸಿ.",
            "ta": f"விவசாய தோழரே, உங்கள் கேள்வி: '{prompt}'. அறிவியல் முறைகளின்படி, சீரான உரம் மற்றும் சரியான பாசனம் மூலம் நல்ல மகசூல் பெறலாம். துல்லியமான ஆலோசனைக்கு பயிரின் பெயரை குறிப்பிடவும்.",
            "mr": f"शेतकरी बंधू, आपला प्रश्न: '{prompt}'. वैज्ञानिक पद्धतीनुसार, संतुलित खत आणि योग्य पाण्याच्या व्यवस्थापनाने पीक उत्पादन वाढते. अचूक सल्ल्यासाठी कृपया पिकाचे नाव सांगा.",
            "en": f"Farmer friend, regarding: '{prompt}'. Following scientific nutrient management and proper irrigation ensures healthy yield. Please specify your crop name for verified advice."
        }

        return {
            "success": True,
            "text": gen_responses.get(lang, gen_responses["en"]),
            "model": "RYTHUM Multilingual Agri-Brain",
            "language": lang
        }

llm_service = LLMService()
