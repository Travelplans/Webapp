#!/bin/bash
# Script to set Google AI API key in Firebase Functions config
# Usage: ./scripts/setApiKey.sh

API_KEY="AIzaSyB3KV5eVIeZIcASF0IpR0r958MOnvisHdc"

echo "Setting Google AI API key in Firebase Functions config..."
firebase functions:config:set googleai.api_key="$API_KEY"

echo "API key set successfully!"
echo "To verify, run: firebase functions:config:get"





