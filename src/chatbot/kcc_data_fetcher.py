import requests
import json
import time
from typing import List, Dict, Optional

class KCCDataFetcher:
    def __init__(self, api_key: str = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"):
        self.api_key = api_key
        self.base_url = "https://api.data.gov.in/resource/cef25fe2-9231-4128-8aec-2c948fedd43f"
        
    def fetch_kcc_data(self, state: str = None, year: str = None, limit: int = 100) -> List[Dict]:
        """Fetch KCC data from government API"""
        params = {
            'api-key': self.api_key,
            'format': 'json',
            'limit': limit
        }
        
        if state:
            params['filters[StateName]'] = state.upper()
        if year:
            params['filters[year]'] = year
            
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get('records', [])
        except Exception as e:
            print(f"Error fetching KCC data: {e}")
        return []
    
    def get_crop_queries(self, crop: str, limit: int = 50) -> List[Dict]:
        """Get queries related to specific crop"""
        all_data = []
        states = ['PUNJAB', 'HARYANA', 'UTTAR PRADESH', 'MAHARASHTRA', 'KARNATAKA']
        
        for state in states:
            data = self.fetch_kcc_data(state=state, limit=limit//len(states))
            crop_data = [record for record in data if crop.lower() in record.get('Crop', '').lower()]
            all_data.extend(crop_data)
            time.sleep(0.5)  # Rate limiting
            
        return all_data[:limit]
    
    def save_kcc_dataset(self, filename: str = 'kcc_agricultural_data.json'):
        """Save comprehensive KCC dataset"""
        all_data = []
        states = ['PUNJAB', 'HARYANA', 'UTTAR PRADESH', 'MAHARASHTRA', 'KARNATAKA', 
                 'TAMIL NADU', 'ANDHRA PRADESH', 'WEST BENGAL', 'GUJARAT', 'RAJASTHAN']
        
        for state in states:
            print(f"Fetching data for {state}...")
            data = self.fetch_kcc_data(state=state, limit=100)
            all_data.extend(data)
            time.sleep(1)  # Rate limiting
            
        # Save to file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
            
        print(f"Saved {len(all_data)} KCC records to {filename}")
        return all_data

if __name__ == "__main__":
    fetcher = KCCDataFetcher()
    fetcher.save_kcc_dataset()