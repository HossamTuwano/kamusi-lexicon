import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 50 }, // Ramp up to 50 users
    { duration: "5m", target: 50 }, // Stay at 50 users
    { duration: "2m", target: 100 }, // Ramp up to 100 users
    { duration: "5m", target: 100 }, // Stay at 100 users
    { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<300"], // 95% of requests must complete below 300ms
    http_req_failed: ["rate<0.01"], // Error rate must be less than 1%
  },
};

const API_URL = "http://localhost:3001/api";

export default function () {
  // 1. Read-heavy: Search for a word (90% weight)
  const searchTerms = ["apple", "banana", "dira", "kamusi", "kitabu"];
  const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  const searchRes = http.get(`${API_URL}/entries/search?q=${term}`);
  check(searchRes, {
    "search status is 200": (r) => r.status === 200,
  });

  // 2. Read-heavy: Get entry detail (90% weight)
  // Note: In a real test, we'd use a real ID from the search result
  const entryId = 1;
  const detailRes = http.get(`${API_URL}/entries/${entryId}`);
  check(detailRes, {
    "detail status is 200": (r) => r.status === 200,
  });

  // 3. Auth: Login (3% weight)
  if (Math.random() < 0.03) {
    const loginRes = http.post(
      `${API_URL}/auth/login`,
      JSON.stringify({
        username: "testuser",
        password: "password123",
      }),
      { headers: { "Content-Type": "application/json" } },
    );
    check(loginRes, {
      "login status is 200": (r) => r.status === 200,
    });
  }

  // 4. Write: Contribute (3% weight)
  if (Math.random() < 0.03) {
    // Assuming we have a token for this user
    const token = "mock-token-here";
    const contributeRes = http.post(
      `${API_URL}/entries`,
      JSON.stringify({
        word: "newword" + Math.random(),
        senses: [{ definition: "test definition" }],
      }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    // We expect a 401 if the token is mock, but for load testing we care about server stability
    check(contributeRes, {
      "contribute request handled": (r) => r.status !== 500,
    });
  }

  // 5. Social: Vote/Report (3% weight)
  if (Math.random() < 0.03) {
    const token = "mock-token-here";
    const voteRes = http.post(
      `${API_URL}/entries/1/vote`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    check(voteRes, {
      "vote request handled": (r) => r.status !== 500,
    });
  }

  sleep(1);
}
