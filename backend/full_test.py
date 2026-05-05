import requests
import pandas as pd
import io
import json

BASE_URL = "http://localhost:8001"

def test_full_flow():
    print("--- Starting Full Site Logic Test ---")
    
    # 1. Create dummy data
    data = {
        'date': ['2023-01-01', '2023-01-02', '2023-02-01', '2023-02-02'],
        'item': ['Apple', 'Apple', 'Banana', 'Banana'],
        'quantity': [10, 20, 5, 10],
        'price': [1.0, 1.0, 2.0, 2.0]
    }
    df = pd.DataFrame(data)
    csv_io = io.StringIO()
    df.to_csv(csv_io, index=False)
    csv_content = csv_io.getvalue()
    
    # 2. Upload CSV
    print("\n[Step 1] Uploading CSV...")
    files = {'file': ('test.csv', csv_content, 'text/csv')}
    resp = requests.post(f"{BASE_URL}/upload", files=files)
    print(f"Upload Status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"Error: {resp.text}")
        return

    # 3. Request Decision Intelligence Report
    print("\n[Step 2] Requesting BI Report...")
    query_data = {"query": "What is my business status?", "history": [], "language": "en"}
    resp = requests.post(f"{BASE_URL}/query", json=query_data)
    print(f"Query Status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"Error: {resp.text}")
        return
    
    report = resp.json()
    
    # Verify New Schema
    print("\n[Step 3] Verifying Schema...")
    keys_to_check = ['business_state', 'trend_analysis', 'root_causes', 'impact', 'forecast', 'recommendations', 'risks', 'signals']
    for key in keys_to_check:
        if key in report:
            print(f"[OK] Found key: {key}")
        else:
            print(f"[FAIL] MISSING key: {key}")
            
    if 'business_state' in report:
        print(f"Business Summary: {report['business_state'].get('summary')}")
        print(f"Growth Metrics: {report['business_state'].get('growth_metrics')}")
        print(f"Confidence: {report['business_state'].get('confidence')}")

    if 'forecast' in report:
        print(f"Forecast Prediction: {report['forecast'].get('prediction')}")
        print(f"Forecast Change: {report['forecast'].get('expected_change')}")

    # 4. Test Advisor Chat
    print("\n[Step 4] Testing Advisor Chat...")
    chat_data = {"message": "Give me a recommendation.", "history": [], "context": report, "language": "en"}
    resp = requests.post(f"{BASE_URL}/chat", json=chat_data)
    print(f"Chat Status: {resp.status_code}")
    if resp.status_code == 200:
        reply = resp.json().get('reply', '')
        print(f"Chat Reply: {reply[:100]}...")
        if "***" in reply:
            print("[FAIL] Markdown symbols found in chat reply.")
        else:
            print("[OK] Clean text output in chat.")
    else:
        print(f"Error: {resp.text}")

    print("\n--- Test Complete ---")

if __name__ == "__main__":
    test_full_flow()
