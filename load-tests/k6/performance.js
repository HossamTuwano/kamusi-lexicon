import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests must be below 300ms
    http_req_failed: ['rate<0.01'],   // Error rate must be below 1%
  },
};

const API_URL = 'http://localhost:3001/api';

export default function () {
  // 1. Search for a common word (Read-heavy)
  const searchRes = http.get(`${API_URL}/entries/search?q=meza`);
  check(searchRes, { 'search status 200': (r) => r.status === 200 });

  // 2. Get a specific entry (Read-heavy)
  const detailRes = http.get(`${API_URL}/entries/241`);
  check(detailRes, { 'detail status 200': (r) => r.status === 200 });

  // 3. Small delay to simulate human reading
  sleep(1);
}
