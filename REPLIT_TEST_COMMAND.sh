#!/bin/bash
# HustleAI Backend Validation - Quick Test
# Copy-paste this entire script into your Replit Shell

echo "🚀 HUSTLEAI BACKEND TEST SUITE"
echo "================================"
echo ""

# IMPORTANT: Replace with your actual user UUID from database
USER_ID="1fb11a05-2228-4c4e-b69d-f3c1b2e986c2"
TASK_ID="task-123"

echo "Testing 17 AI endpoints..."
echo ""

# Test 1: Health Check
echo "1/17 Health Check..."
curl -s "https://$REPLIT_DEV_DOMAIN/api/health" | jq '.'
echo ""

# Test 2: AI Chat
echo "2/17 AI Chat..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/agent/chat" \
  -H "Content-Type: application/json" \
  -d '{"userId":"'$USER_ID'","message":"Find me delivery gigs"}' | jq '.response'
echo ""

# Test 3: Task Parsing
echo "3/17 Task Parsing..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/tasks/parse" \
  -H "Content-Type: application/json" \
  -d '{"userId":"'$USER_ID'","input":"Walk my dog for $25 tomorrow morning"}' | jq '.task.title, .task.category'
echo ""

# Test 4: AI Matching
echo "4/17 AI Matching..."
curl -s "https://$REPLIT_DEV_DOMAIN/api/tasks/$TASK_ID/matches" | jq '.matches | length'
echo ""

# Test 5: AI Coaching
echo "5/17 AI Coaching..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/users/$USER_ID/coaching" \
  -H "Content-Type: application/json" \
  -d '{"context":"Want to increase earnings"}' | jq '.tips[0]'
echo ""

# Test 6: Content Generation
echo "6/17 Content Generation..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/content/generate" \
  -H "Content-Type: application/json" \
  -d '{"type":"description","context":{"category":"delivery","pay":20}}' | jq '.content' | head -1
echo ""

# Test 7: Fraud Detection
echo "7/17 Fraud Detection..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/fraud/detect" \
  -H "Content-Type: application/json" \
  -d '{"taskDescription":"URGENT!!! Wire money now!!!","userId":"'$USER_ID'"}' | jq '.isFraud, .confidence'
echo ""

# Test 8: Trade Job Parsing
echo "8/17 Trade Parsing..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/trades/parse" \
  -H "Content-Type: application/json" \
  -d '{"userId":"'$USER_ID'","input":"Need electrician for commercial rewiring. Master cert required. $3000-6000"}' | jq '.trade.tradeCategory, .trade.requiredCertifications[0]'
echo ""

# Test 9: Trade Matching
echo "9/17 Trade Matching..."
curl -s "https://$REPLIT_DEV_DOMAIN/api/trades/$USER_ID/matches" | jq '.matches | length'
echo ""

# Test 10: Squad Suggestion
echo "10/17 Squad Formation..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/trades/squad/suggest" \
  -H "Content-Type: application/json" \
  -d '{"jobDescription":"Kitchen remodel: electrical, plumbing, cabinets, tile"}' | jq '.requiredTrades | length'
echo ""

# Test 11: Trade Progression
echo "11/17 Trade Progression..."
curl -s "https://$REPLIT_DEV_DOMAIN/api/trades/$USER_ID/optimize" | jq '.currentBadge, .nextBadge'
echo ""

# Test 12: Dynamic Pricing
echo "12/17 Dynamic Trade Pricing..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/trades/pricing" \
  -H "Content-Type: application/json" \
  -d '{"tradeCategory":"Electrician","jobType":"Commercial","badgeLevel":"Gold Guardian","isPeakHour":true,"isEmergency":true}' | jq '.hourlyRate, .appliedMultipliers'
echo ""

# Test 13: Feedback Loop (AI Learning)
echo "13/17 Feedback Submission..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{"userId":"'$USER_ID'","taskId":"'$TASK_ID'","predictionType":"duration","predictedValue":2.5,"actualValue":3.0}' | jq '.recorded, .accuracy'
echo ""

# Test 14: AI User Profile
echo "14/17 AI User Profile..."
curl -s "https://$REPLIT_DEV_DOMAIN/api/users/$USER_ID/profile/ai" | jq '.preferredCategories[0], .acceptanceRate'
echo ""

# Test 15: A/B Testing
echo "15/17 A/B Experiment..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/experiments/track" \
  -H "Content-Type: application/json" \
  -d '{"experimentId":"match_threshold_v2","userId":"'$USER_ID'","variant":"test_a","outcome":"success","metrics":{"acceptanceRate":0.85}}' | jq '.success'
echo ""

# Test 16: System Calibration
echo "16/17 System Calibration..."
curl -s "https://$REPLIT_DEV_DOMAIN/api/system/calibration" | jq '.recommendations | length'
echo ""

# Test 17: Fraud Pattern Learning
echo "17/17 Fraud Pattern Learning..."
curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/fraud/report" \
  -H "Content-Type: application/json" \
  -d '{"userId":"'$USER_ID'","reportedUserId":"fake-123","fraudType":"payment_scam","description":"Requested payment outside platform","evidence":{"messages":["Send to CashApp"]}}' | jq '.confidence, .recommendedAction'
echo ""

echo "================================"
echo "✅ Test Suite Complete!"
echo ""
echo "If all 17 tests returned data (not errors), your backend is READY! 🎉"
echo ""
echo "Next: Verify your iOS app is calling these endpoints during user flows."
