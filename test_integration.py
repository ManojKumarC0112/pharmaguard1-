import requests
import os
import sys
import time
import subprocess
import threading

def run_server():
    subprocess.run([sys.executable, "-m", "uvicorn", "backend.main:app", "--port", "8001"], cwd=os.getcwd())

def test_api():
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(5)
    
    url = "http://localhost:8001/analyze"
    
    # Create a dummy VCF
    vcf_content = """##fileformat=VCFv4.2
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
chr22\t123\trs123\tC\tT\t.\t.\tGENE=CYP2D6
"""
    files = {'file': ('test.vcf', vcf_content, 'text/plain')}
    data = {'drug': 'CODEINE', 'patient_id': 'TEST_PATIENT'}
    
    try:
        print(f"Sending request to {url}...")
        response = requests.post(url, files=files, data=data)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            json_resp = response.json()
            print("Response JSON keys:", json_resp.keys())
            print("Risk Assessment:", json_resp['risk_assessment'])
            print("PASS: API Integration Test")
        else:
            print(f"FAIL: API Error {response.text}")
    except Exception as e:
        print(f"FAIL: Connection refused or error: {e}")

if __name__ == "__main__":
    # Start server in a thread or just assume it's running? 
    # Better to run it here for automation if possible, but simpler to expect it running.
    # For this script, I'll try to hit it, if it fails, I'll fail.
    # Actually, I will start it in a subprocess in the background command tool, then run this.
    test_api()
