import requests
import json

# 1. Login to get token
login_data = {
    'email': 'test+test_b50167dd17@example.com', # Use the email found earlier or we can just create one
    'password': 'password123' # We might not know the password, let's just create a test user
}

# Actually, we can use django shell to get a valid token directly from the DB!
