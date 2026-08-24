# PHASE 1 MANUAL QA CHECKLIST

Use this checklist on the staging or local test environment before the MVP release.
Every step must be verified by a human tester.

---

## 1. Visitor Flows (Unauthenticated)

- [ ] **F1: Search and Read**
  - [ ] Search for a verified Swahili word (e.g. `gari`).
  - [ ] Verify the search result displays the word and Swahili part-of-speech label (e.g. `Nomino (N)`).
  - [ ] Verify that verified entries display a verified icon/badge rather than an intrusive plain-text label.
  - [ ] Open the entry and verify senses, definitions, and example sentences render clearly.
  - [ ] Follow synonym, antonym, or derived word links and verify navigation works.
- [ ] **F2: Empty and No-Result Handling**
  - [ ] Search for a non-existent word or gibberish (e.g. `xyzabc123`).
  - [ ] Verify a clean "Hakuna matokeo" (no results) state renders without server or console errors.
- [ ] **F3: Unauthenticated Access Control**
  - [ ] Attempt to access `/contribute` directly via URL without logging in.
  - [ ] Verify user is prompted or redirected to log in / register.
  - [ ] Attempt to vote or report via API without a bearer token and verify `401 Unauthorized`.

---

## 2. Contributor Flows (Authenticated)

- [ ] **F4: User Registration and Login**
  - [ ] Register a new contributor account.
  - [ ] Log in with the registered credentials.
  - [ ] Verify the received JWT grants the `contributor` role.
- [ ] **F5: Create New Lemma (Contribution Loop)**
  - [ ] Navigate to `/contribute`.
  - [ ] Select a Swahili part of speech from the dropdown (e.g. `Nomino (N)`, `Kitenzi (T)`).
  - [ ] Submit a new word with at least one sense definition and example sentence.
  - [ ] Verify entry is created with status `isVerified=false` (Pending).
  - [ ] Verify the pending word does **not** appear in public search results.
- [ ] **F6: Propose Additions to Existing Lemmas**
  - [ ] Open an existing lemma.
  - [ ] Submit a contribution proposal to add a new sense or example sentence (`POST /api/entries/contribute`).
  - [ ] Verify the proposal is created with status `pending`.
  - [ ] Verify the existing canonical entry remains unchanged until the proposal is approved.
- [ ] **F7: Track My Contributions**
  - [ ] Query user contribution history (`GET /api/users/me/contributions`).
  - [ ] Verify all submitted entries and proposals appear with timestamps, actions, and current status (`pending`, `approved`, or `rejected`).
  - [ ] Filter contributions by status (`?status=pending`, `?status=approved`).
- [ ] **F8: Voting and Vote Safeguards**
  - [ ] Vote (+1) on a lemma contributed by another user -> vote count increases.
  - [ ] Retract the vote -> vote count decreases.
  - [ ] Attempt to vote on your own contributed lemma -> rejected with `403 Forbidden` ("Huwezi kupiga kura kwa mchango wako mwenyewe").
  - [ ] Attempt to submit duplicate vote -> handled with `409 Conflict`.
- [ ] **F9: Reporting and Flagging**
  - [ ] Click "Ripoti tatizo" on an entry and select a reason (`spam`, `offensive`, `wrong`, `duplicate`, `other`) with an optional note.
  - [ ] Submit report and verify confirmation message ("Asante! Ripoti imepokelewa kwa wasimamizi.").
  - [ ] Verify the reported entry remains accessible to public visitors until a moderator acts.
  - [ ] Attempt to report the same entry again -> rejected with `409 Conflict`.
  - [ ] Attempt to report your own entry -> rejected with `403 Forbidden`.

---

## 3. Moderator and Admin Flows (Privileged)

- [ ] **F10: Portal Access Control**
  - [ ] Attempt to access the admin portal (`http://localhost:5174`) with a `contributor` account -> access denied (`403 Forbidden` / "Huna ruhusa ya kufikia ukurasa huu").
  - [ ] Log in with a `moderator` account -> successfully view moderation queue.
  - [ ] Log in with an `admin` account -> full access to moderation queue and user management.
