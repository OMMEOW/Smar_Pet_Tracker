import urllib.request
import urllib.error
import json
import time
import hmac
import hashlib
import random
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

# Configuration
SERVER_URL = "http://10.242.171.95:3000/api/device/location"
TARGET_PET_ID = "ESP_YOUR_ID_HERE"
SHARED_SECRET_HEX = "c43ca0a65e0f809a7014b3d7d2042b0346591f53f50041276576a1aa9eb36f13"

def encrypt_aes(payload_str, key_hex, use_wrong_key=False):
    key = bytes.fromhex(key_hex)
    if use_wrong_key:
        key = bytes.fromhex("0000000000000000000000000000000000000000000000000000000000000000")
        
    iv = os.urandom(16)
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(payload_str.encode('utf-8')) + padder.finalize()
    
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    
    return iv.hex(), ciphertext.hex()

def send_attack(attack_name, payload_dict, use_wrong_key=False):
    print(f"\n--- Initiating {attack_name} ---")
    
    timestamp = str(int(time.time()))
    nonce = str(random.randint(10000000, 99999999))
    payload_str = json.dumps(payload_dict, separators=(',', ':'))
    
    # 1. Encrypt the payload
    iv_hex, encrypted_hex = encrypt_aes(payload_str, SHARED_SECRET_HEX, use_wrong_key)
    
    # 2. Generate signature OVER THE ENCRYPTED PAYLOAD
    message = f"{timestamp}.{nonce}.{encrypted_hex}".encode('utf-8')
    if use_wrong_key:
        signature = hashlib.sha256(b"fake").hexdigest()
    else:
        signature = hmac.new(SHARED_SECRET_HEX.encode('utf-8'), message, hashlib.sha256).hexdigest()
        
    headers = {
        "Content-Type": "text/plain",
        "x-device-id": TARGET_PET_ID,
        "x-device-timestamp": timestamp,
        "x-device-nonce": nonce,
        "x-device-signature": signature,
        "x-device-iv": iv_hex
    }
    
    req = urllib.request.Request(SERVER_URL, data=encrypted_hex.encode('utf-8'), headers=headers, method='POST')
    
    try:
        if not use_wrong_key:
            print(f"Encrypted Payload being sent: {encrypted_hex[:30]}... (Data is hidden!)")
        with urllib.request.urlopen(req) as response:
            print(f"Result: SUCCESS! Server accepted the spoofed data. (Status {response.status})")
    except urllib.error.HTTPError as e:
        print(f"Result: BLOCKED! Server rejected the attack. (Status {e.code})")
        print(f"Reason: {e.read().decode()}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    print("--- Smart Pet Tracker Security Demonstration ---")
    
    # ATTACK 1: Data Tampering (No Secret Key)
    tampered_payload = {
        "petId": TARGET_PET_ID,
        "latitude": 40.7128,
        "longitude": -74.0060,
        "satellites": 12,
        "hdop": 1.0,
        "pulseBpm": 80,
        "pulseRaw": 2000
    }
    send_attack("Attack 1: Data Tampering / Encrypting without Key", tampered_payload, use_wrong_key=True)
    
    time.sleep(2)
    
    # ATTACK 2: Teleportation / GPS Jump Spoofing (With Stolen Key)
    # Sending a random location to guarantee a massive GPS jump
    spoofed_payload = {
        "petId": TARGET_PET_ID,
        "latitude": 51.5074 + random.uniform(-10, 10),
        "longitude": -0.1278 + random.uniform(-10, 10),
        "satellites": 12,
        "hdop": 1.0,
        "pulseBpm": 80,
        "pulseRaw": 2000
    }
    send_attack("Attack 2: Impossible GPS Jump (With Stolen Key)", spoofed_payload, use_wrong_key=False)
