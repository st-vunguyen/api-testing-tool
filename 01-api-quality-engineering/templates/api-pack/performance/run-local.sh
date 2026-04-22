#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORTS_DIR="$(cd "${ROOT_DIR}/../reports/raw" && pwd)"
STACK="${STACK:-k6}"
RUN_SLUG="${RUN_SLUG:-baseline-$(date +%Y%m%d-%H%M%S)}"
OUT_DIR="${OUT_DIR:-${REPORTS_DIR}/performance/${RUN_SLUG}}"

if [[ -f "${ROOT_DIR}/local.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/local.env"
  set +a
fi

mkdir -p "${OUT_DIR}"

if [[ "${SAFE_TO_RUN:-no}" != "yes" ]]; then
  echo "SAFE_TO_RUN is not 'yes'. Refusing to execute performance workload."
  exit 1
fi

case "${STACK}" in
  k6)
    command -v k6 >/dev/null 2>&1 || { echo "k6 is not installed."; exit 1; }
    SCRIPT_PATH="${SCRIPT_PATH:-${ROOT_DIR}/k6-script.js}"
    K6_SUMMARY_EXPORT="${OUT_DIR}/k6-summary.json" \
      k6 run \
      --vus "${VUS:-1}" \
      --duration "${DURATION:-30s}" \
      "${SCRIPT_PATH}" | tee "${OUT_DIR}/k6.log"
    ;;
  postman-newman)
    command -v newman >/dev/null 2>&1 || { echo "newman is not installed."; exit 1; }
    COLLECTION_PATH="${COLLECTION_PATH:-${ROOT_DIR}/newman-performance.collection.json}"
    ENV_PATH="${ENV_PATH:-${ROOT_DIR}/newman-performance.postman_environment.json.example}"
    newman run "${COLLECTION_PATH}" \
      -e "${ENV_PATH}" \
      --reporters cli,json,junit \
      --reporter-json-export "${OUT_DIR}/newman-summary.json" \
      --reporter-junit-export "${OUT_DIR}/newman-junit.xml" | tee "${OUT_DIR}/newman.log"
    ;;
  jmeter)
    JMETER_RUNNER="${JMETER_RUNNER:-${ROOT_DIR}/jmeter/run-jmeter.sh}"
    [[ -f "${JMETER_RUNNER}" ]] || { echo "JMeter runner not found: ${JMETER_RUNNER}"; exit 1; }
    OUT_DIR="${OUT_DIR}" RUN_SLUG="${RUN_SLUG}" SAFE_TO_RUN="${SAFE_TO_RUN}" bash "${JMETER_RUNNER}"
    ;;
  *)
    echo "Unsupported STACK: ${STACK}"
    exit 1
    ;;
esac

echo "Raw outputs written to: ${OUT_DIR}"