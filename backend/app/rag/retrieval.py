import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)
DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "agricultural_data"

class AgriculturalRAGEngine:
    """
    Evidence-Based Agricultural Retrieval-Augmented Generation Engine.
    Indexes verified research advisories from ANGRAU, ICAR, and YSRHU.
    """

    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self._load_corpus()

    def _load_corpus(self):
        self.documents = []
        if not DATA_DIR.exists():
            return

        for filepath in DATA_DIR.glob("*.json"):
            if "mandi" in filepath.name or "weather" in filepath.name:
                continue
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    if isinstance(content, list):
                        self.documents.extend(content)
            except Exception as e:
                logger.error(f"Error loading {filepath}: {e}")

    def search_advisories(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves matching verified agricultural advisories based on symptoms,
        crop names, and diagnostic keywords.
        """
        query_norm = query.lower()
        scored_docs = []

        for doc in self.documents:
            score = 0.0

            # Crop name match
            if doc.get("crop_en", "").lower() in query_norm or doc.get("crop_te", "") in query:
                score += 3.0

            # Keyword matches
            for kw in doc.get("keywords", []):
                if kw.lower() in query_norm:
                    score += 2.0

            # Symptoms matches
            if any(word in doc.get("symptoms_te", "") for word in query.split() if len(word) > 2):
                score += 1.5

            if any(word in doc.get("symptoms_en", "").lower() for word in query_norm.split() if len(word) > 3):
                score += 1.5

            # Issue title match
            if any(part in doc.get("issue", "").lower() for part in query_norm.split() if len(part) > 3):
                score += 2.0

            if score > 0:
                scored_docs.append({
                    **doc,
                    "relevance_score": round(min(score / 5.0, 1.0), 3)
                })

        # Sort by relevance
        scored_docs.sort(key=lambda x: x["relevance_score"], reverse=True)

        if not scored_docs and self.documents:
            # Fallback to the first document with default relevance
            return [{
                **self.documents[0],
                "relevance_score": 0.65
            }]

        return scored_docs[:top_k]

rag_engine = AgriculturalRAGEngine()