- [ ] **F11: Moderation Queue and Verification**
  - [ ] Open the Admin Dashboard "Pending" tab.
  - [ ] Find the pending lemma created in F5.
  - [ ] Click "Verify" -> entry moves to verified.
  - [ ] Search for the word on the public web app -> verify it now appears in public search results.
- [ ] **F12: Visibility Control (Hide and Restore)**
  - [ ] Click "Hide" on a verified entry -> entry disappears from public search.
  - [ ] Switch to the "Hidden" tab in the admin dashboard.
  - [ ] Click "Restore" -> entry reappears in public search results.
  - [ ] Test bulk moderation: select multiple entries and click bulk "Verify" or "Hide" -> verify all states update.
- [ ] **F13: Review Contribution Proposals**
  - [ ] Review pending proposals submitted for existing lemmas.
  - [ ] Approve an `add_sense` proposal (`PATCH /api/entries/contributions/:id/approve`) -> verify the new sense is merged into the canonical lemma.
  - [ ] Reject a proposal (`PATCH /api/entries/contributions/:id/reject`) with a reason note -> verify proposal status becomes `rejected`.
- [ ] **F14: Report Resolution**
  - [ ] Open the "Reported" tab in the admin dashboard.
  - [ ] Verify the reported lemma from F9 is listed with its open report count and details.
  - [ ] Execute a moderator action (Verify, Hide, or Restore).
  - [ ] Verify all open reports for that lemma resolve to `resolved` and `reportCount` resets to 0.
- [ ] **F15: User Role Management (Admin Only)**
  - [ ] Open `/users` in the admin portal as an administrator.
  - [ ] Promote a `contributor` to `moderator` -> verify user can now log into the admin portal.
  - [ ] Demote a `moderator` to `contributor` -> verify admin portal access is revoked.
  - [ ] Verify that all user list responses strip password hashes.
- [ ] **F16: Role Safeguards**
  - [ ] Attempt to demote your own active admin account -> rejected with `403 Forbidden`.
  - [ ] Attempt to demote the last remaining admin in the database -> rejected with `403 Forbidden` ("Cannot demote the last admin").

---

## 4. Security, Linguistic Rules, and Edge Cases

- [ ] **F17: Authentication Security**
  - [ ] Attempt login with incorrect password -> `401 Unauthorized`.
  - [ ] Attempt login with non-existent username -> `401 Unauthorized` (no username enumeration in error message).
  - [ ] Verify passwords in database are hashed with bcrypt (cost >= 10).
- [ ] **F18: Linguistic Categorization and Validation**
  - [ ] Verify all 8 Swahili grammatical categories are supported:
    - Nomino (N)
    - Viwakilishi (W)
    - Vivumishi (V)
    - Vitenzi (T)
    - Vielezi (E)
    - Viunganishi (U)
    - Vihisishi / Viingizi (I)
    - Vihusishi (H)
  - [ ] Submit an entry with an empty or whitespace-only definition -> rejected with `400 Bad Request`.
  - [ ] Submit an incomplete English-only gloss (e.g. `car`) -> rejected with `400 Bad Request` requiring a full Swahili definition.
  - [ ] Submit a long definition (10,000+ characters) -> handled gracefully without crashing the server.
- [ ] **F19: Swahili Digraphs and Search Normalization**
  - [ ] Search words containing Swahili digraphs (`ch`, `ng`, `ny`, `dh`, `th`, `gh`, `sh`) -> returns correct matches.
  - [ ] Verify search query trimming and case-insensitive matching.
- [ ] **F20: Uniqueness and Concurrency**
  - [ ] Attempt to create a lemma with the exact same `(word, part_of_speech)` duplicate -> rejected with `409 Conflict`.
  - [ ] Verify creating the same word under a different part of speech (e.g. `piga` as Kitenzi vs Nomino) is permitted.
  - [ ] Double-submit a contribution form rapidly -> only one entry created.

---

## Verification Sign-Off

- [ ] All flows (F1 to F20) verified and passed.
- [ ] Edge cases, role guards, and linguistic rules validated.
- [ ] Backend and frontend logs verified clean of unhandled exceptions.
- [ ] Ready for MVP release and pilot user onboarding.
