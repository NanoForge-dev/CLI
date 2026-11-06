#!/usr/bin/env bash

set -uo pipefail

START_TIME=$(date +%s)
STARTED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
REPO_NAME="${REPO_NAME:-CLI}"
export REPORT_DIR="${REPORT_DIR:-reports}"
RAW_DIR=$(mktemp -d "/tmp/nightly-${REPO_NAME}.XXXXXX")

mkdir -p "$REPORT_DIR"

cleanup() {
    rm -rf "$RAW_DIR"
}
trap cleanup EXIT

require_bins() {
    local bin
    for bin in git bash jq pnpm; do
        if ! command -v "$bin" >/dev/null 2>&1; then
            echo "Required command not found: $bin" >&2
            return 1
        fi
    done
}

setup() {
    echo "=== [Nightly Setup: $REPO_NAME] ==="

    if [[ ! -f ".env" ]] && [[ -f ".env.example" ]]; then
        cp .env.example .env
    fi

    if [[ ! -d "node_modules" ]]; then
        echo "Installing dependencies..."
        pnpm install --frozen-lockfile || pnpm install
    fi

    echo "Building workspace packages..."
    pnpm run build || true
}

discover_unit_packages() {
    local pkgs=()
    if [[ -f "package.json" ]]; then
        pkgs+=(".")
    fi
    for d in libs/*; do
        if [[ -f "$d/package.json" ]]; then
            pkgs+=("$d")
        fi
    done
    echo "${pkgs[@]}"
}

run_unit_tests() {
    echo "=== [Running Unit Tests with Coverage] ==="
    local unit_start unit_end unit_duration
    local overall_unit_exit=0
    unit_start=$(date +%s)

    local pkgs=($(discover_unit_packages))
    local total_tests=0 passed_tests=0 failed_tests=0 skipped_tests=0
    local total_suites=0 passed_suites=0 failed_suites=0
    local cov_files=()

    mkdir -p "$RAW_DIR/coverage"

    for pkg_dir in "${pkgs[@]}"; do
        local pkg_name
        pkg_name=$(jq -r '.name // empty' "$pkg_dir/package.json" 2>/dev/null)
        local safe_name
        safe_name=$(echo "$pkg_name" | tr '/@' '__')
        echo "--- Unit tests for $pkg_name ($pkg_dir) ---"

        local pkg_cov_dir="$RAW_DIR/coverage/$safe_name"
        local pkg_results="$RAW_DIR/unit-$safe_name.json"
        mkdir -p "$pkg_cov_dir"

        local pkg_exit=0
        if [[ "$pkg_dir" == "." ]]; then
            pnpm vitest run -c vitest.config.ts \
                --coverage \
                --coverage.reporter=text \
                --coverage.reporter=json-summary \
                --coverage.reportsDirectory="$pkg_cov_dir" \
                --reporter=default \
                --reporter=json \
                --outputFile="$pkg_results" || pkg_exit=$?
        else
            pnpm --filter "$pkg_name" exec vitest run -c vitest.config.ts \
                --coverage \
                --coverage.reporter=text \
                --coverage.reporter=json-summary \
                --coverage.reportsDirectory="$pkg_cov_dir" \
                --reporter=default \
                --reporter=json \
                --outputFile="$pkg_results" || pkg_exit=$?
        fi

        if [[ "$pkg_exit" -ne 0 ]]; then
            overall_unit_exit=$pkg_exit
        fi

        if [[ -f "$pkg_results" ]]; then
            local t_tot t_pass t_fail t_skip s_tot s_pass s_fail
            t_tot=$(jq -r '.numTotalTests // 0' "$pkg_results")
            t_pass=$(jq -r '.numPassedTests // 0' "$pkg_results")
            t_fail=$(jq -r '.numFailedTests // 0' "$pkg_results")
            t_skip=$(jq -r '.numPendingTests // 0' "$pkg_results")
            s_tot=$(jq -r '.numTotalTestSuites // 0' "$pkg_results")
            s_pass=$(jq -r '.numPassedTestSuites // 0' "$pkg_results")
            s_fail=$(jq -r '.numFailedTestSuites // 0' "$pkg_results")

            total_tests=$((total_tests + t_tot))
            passed_tests=$((passed_tests + t_pass))
            failed_tests=$((failed_tests + t_fail))
            skipped_tests=$((skipped_tests + t_skip))
            total_suites=$((total_suites + s_tot))
            passed_suites=$((passed_suites + s_pass))
            failed_suites=$((failed_suites + s_fail))
        fi

        if [[ -f "$pkg_cov_dir/coverage-summary.json" ]]; then
            cov_files+=("$pkg_cov_dir/coverage-summary.json")
        fi
    done

    unit_end=$(date +%s)
    unit_duration=$((unit_end - unit_start))

    local status="failed"
    if [[ "$overall_unit_exit" -eq 0 ]]; then
        status="passed"
    fi

    jq -n \
        --arg name "unit" \
        --arg status "$status" \
        --argjson exit_code "$overall_unit_exit" \
        --argjson duration "$unit_duration" \
        --argjson tests_total "$total_tests" \
        --argjson tests_passed "$passed_tests" \
        --argjson tests_failed "$failed_tests" \
        --argjson tests_skipped "$skipped_tests" \
        --argjson suites_total "$total_suites" \
        --argjson suites_passed "$passed_suites" \
        --argjson suites_failed "$failed_suites" \
        '{
            name: $name,
            status: $status,
            exit_code: $exit_code,
            duration_seconds: $duration,
            tests_total: $tests_total,
            tests_passed: $tests_passed,
            tests_failed: $tests_failed,
            tests_skipped: $tests_skipped,
            suites_total: $suites_total,
            suites_passed: $suites_passed,
            suites_failed: $suites_failed
        }' > "$RAW_DIR/unit.json"

    # Aggregate coverage JSON across all packages
    if [[ ${#cov_files[@]} -gt 0 ]]; then
        jq -s '
            [ .[] | .total // {} ] as $totals |
            reduce $totals[] as $c (
                {"lines": {"total": 0, "covered": 0, "skipped": 0},
                 "statements": {"total": 0, "covered": 0, "skipped": 0},
                 "functions": {"total": 0, "covered": 0, "skipped": 0},
                 "branches": {"total": 0, "covered": 0, "skipped": 0}};
                .lines.total += ($c.lines.total // 0) |
                .lines.covered += ($c.lines.covered // 0) |
                .lines.skipped += ($c.lines.skipped // 0) |
                .statements.total += ($c.statements.total // 0) |
                .statements.covered += ($c.statements.covered // 0) |
                .statements.skipped += ($c.statements.skipped // 0) |
                .functions.total += ($c.functions.total // 0) |
                .functions.covered += ($c.functions.covered // 0) |
                .functions.skipped += ($c.functions.skipped // 0) |
                .branches.total += ($c.branches.total // 0) |
                .branches.covered += ($c.branches.covered // 0) |
                .branches.skipped += ($c.branches.skipped // 0)
            ) |
            with_entries(
                .value += {
                    pct: (if .value.total > 0 then (((.value.covered / .value.total) * 10000 | round) / 100) else 100 end)
                }
            )
        ' "${cov_files[@]}" > "$RAW_DIR/coverage.json"
    else
        echo "{}" > "$RAW_DIR/coverage.json"
    fi

    return "$overall_unit_exit"
}

run_e2e_tests() {
    echo "=== [Running E2E Tests] ==="

    if [[ "${SKIP_E2E:-false}" == "true" ]]; then
        echo "SKIP_E2E is set; skipping E2E tests"
        set_e2e_skipped "skipped_by_configuration"
        return 0
    fi

    local e2e_start e2e_end e2e_duration
    local overall_e2e_exit=0
    e2e_start=$(date +%s)

    local total_tests=0 passed_tests=0 failed_tests=0 skipped_tests=0
    local total_suites=0 passed_suites=0 failed_suites=0

    # 1. Root CLI E2E tests
    if [[ -f "vitest.config.e2e.ts" ]]; then
        echo "--- Root CLI E2E tests ---"
        local root_e2e_exit=0
        local root_results="$RAW_DIR/e2e-root.json"
        pnpm vitest run -c vitest.config.e2e.ts \
            --reporter=default \
            --reporter=json \
            --outputFile="$root_results" || root_e2e_exit=$?

        if [[ "$root_e2e_exit" -ne 0 ]]; then
            overall_e2e_exit=$root_e2e_exit
        fi

        if [[ -f "$root_results" ]]; then
            local t_tot t_pass t_fail t_skip s_tot s_pass s_fail
            t_tot=$(jq -r '.numTotalTests // 0' "$root_results")
            t_pass=$(jq -r '.numPassedTests // 0' "$root_results")
            t_fail=$(jq -r '.numFailedTests // 0' "$root_results")
            t_skip=$(jq -r '.numPendingTests // 0' "$root_results")
            s_tot=$(jq -r '.numTotalTestSuites // 0' "$root_results")
            s_pass=$(jq -r '.numPassedTestSuites // 0' "$root_results")
            s_fail=$(jq -r '.numFailedTestSuites // 0' "$root_results")

            total_tests=$((total_tests + t_tot))
            passed_tests=$((passed_tests + t_pass))
            failed_tests=$((failed_tests + t_fail))
            skipped_tests=$((skipped_tests + t_skip))
            total_suites=$((total_suites + s_tot))
            passed_suites=$((passed_suites + s_pass))
            failed_suites=$((failed_suites + s_fail))
        fi
    fi

    # 2. Schematics E2E tests
    if [[ -f "libs/schematics/vitest.config.e2e.ts" ]]; then
        echo "--- Schematics E2E tests ---"
        local sch_e2e_exit=0
        local sch_results="$RAW_DIR/e2e-schematics.json"
        pnpm --filter @nanoforge-dev/schematics exec vitest run -c vitest.config.e2e.ts \
            --reporter=default \
            --reporter=json \
            --outputFile="$sch_results" || sch_e2e_exit=$?

        if [[ "$sch_e2e_exit" -ne 0 ]]; then
            overall_e2e_exit=$sch_e2e_exit
        fi

        if [[ -f "$sch_results" ]]; then
            local t_tot t_pass t_fail t_skip s_tot s_pass s_fail
            t_tot=$(jq -r '.numTotalTests // 0' "$sch_results")
            t_pass=$(jq -r '.numPassedTests // 0' "$sch_results")
            t_fail=$(jq -r '.numFailedTests // 0' "$sch_results")
            t_skip=$(jq -r '.numPendingTests // 0' "$sch_results")
            s_tot=$(jq -r '.numTotalTestSuites // 0' "$sch_results")
            s_pass=$(jq -r '.numPassedTestSuites // 0' "$sch_results")
            s_fail=$(jq -r '.numFailedTestSuites // 0' "$sch_results")

            total_tests=$((total_tests + t_tot))
            passed_tests=$((passed_tests + t_pass))
            failed_tests=$((failed_tests + t_fail))
            skipped_tests=$((skipped_tests + t_skip))
            total_suites=$((total_suites + s_tot))
            passed_suites=$((passed_suites + s_pass))
            failed_suites=$((failed_suites + s_fail))
        fi
    fi

    e2e_end=$(date +%s)
    e2e_duration=$((e2e_end - e2e_start))

    local status="failed"
    if [[ "$overall_e2e_exit" -eq 0 ]]; then
        status="passed"
    fi

    jq -n \
        --arg name "e2e" \
        --arg status "$status" \
        --argjson exit_code "$overall_e2e_exit" \
        --argjson duration "$e2e_duration" \
        --argjson tests_total "$total_tests" \
        --argjson tests_passed "$passed_tests" \
        --argjson tests_failed "$failed_tests" \
        --argjson tests_skipped "$skipped_tests" \
        --argjson suites_total "$total_suites" \
        --argjson suites_passed "$passed_suites" \
        --argjson suites_failed "$failed_suites" \
        '{
            name: $name,
            status: $status,
            exit_code: $exit_code,
            duration_seconds: $duration,
            tests_total: $tests_total,
            tests_passed: $tests_passed,
            tests_failed: $tests_failed,
            tests_skipped: $tests_skipped,
            suites_total: $suites_total,
            suites_passed: $suites_passed,
            suites_failed: $suites_failed
        }' > "$RAW_DIR/e2e.json"

    return "$overall_e2e_exit"
}

set_e2e_skipped() {
    local reason=$1
    jq -n \
        --arg name "e2e" \
        --arg status "skipped" \
        --arg reason "$reason" \
        '{
            name: $name,
            status: $status,
            exit_code: null,
            duration_seconds: 0,
            tests_total: 0,
            tests_passed: 0,
            tests_failed: 0,
            tests_skipped: 0,
            suites_total: 0,
            suites_passed: 0,
            suites_failed: 0,
            reason: $reason
        }' > "$RAW_DIR/e2e.json"
}

generate_report() {
    local overall_exit_code=$1
    local finished_at total_duration
    finished_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    total_duration=$(( $(date +%s) - START_TIME ))

    local overall_status="passed"
    if [[ "$overall_exit_code" -ne 0 ]]; then
        overall_status="failed"
    fi

    if [[ ! -f "$RAW_DIR/unit.json" ]]; then
        echo '{"name":"unit","status":"skipped","tests_total":0,"tests_passed":0,"tests_failed":0,"tests_skipped":0}' > "$RAW_DIR/unit.json"
    fi
    if [[ ! -f "$RAW_DIR/e2e.json" ]]; then
        echo '{"name":"e2e","status":"skipped","tests_total":0,"tests_passed":0,"tests_failed":0,"tests_skipped":0}' > "$RAW_DIR/e2e.json"
    fi
    if [[ ! -f "$RAW_DIR/coverage.json" ]]; then
        echo '{}' > "$RAW_DIR/coverage.json"
    fi

    local report_json
    report_json=$(jq -n \
        --arg name "$REPO_NAME" \
        --arg status "$overall_status" \
        --argjson exit_code "$overall_exit_code" \
        --arg started_at "$STARTED_AT" \
        --arg finished_at "$finished_at" \
        --argjson duration "$total_duration" \
        --slurpfile unit "$RAW_DIR/unit.json" \
        --slurpfile e2e "$RAW_DIR/e2e.json" \
        --slurpfile coverage "$RAW_DIR/coverage.json" \
        '
        ($unit[0] // {}) as $u |
        ($e2e[0] // {}) as $e |
        ($coverage[0] // {}) as $cov |
        {
            name: $name,
            status: $status,
            exit_code: $exit_code,
            started_at: $started_at,
            finished_at: $finished_at,
            duration_seconds: $duration,
            summary: {
                tests_total: (($u.tests_total // 0) + ($e.tests_total // 0)),
                tests_passed: (($u.tests_passed // 0) + ($e.tests_passed // 0)),
                tests_failed: (($u.tests_failed // 0) + ($e.tests_failed // 0)),
                tests_skipped: (($u.tests_skipped // 0) + ($e.tests_skipped // 0)),
                suites_total: (($u.suites_total // 0) + ($e.suites_total // 0)),
                suites_passed: (($u.suites_passed // 0) + ($e.suites_passed // 0)),
                suites_failed: (($u.suites_failed // 0) + ($e.suites_failed // 0)),
                coverage_pct: ($cov.lines.pct // null),
                coverage: (if ($cov | length) > 0 then $cov else null end)
            },
            suites: [ $u, $e ]
        }')

    echo "$report_json" | jq '.' > "$REPORT_DIR/${REPO_NAME}.json"
    cp "$REPORT_DIR/${REPO_NAME}.json" "$REPORT_DIR/${REPO_NAME}.report.json"

    local md_file="$REPORT_DIR/${REPO_NAME}.md"
    {
        echo "# Nightly Test Report: $REPO_NAME"
        echo
        echo "- **Status**: $([[ "$overall_status" == "passed" ]] && echo "PASS" || echo "FAIL")"
        echo "- **Started**: $STARTED_AT"
        echo "- **Finished**: $finished_at"
        echo "- **Duration**: ${total_duration}s"
        echo "- **Tests**: $(echo "$report_json" | jq -r '.summary.tests_passed') passed, $(echo "$report_json" | jq -r '.summary.tests_failed') failed, $(echo "$report_json" | jq -r '.summary.tests_total') total"
        if echo "$report_json" | jq -e '.summary.coverage_pct != null' >/dev/null 2>&1; then
            echo "- **Line Coverage**: $(echo "$report_json" | jq -r '.summary.coverage_pct')%"
        fi
        echo
        echo "### Test Suites"
        echo "| Suite | Status | Tests (P/F/Total) | Suites (P/F/Total) | Duration (s) |"
        echo "|---|---|---:|---:|---:|"
        echo "$report_json" | jq -r '.suites[] | "| \(.name) | \(.status) | \(.tests_passed // 0) / \(.tests_failed // 0) / \(.tests_total // 0) | \(.suites_passed // 0) / \(.suites_failed // 0) / \(.suites_total // 0) | \(.duration_seconds // 0)s |"'
        echo
        if echo "$report_json" | jq -e '.summary.coverage.lines != null' >/dev/null 2>&1; then
            echo "### Code Coverage"
            echo "| Metric | Coverage | Covered / Total |"
            echo "|---|---:|---:|"
            echo "$report_json" | jq -r '
                .summary.coverage |
                "| Lines | \(.lines.pct // 0)% | \(.lines.covered // 0) / \(.lines.total // 0) |\n" +
                "| Statements | \(.statements.pct // 0)% | \(.statements.covered // 0) / \(.statements.total // 0) |\n" +
                "| Functions | \(.functions.pct // 0)% | \(.functions.covered // 0) / \(.functions.total // 0) |\n" +
                "| Branches | \(.branches.pct // 0)% | \(.branches.covered // 0) / \(.branches.total // 0) |"
            '
            echo
        fi
    } > "$md_file"
    cp "$md_file" "$REPORT_DIR/${REPO_NAME}.report.md"

    if [[ "$REPORT_DIR" != "reports" ]] && [[ "$REPORT_DIR" != "$(pwd)/reports" ]]; then
        mkdir -p reports
        cp "$REPORT_DIR/${REPO_NAME}.json" "reports/nightly-report.json"
        cp "$REPORT_DIR/${REPO_NAME}.md" "reports/nightly-report.md"
    fi

    echo
    echo "=== [Nightly Report Summary] ==="
    cat "$md_file"
    echo "Report JSON written to: $REPORT_DIR/${REPO_NAME}.json"
    echo "Report Markdown written to: $REPORT_DIR/${REPO_NAME}.md"
}

main() {
    if ! require_bins; then
        exit 1
    fi

    setup

    local unit_exit=0
    local overall_exit=0

    run_unit_tests || unit_exit=$?

    if [[ "$unit_exit" -ne 0 ]]; then
        echo "Unit tests failed with exit code $unit_exit; skipping E2E tests" >&2
        overall_exit=$unit_exit
        set_e2e_skipped "skipped_due_to_unit_failure"
    else
        local e2e_exit=0
        run_e2e_tests || e2e_exit=$?
        if [[ "$e2e_exit" -ne 0 ]]; then
            overall_exit=$e2e_exit
        fi
    fi

    generate_report "$overall_exit"
    exit "$overall_exit"
}

main "$@"
