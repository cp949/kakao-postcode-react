#!/usr/bin/env bash
# 빌드 산출물, 캐시, 테스트 결과를 삭제한다.
# 사용법: ./clean.sh [--dry-run]
#   --dry-run  삭제하지 않고 대상만 출력한다.

set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$SCRIPT_DIR"
readonly REPO_ROOT="$SCRIPT_DIR"

# 스크립트를 다른 위치로 옮겨 실행하면 엉뚱한 디렉터리를 지울 수 있다.
# 저장소 루트가 아니면 중단한다. git worktree는 .git이 파일이므로 -e로 검사한다.
if [[ ! -f "$REPO_ROOT/pnpm-workspace.yaml" || ! -e "$REPO_ROOT/.git" ]]; then
  printf '저장소 루트가 아니어서 중단: %s\n' "$REPO_ROOT" >&2
  exit 1
fi

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
elif [[ $# -gt 0 ]]; then
  printf 'usage: %s [--dry-run]\n' "$(basename "$0")" >&2
  exit 2
fi

# 디렉터리는 이름만으로 매칭하므로 어느 깊이에서든 삭제된다.
# 소스 디렉터리를 out, build, dist 이름으로 추적하지 않는다는 전제다.
# 일치한 디렉터리는 -prune으로 내부를 순회하지 않는다.
readonly DIR_EXPR=(
  -type d
  \(
    -name node_modules
    -o -name .turbo
    -o -name .next
    -o -name out
    -o -name build
    -o -name dist
    -o -name coverage
    -o -name test-results
    -o -name playwright-report
    -o -name blob-report
    -o -path '*/playwright/.cache'
  \)
  -prune
  -print0
)

removed_dirs=0
removed_files=0

# 삭제하거나, dry-run이면 출력만 한다.
remove_path() {
  local path="$1"
  local relative_path="${path#"$REPO_ROOT/"}"

  if [[ "$DRY_RUN" == true ]]; then
    printf '[dry-run] %s\n' "$relative_path"
  else
    rm -rf -- "$path"
    printf 'removed %s\n' "$relative_path"
  fi
}

while IFS= read -r -d '' path; do
  remove_path "$path"
  ((removed_dirs += 1))
done < <(find "$REPO_ROOT" -path "$REPO_ROOT/.git" -prune -o "${DIR_EXPR[@]}")

# tsc -b가 만드는 증분 빌드 캐시. node_modules 안은 순회하지 않는다.
while IFS= read -r -d '' path; do
  remove_path "$path"
  ((removed_files += 1))
done < <(
  find "$REPO_ROOT" \
    \( -path "$REPO_ROOT/.git" -o -name node_modules \) -prune -o \
    -type f -name '*.tsbuildinfo' -print0
)

if [[ "$DRY_RUN" == true ]]; then
  printf '삭제 예정: 디렉터리 %d개, 파일 %d개\n' "$removed_dirs" "$removed_files"
else
  printf '삭제 완료: 디렉터리 %d개, 파일 %d개\n' "$removed_dirs" "$removed_files"
fi
