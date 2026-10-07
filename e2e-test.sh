#!/data/data/com.termux/files/usr/bin/bash

API="http://localhost:5000/api"
PASS="test12345"
TIMESTAMP=$(date +%s)

echo "════════════════════════════════════════════════"
echo "🧪 E2E TEST — ishjobs"
echo "════════════════════════════════════════════════"

echo ""
echo "▶️  [1/9] SEEKER REGISTER"
SEEKER_PHONE="+998901${TIMESTAMP: -6}"
SEEKER_RESPONSE=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"E2E\",\"lastName\":\"Seeker\",\"phone\":\"$SEEKER_PHONE\",\"password\":\"$PASS\"}")
SEEKER_TOKEN=$(echo "$SEEKER_RESPONSE" | jq -r '.data.accessToken // empty')

if [ -n "$SEEKER_TOKEN" ] && [ "$SEEKER_TOKEN" != "null" ]; then
  echo "✅ Seeker: $SEEKER_PHONE"
else
  echo "❌ XATO: $SEEKER_RESPONSE"
  exit 1
fi

echo ""
echo "▶️  [2/9] EMPLOYER REGISTER"
EMPLOYER_PHONE="+998902${TIMESTAMP: -6}"
EMPLOYER_RESPONSE=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"E2E\",\"lastName\":\"Employer\",\"phone\":\"$EMPLOYER_PHONE\",\"password\":\"$PASS\"}")
EMPLOYER_TOKEN=$(echo "$EMPLOYER_RESPONSE" | jq -r '.data.accessToken // empty')

if [ -n "$EMPLOYER_TOKEN" ] && [ "$EMPLOYER_TOKEN" != "null" ]; then
  echo "✅ Employer: $EMPLOYER_PHONE"
else
  echo "❌ XATO: $EMPLOYER_RESPONSE"
  exit 1
fi

echo ""
echo "▶️  [3/9] LOGIN (Seeker)"
LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"$SEEKER_PHONE\",\"password\":\"$PASS\"}")
LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // empty')

if [ -n "$LOGIN_TOKEN" ] && [ "$LOGIN_TOKEN" != "null" ]; then
  echo "✅ Login muvaffaqiyatli"
else
  echo "❌ XATO: $LOGIN_RESPONSE"
  exit 1
fi

echo ""
echo "▶️  [4/9] PROFILE UPDATE"
UPDATE_RESPONSE=$(curl -s -X PATCH "$API/auth/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -d '{"firstName":"E2E-Upd","lastName":"Seeker-Upd"}')

if echo "$UPDATE_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  echo "✅ Profil yangilandi"
else
  echo "❌ XATO: $UPDATE_RESPONSE"
fi

echo ""
echo "▶️  [5/9] CHANGE PASSWORD"
PASS_RESPONSE=$(curl -s -X PATCH "$API/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -d "{\"oldPassword\":\"$PASS\",\"newPassword\":\"newpass123\"}")

if echo "$PASS_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  echo "✅ Parol o'zgartirildi"
  SEEKER_TOKEN=$(curl -s -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"identifier\":\"$SEEKER_PHONE\",\"password\":\"newpass123\"}" \
    | jq -r '.data.accessToken')
else
  echo "❌ XATO: $PASS_RESPONSE"
fi

echo ""
echo "▶️  [6/9] CREATE RESUME (Seeker)"
RESUME_RESPONSE=$(curl -s -X POST "$API/resumes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -d '{"title":"E2E Frontend Dasturchi","about":"Test rezyume avtomatik","skills":["React","Next.js"],"languages":["uz","ru"],"location":"Toshkent","expectedSalary":{"min":8000000,"max":15000000,"currency":"UZS"}}')
RESUME_ID=$(echo "$RESUME_RESPONSE" | jq -r '.data._id // empty')

if [ -n "$RESUME_ID" ] && [ "$RESUME_ID" != "null" ]; then
  echo "✅ Rezyume: $RESUME_ID"
else
  echo "❌ XATO: $RESUME_RESPONSE"
fi

echo ""
echo "▶️  [7/9] SWITCH ROLE + CREATE JOB"
curl -s -X PATCH "$API/auth/switch-role" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{"role":"employer"}' > /dev/null
echo "✅ Employer rejimiga o'tildi"

JOB_RESPONSE=$(curl -s -X POST "$API/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{"title":"E2E React Dasturchi","description":"Bu test vakansiya. Kamida 20 belgi talab qilinadi.","category":"IT","employmentType":"full-time","experienceLevel":"middle","salary":{"min":10000000,"max":18000000,"currency":"UZS"},"location":{"city":"Toshkent","country":"UZ"},"company":{"name":"E2E Corp"},"skills":["React"]}')
JOB_ID=$(echo "$JOB_RESPONSE" | jq -r '.data._id // empty')

if [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
  echo "✅ Vakansiya: $JOB_ID"
else
  echo "❌ XATO: $JOB_RESPONSE"
fi

echo ""
echo "▶️  [8/9] APPLY TO JOB (Seeker)"
APPLY_RESPONSE=$(curl -s -X POST "$API/applications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -d "{\"jobId\":\"$JOB_ID\",\"resumeId\":\"$RESUME_ID\",\"coverLetter\":\"Men bu lavozimga mos kelaman!\"}")
APP_ID=$(echo "$APPLY_RESPONSE" | jq -r '.data._id // empty')

if [ -n "$APP_ID" ] && [ "$APP_ID" != "null" ]; then
  echo "✅ Ariza: $APP_ID"
else
  echo "❌ XATO: $APPLY_RESPONSE"
fi

echo ""
echo "▶️  [9/9] EMPLOYER REVIEWS APPLICATION"
APPS_RESPONSE=$(curl -s "$API/applications/job/$JOB_ID" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN")
APP_COUNT=$(echo "$APPS_RESPONSE" | jq -r '.data.applications | length // 0')
echo "✅ Employer ko'rdi (arizalar: $APP_COUNT)"

STATUS_RESPONSE=$(curl -s -X PATCH "$API/applications/$APP_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -d '{"status":"shortlisted"}')

if echo "$STATUS_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  echo "✅ Status → 'shortlisted'"
else
  echo "❌ XATO: $STATUS_RESPONSE"
fi

echo ""
echo "════════════════════════════════════════════════"
echo "🎉 E2E TEST YAKUNLANDI!"
echo "════════════════════════════════════════════════"
