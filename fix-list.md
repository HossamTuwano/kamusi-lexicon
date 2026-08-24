# Testing Findings and Required Changes

The following issues and questions were identified during testing. Treat these as product and engineering requirements to investigate and implement.

## 1. Contributor: View My Contributions

A user should be able to see a list of all lexical entries they have contributed.

The list should be available from the user's profile or contributor dashboard.

For each contribution, show useful information such as:

* Word
* Part of speech
* Contribution type
* Current status
* Date submitted
* Whether the contribution was approved, rejected, or pending

The purpose is to let contributors track the work they have added to the Kamusi.

---

## 2. User Interface Language

The user-facing lexical contribution interface should be in **Swahili**.

Where the interface is specifically intended for Swahili speakers or contributors, use clear and natural Kiswahili terminology.

Examples:

* Word → Neno
* Definition → Maana / Ufafanuzi
* Example → Mfano
* Part of speech → Aina ya neno
* Contribution → Mchango
* Pending → Inasubiri uhakiki
* Approved → Imekubaliwa
* Rejected → Imekataliwa

Do not translate technical concepts awkwardly. Use terminology appropriate for a Swahili Kamusi interface.

---

5. Vite Warning

During development, the following warning appears:

```text
[vite:react-babel] We recommend switching to @vitejs/plugin-react-oxc for improved performance.
More information at https://vite.dev/rolldown
```

Investigate whether the project should migrate from the current React Babel plugin to:

```text
@vitejs/plugin-react-oxc
```

This is currently a development/tooling warning rather than a functional bug.

Do not make the migration solely to remove the warning without checking compatibility with the existing project.

---

## 6. Verified Status in Search Results

Currently, searched words appear to contain text such as:

```text
Imethibitishwa
```

Consider removing the written "Imethibitishwa" label from the normal search-result presentation.

Instead, display a **verified icon/badge** next to the word or entry.

Example:

```text
gari  ✓
```

or an appropriate verified icon.

The UI should remain clean while still making the verification status obvious.

The underlying verification status must remain structured data.

Do not remove the actual status from the database merely because the text label is removed from the UI.

---

# 7. Admin Portal Access Control

This is a security requirement.

Users who are not administrators or moderators must not be able to access or log into the admin portal.

The restriction must be enforced server-side.

Do not rely only on:

* hiding the admin button;
* hiding the admin route;
* frontend role checks; or
* redirecting unauthorized users after the page loads.

The backend/API must verify the user's role before allowing access to administrative endpoints.

Expected behavior:

```text
Regular User
    ↓
Admin Portal
    ↓
Access Denied
```

```text
Moderator
    ↓
Admin Portal
    ↓
Moderator permissions
```

```text
Administrator
    ↓
Admin Portal
    ↓
Administrator permissions
```

Frontend and backend authorization should both be implemented.

---

# 8. Moderator Access to User Lists

Question for product/design review:

Should moderators be able to see the list of registered users?

The preferred initial approach is:

### Moderators

Moderators should be able to see only the user information necessary for moderation.

For example:

* username/display name
* contributor status
* contribution count
* moderation history relevant to their work

They should not automatically receive unrestricted access to sensitive account information.

### Administrators

Administrators can have broader user-management capabilities, including:

* viewing users;
* changing roles;
* disabling accounts;
* managing moderators;
* reviewing account activity.

The system should follow the principle of least privilege.

A moderator should receive the minimum user-management access required to perform moderation duties.

---

# 9. Role Management: Admin → Moderator

There is currently a role-management problem:

> When a moderator is promoted to administrator, it is not possible to demote them again.

This should be fixed.

Administrators should be able to change roles in both directions, subject to appropriate safeguards.

For example:

```text
User
 ↓
Moderator
 ↓
Administrator
 ↓
Moderator
```

Role changes should be reversible.

However, introduce safeguards for critical accounts.

For example, the system should prevent an administrator from accidentally removing the final remaining administrator from the system.

A possible rule:

```text
There must always be at least one active administrator.
```

Every role change should also be recorded in an audit log.

Example:

```text
User: username
Previous role: Moderator
New role: Administrator
Changed by: admin_username
Date: timestamp
```

---

# 10. Adding Information to Existing Words

This is an important product requirement.

A user may already know something about an existing word and want to contribute additional information.

For example, the word already exists:

```text
gari
```

with an existing definition.

Another user knows an additional meaning and example sentence.

They should not need to create a duplicate word entry.

Instead, the system should allow them to propose an addition to the existing lexical entry.

Example:

```text
Existing entry

gari

Meaning 1:
Chombo cha usafiri...

Example:
Nimenunua gari jipya.
```

A contributor could select:

```text
+ Ongeza maana
+ Ongeza mfano
+ Ongeza kisawe
+ Ongeza tafsiri
+ Pendekeza marekebisho
```

Their submission should enter the moderation workflow.

---

# 11. Proposed Contribution Model

Separate the **lexical entry** from the **contributions made to that entry**.

For example:

```text
LEXICAL ENTRY
    gari
       |
       |-- Definition 1
       |-- Definition 2
       |-- Example 1
       |-- Synonym
       |-- Translation
       |
       +-- Contribution history
```

A contributor submits a proposed change:

```text
Contributor
    ↓
Select existing word
    ↓
Select contribution type
    ↓
Submit proposed information
    ↓
Moderation
    ↓
Approved / Rejected
    ↓
If approved → becomes part of lexical entry
```

This is preferable to allowing contributors to directly edit the canonical entry.

---

# 12. Contribution Types

The contribution system should eventually support different types of additions.

Initial contribution types could include:

* New word
* New definition
* Additional definition
* Example sentence
* Additional example
* Synonym
* Antonym
* Related word
* Derived word
* Pronunciation
* Usage note
* Translation
* Correction to existing information

Each contribution should retain:

* contributor
* timestamp
* affected lexical entry
* contribution type
* submitted content
* moderation status
* reviewer
* review timestamp
* rejection reason, if rejected

---

# 13. Important Architectural Principle

Do not treat a word as a single block of text.

A lexical entry should be composed of structured linguistic information.

For example:

```text
gari

├── Aina ya neno
│   └── Nomino
│
├── Maana
│   ├── Maana 1
│   └── Maana 2
│
├── Mifano
│   ├── Mfano 1
│   └── Mfano 2
│
├── Visawe
│
├── Vinyume
│
├── Maneno yenye uhusiano
│
├── Maneno yanayotokana nayo
│
├── Matamshi
│
├── Tafsiri
│   ├── English
│   ├── German
│   └── Spanish
│
└── Historia ya michango
```

This structure is important for the future Swahili-first lexical database.

The core information should remain **Swahili → Swahili**.

Translations are secondary data attached to the Swahili lexical entry.

---

# 14. Testing Priority

Prioritize the issues in this order:

### High Priority

1. Admin portal authorization
2. Role management and demotion
3. Prevent self-voting
4. Ability to contribute information to existing words
5. Structured parts of speech

### Medium Priority

6. Contributor contribution history
7. Verified icon/status presentation
8. Moderator user visibility and permissions

### Low Priority / Development Tooling

9. Vite React OXC warning

---

# 15. Product Principle

The goal of these changes is to make the contribution system work naturally for a community-maintained Swahili Kamusi.

Users should be able to:

1. Find an existing word.
2. Read its current Swahili definitions and information.
3. Add missing information to that word.
4. Submit the contribution for review.
5. Receive appropriate attribution.
6. See their contribution history.
7. Allow moderators to review it.
8. Have the approved information become part of the canonical lexical entry.

The system should discourage duplicate entries while making it easy for people with knowledge of a word to improve an existing entry.
