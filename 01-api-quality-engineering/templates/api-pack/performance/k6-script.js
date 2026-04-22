import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: Number(__ENV.VUS || 1),
  duration: __ENV.DURATION || '30s',
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const targetPath = __ENV.TARGET_PATH || '/';
const authHeader = __ENV.AUTH_HEADER || '';
const authToken = __ENV.AUTH_TOKEN || '';

export default function () {
  const headers = {};
  if (authHeader && authToken) {
    headers[authHeader] = authToken;
  }

  const response = http.get(`${baseUrl}${targetPath}`, { headers });

  check(response, {
    'status is below 500': (res) => res.status < 500,
  });

  sleep(1);
}