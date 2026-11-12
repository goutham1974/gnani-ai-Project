import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "agricultural_data" / "mandi_market_rates.json"

class MandiMarketService:
    def __init__(self):
        self.data: List[Dict[str, Any]] = []
        self._load_data()

    def _load_data(self):
        if DATA_PATH.exists():
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                self.data = json.load(f)

    def get_all_rates(self) -> List[Dict[str, Any]]:
        return self.data

    def query_crop_price(self, crop_query: str, market_query: Optional[str] = None) -> List[Dict[str, Any]]:
        query_norm = crop_query.lower()
        results = []
        for item in self.data:
            match_crop = (
                query_norm in item["commodity"].lower()
                or query_norm in item["commodity_te"]
                or query_norm in item.get("commodity_en", "").lower()
            )
            # Synonyms
            if not match_crop:
                if any(k in query_norm for k in ["tomato", "టమాటా"]) and "tomato" in item["commodity"].lower():
                    match_crop = True
                elif any(k in query_norm for k in ["cotton", "పత్తి"]) and "cotton" in item["commodity"].lower():
                    match_crop = True
                elif any(k in query_norm for k in ["chilli", "మిరప", "మిర్చి"]) and "chilli" in item["commodity"].lower():
                    match_crop = True
                elif any(k in query_norm for k in ["paddy", "వరి", "rice"]) and "paddy" in item["commodity"].lower():
                    match_crop = True
                elif any(k in query_norm for k in ["maize", "మొక్కజొన్న"]) and "maize" in item["commodity"].lower():
                    match_crop = True

            if match_crop:
                if market_query:
                    if market_query.lower() in item["market"].lower():
                        results.append(item)
                else:
                    results.append(item)

        return results if results else self.data[:2]

market_service = MandiMarketService()
