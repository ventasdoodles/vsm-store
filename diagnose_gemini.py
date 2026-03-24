import os
import google.generativeai as genai

KEY_TO_TEST = "AIzaSyAy-RsL6m8njSo-ULUhVH5bglGBLwnF36g"

def test_key(key):
    print(f"\n--- TESTING KEY WITH GEMINI 2.5 PRO: {key[:15]}... ---")
    try:
        genai.configure(api_key=key)
        # Using the elite 2.5 Pro model
        model = genai.GenerativeModel('gemini-2.5-pro')
        response = model.generate_content("DIME OK SI FUNCIONA")
        print(f"SUCCESS! Gemini 2.5 Pro says: {response.text}")
        return True
    except Exception as e:
        print(f"FAILED: {str(e)}")
        return False

test_key(KEY_TO_TEST)
