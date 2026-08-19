# 🧪 PHASE 1 MANUAL QA CHECKLIST

Use this checklist on the **Staging** environment before the MVP release. 
Every "Pass" must be verified by a human.

## 👤 Visitor Flows (Unauthenticated)
- [ ] **F1: Search & Read**
    - [ ] Search for a verified word $\rightarrow$ entry renders correctly.
    - [ ] Open entry $\rightarrow$ senses and examples are visible.
    - [ ] Click synonym/antonym link $\rightarrow$ redirects to correct entry.
- [ ] **F2: Empty/No-Result**
    - [ ] Search for gibberish $\rightarrow$ renders a clean "No results found" state (no 500 error).
- [ ] **F3: Access Control**
    - [ ] Attempt to access `/contribute` or `/vote` directly via URL $\rightarrow$ redirected to Login/Auth.

## ✍️ Contributor Flows (Authenticated)
- [ ] **F4: Contribution Loop**
    - [ ] Register new account $\rightarrow$ successful.
    - [ ] Submit a new lemma with $\ge 1$ sense and example $\rightarrow$ entry is "Pending".
    - [ ] Verify the entry does **not** appear in public search until verified.
- [ ] **F5: Voting**
    - [ ] Vote +1 on an entry $\rightarrow$ count increases.
    - [ ] Retract vote $\rightarrow$ count decreases.
- [ ] **F6: Reporting**
    - [ ] Report an entry with a reason and note $\rightarrow$ success message shown.
    - [ ] Attempt to report the same entry twice $\rightarrow$ handled gracefully (409 or message).

## 🛡️ Moderator & Admin Flows (Privileged)
- [ ] **F7: Verification**
    - [ ] Open Admin Pending Queue $\rightarrow$ find the entry from F4.
    - [ ] Click "Verify" $\rightarrow$ entry now appears in public search.
- [ ] **F8: Visibility Control**
    - [ ] Hide a verified entry $\rightarrow$ disappears from public search.
    - [ ] Restore a hidden entry $\rightarrow$ reappears.
    - [ ] Bulk verify multiple entries $\rightarrow$ all states flip correctly.
- [ ] **F9: Report Resolution**
    - [ ] Verify/Hide an entry that has reports $\rightarrow$ `reportCount` resets to 0.
- [ ] **F10: User Management**
    - [ ] Promote a contributor to moderator $\rightarrow$ user can now access Admin UI.
    - [ ] Demote a moderator back to contributor $\rightarrow$ access revoked.
- [ ] **F11: Self-Guard**
    - [ ] Attempt to demote own admin role $\rightarrow$ 403 Forbidden.
    - [ ] Attempt to demote the last remaining admin $\rightarrow$ 403 Forbidden.

## 🔐 Security & Edge Cases
- [ ] **F12: Auth Failures**
    - [ ] Login with wrong password $\rightarrow$ 401 Unauthorized.
    - [ ] Login with non-existent user $\rightarrow$ 401 (no username enumeration).
- [ ] **F13: Concurrency**
    - [ ] Double-submit a contribution form rapidly $\rightarrow$ only one entry created.
- [ ] **Unicode/Sorting**
    - [ ] Search for words with digraphs (`ch`, `ng`, `ny`) $\rightarrow$ results match correctly.
- [ ] **Input Validation**
    - [ ] Submit an entry with an empty definition $\rightarrow$ rejected by API.
    - [ ] Submit an entry with 10k+ characters in definition $\rightarrow$ handled gracefully.

---
**Verification Sign-off:**
- [ ] All F1–F13 Passed.
- [ ] Edge cases handled.
- [ ] Load test targets met.
