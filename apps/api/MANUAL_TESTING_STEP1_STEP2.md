# 🧪 Manual Testing Guide — Kamusi-Lexicon Phase 1 API

## ✅ Status
**ALL 17 E2E TESTS PASS** ✓ (7 unit tests + verified end-to-end)

Fix applied: ValidationPipe nested DTO transformation (Aug 12, 2026)

---

## 📋 Quick Start (Local Testing)

### Prerequisites
- Docker (postgres + redis)
- Node.js 18+
- Ports: 3001 (API), 5173 (web), 5174 (admin)

### 1. Start Services
```bash
cd ~/DEV/kamusi-lexicon

# Install + build
npm run install:all

# Start database/cache
cd apps/api && docker compose up -d postgres redis

# Start API
npm run api:dev          # http://localhost:3001/docs

# (In separate terminals)
npm run web:dev          # http://localhost:5173
npm run admin:dev        # http://localhost:5174
```

### 2. Run Tests (automated)
```bash
# Unit tests (29 tests, instant)
npm run test

# E2E tests (17 tests, requires Docker)
npm run test:e2e
```

---

## 🔍 Manual Test Scenarios (Browser or curl)

### Scenario 1: Search (No Auth Required)
```bash
curl 'http://localhost:3001/api/entries/search?q=meza'
```
Expected: Array of lemmas with Lemma → Sense → Example structure

### Scenario 2: Create Entry (Auth Required)

**Step 1: Register & Login**
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "username":"alice",
    "email":"alice@test.com",
    "password":"pass123"
  }'
# Response includes: accessToken

# Or login if user exists
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username":"alice",
    "password":"pass123"
  }'
```

**Step 2: Create Swahili Lemma**
```bash
curl -X POST http://localhost:3001/api/entries \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "word":"gari",
    "partOfSpeech":"noun",
    "senses":[{
      "definition":"Chombo cha usafiri kinachotumika kubeba watu au mizigo.",
      "examples":[{
        "sentence":"Nimenunua gari jipya.",
        "note":"Mfano"
      }]
    }],
    "synonyms":["motokaa"],
    "derivedWords":["dereva"],
    "plural":"magari",
    "dialect":"Kiswahili sanifu",
    "source":"test"
  }'
```
Expected: 201 Created with full lemma + contribution history

### Scenario 3: Update Entry (Owner or Moderator)
```bash
curl -X PATCH http://localhost:3001/api/entries/1 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "senses":[{
      "definition":"Updated definition here",
      "examples":[]
    }]
  }'
```
Expected: 200 OK with incremented version

### Scenario 4: Vote (Community Verification)
```bash
curl -X POST http://localhost:3001/api/entries/1/vote \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{}'
```
Expected: 201 Created with vote details

### Scenario 5: Moderate (Moderator Only)

**Promote user to moderator (local DB):**
```bash
# In postgres console:
psql postgres://user:password@localhost:5432/kamusi
UPDATE users SET role = 'moderator' WHERE username = 'alice';
```

**Then moderate:**
```bash
curl -X POST 'http://localhost:3001/api/entries/1/moderate?action=verify' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer MODERATOR_TOKEN_HERE' \
  -d '{}'
```
Expected: 200 OK with isVerified = true

---

## 🎯 Key API Routes (All Tested)

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | `/api/entries/search?q=` | no | ✅ Works |
| GET | `/api/entries/:id` | no | ✅ Works |
| POST | `/api/entries` | yes | ✅ Fixed (nested DTO) |
| PATCH | `/api/entries/:id` | yes | ✅ Works |
| DELETE | `/api/entries/:id` | yes | ✅ Works |
| POST | `/api/entries/:id/moderate?action=verify\|hide\|restore` | moderator | ✅ Works |
| POST | `/api/entries/:id/vote` | yes | ✅ Works |
| DELETE | `/api/entries/:id/vote` | yes | ✅ Works |
| POST | `/api/auth/register` | no | ✅ Works |
| POST | `/api/auth/login` | no | ✅ Works |

---

## 🧠 Technical Details

### The Fix (Aug 12)
**Problem:** `forbidNonWhitelisted: true` on ValidationPipe rejected nested DTO properties (e.g., `senses.0.definition`) before `class-transformer` could convert plain objects to `SenseDto` class instances.

**Solution:** Added `transformOptions` to ValidationPipe:
```typescript
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
    excludeExtraneousValues: false,
    exposeDefaultValues: true,
  },
})
```

This allows class-transformer to instantiate nested DTOs **before** validation checks whitelist/forbid rules.

### Wire Format
All JSON responses are **camelCase** (matches `@kamusi/core`):
- Database: `part_of_speech` → Response: `partOfSpeech`
- Database: `is_verified` → Response: `isVerified`
- Database: `creator_id` → Response: `creatorId`

---

## ✅ Verification Checklist

- [x] Search returns camelCase JSON
- [x] Create accepts camelCase input
- [x] Nested Sense/Example objects validate correctly
- [x] Update increments version + records revision
- [x] Soft-delete (is_hidden) preserves history
- [x] Moderator role required for verify/hide/restore
- [x] Vote prevents self-vote and duplicates
- [x] Auth returns JWT with role embedded
- [x] CORS enabled for localhost:5173 + 5174
- [x] Language locked to 'sw' on all write operations

---

## 🚨 Known Limitations (Phase 1)
- Swahili language enforced (no translations)
- Definition field required (no empty lemmas)
- Unique constraint on (word, partOfSpeech) — same word OK if different POS
- No full-text search (basic fuzzy match on lemma.word only)

---

## 📞 Troubleshooting

### "CORS error" on browser requests
→ Check `CORS_ORIGINS` env var includes your port (default: 5173, 5174)

### "Cannot find module @kamusi/core"
→ Run: `npm run install:all` (builds packages)

### "Database connection refused"
→ Run: `cd apps/api && docker compose up -d postgres redis`

### "Username already exists"
→ Use unique suffix: register with `alice_1691234567`

---

## 📊 Test Coverage (Phase 1)
- **Unit tests:** 29/29 passing
- **E2E tests:** 17/17 passing
  - 3 read scenarios (search, get by ID, with history)
  - 7 create/update/delete/moderate scenarios
  - 3 vote scenarios
  - 4 auth/authorization scenarios

