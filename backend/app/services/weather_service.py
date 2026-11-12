import json
from pathlib import Path
from typing import List, Dict, Any, Optional

WEATHER_DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "agricultural_data" / "weather_advisories.json"

class AgricultureWeatherService:
    def __init__(self):
        self.data: List[Dict[str, Any]] = []
        self._load_data()

    def _load_data(self):
        if WEATHER_DATA_PATH.exists():
            with open(WEATHER_DATA_PATH, "r", encoding="utf-8") as f:
                self.data = json.load(f)

    def get_all_advisories(self) -> List[Dict[str, Any]]:
        return self.data

    def get_weather_for_location(self, location_query: str) -> Dict[str, Any]:
        norm = location_query.lower()
        for item in self.data:
            if norm in item["region"].lower() or norm in item["state"].lower():
                return item

        # Default to first region (Guntur) if not found
        return self.data[0] if self.data else {
            "region": "Andhra Pradesh & Telangana",
            "temperature_c": 31,
            "humidity_pct": 65,
            "wind_speed_kmh": 12,
            "condition": "Partly Cloudy",
            "rain_forecast_next_3_days": "15% chance - Mostly Dry",
            "spray_suitability": "SUITABLE",
            "farming_advisory_te": "రాబోయే 3 రోజుల్లో వర్ష సూచన తక్కువగా ఉంది. మందుల పిచికారీ మరియు నీటి తడులు అనుకూలం.",
            "farming_advisory_en": "Low chance of rain. Suitable for pesticide sprays and irrigation."
        }

weather_service = AgricultureWeatherService()
