#!/bin/bash
echo "🔍 Vérification du projet propre..."
sleep 10
curl -s http://localhost:8045/ && echo "✅ Frontend accessible"
