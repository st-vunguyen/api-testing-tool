#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PERF_DIR="$(cd "${ROOT_DIR}/.." && pwd)"
REPORTS_DIR="$(cd "${PERF_DIR}/../reports/raw" && pwd)"
RUN_SLUG="${RUN_SLUG:-jmeter-$(date +%Y%m%d-%H%M%S)}"
OUT_DIR="${OUT_DIR:-${REPORTS_DIR}/performance/jmeter/${RUN_SLUG}}"
TEST_PLAN_PATH="${TEST_PLAN_PATH:-${ROOT_DIR}/starter-test-plan.jmx}"
USER_PROPERTIES_PATH="${USER_PROPERTIES_PATH:-${ROOT_DIR}/user.properties}"
REPORT_PROPERTIES_PATH="${REPORT_PROPERTIES_PATH:-${ROOT_DIR}/reportgenerator.properties}"
RESULTS_FILE="${RESULTS_FILE:-${OUT_DIR}/results.csv}"
LOG_FILE="${LOG_FILE:-${OUT_DIR}/jmeter.log}"
HTML_REPORT_DIR="${HTML_REPORT_DIR:-${OUT_DIR}/report-output}"
DASHBOARD_HTML="${DASHBOARD_HTML:-${OUT_DIR}/dashboard.html}"
JMETER_BIN="${JMETER_BIN:-jmeter}"
RENDERER_SCRIPT="${RENDERER_SCRIPT:-${ROOT_DIR}/render-jmeter-dashboard.js}"

if [[ -f "${PERF_DIR}/local.env" ]]; then
  set -a
  source "${PERF_DIR}/local.env"
  set +a
fi

mkdir -p "${OUT_DIR}"

if [[ "${SAFE_TO_RUN:-no}" != "yes" ]]; then
  echo "SAFE_TO_RUN is not 'yes'. Refusing to execute JMeter workload."
  exit 1
fi

command -v "${JMETER_BIN}" >/dev/null 2>&1 || { echo "JMeter executable not found: ${JMETER_BIN}"; exit 1; }

"${JMETER_BIN}" -n \
  -t "${TEST_PLAN_PATH}" \
  -q "${USER_PROPERTIES_PATH}" \
  -q "${REPORT_PROPERTIES_PATH}" \
  -l "${RESULTS_FILE}" \
  -j "${LOG_FILE}" \
  -e -o "${HTML_REPORT_DIR}"

if [[ -f "${RENDERER_SCRIPT}" ]]; then
  node "${RENDERER_SCRIPT}" \
    --stats "${HTML_REPORT_DIR}/statistics.json" \
    --output "${DASHBOARD_HTML}" \
    --title "JMeter Executive Dashboard" \
    --run-label "${RUN_SLUG}" || true
fi

echo "JMeter raw outputs written to: ${OUT_DIR}"
