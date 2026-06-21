#!/usr/bin/env bash
#
# End-to-end smoke test for the WhatsApp dashboard API + webhook.
# Works against seed data with no credentials; live sends need real creds.
#
# Usage:
#   API_BASE=http://localhost:4000 \
#   WHATSAPP_VERIFY_TOKEN=changeme \
#   ./scripts/test-whatsapp.sh
#
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:4000}"
VERIFY_TOKEN="${WHATSAPP_VERIFY_TOKEN:-changeme}"
CONV_ID="${CONV_ID:-2}"

pass() { printf '  \033[32m✓\033[0m %s\n' "$1"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$1"; exit 1; }
info() { printf '\n\033[1m%s\033[0m\n' "$1"; }

info "1. Health check"
HEALTH="$(curl -fsS "$API_BASE/api/health")" || fail "API not reachable at $API_BASE"
echo "  $HEALTH"
echo "$HEALTH" | grep -q '"ok":true' && pass "API is up" || fail "health not ok"

info "2. Webhook verification handshake (simulates Meta GET /webhook)"
CHALLENGE="hello-$RANDOM"
RESP="$(curl -fsS "$API_BASE/webhook?hub.mode=subscribe&hub.verify_token=$VERIFY_TOKEN&hub.challenge=$CHALLENGE")" \
  || fail "webhook GET failed"
[ "$RESP" = "$CHALLENGE" ] && pass "challenge echoed (token matches)" \
  || fail "expected '$CHALLENGE', got '$RESP' — check WHATSAPP_VERIFY_TOKEN"

info "3. Inbound message ingestion (simulates Meta POST /webhook)"
CODE="$(curl -fsS -o /dev/null -w '%{http_code}' -X POST "$API_BASE/webhook" \
  -H 'Content-Type: application/json' \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"id":"wamid.TEST'"$RANDOM"'","from":"923001234567","type":"text","text":{"body":"Test inbound"}}]}}]}]}')"
[ "$CODE" = "200" ] && pass "inbound webhook accepted (200)" || fail "expected 200, got $CODE"

info "4. List conversations"
curl -fsS "$API_BASE/api/conversations" | head -c 400; echo
pass "conversations endpoint responded"

info "5. Send a reply to conversation #$CONV_ID"
OUT="$(curl -sS -o /tmp/wa_send.json -w '%{http_code}' -X POST \
  "$API_BASE/api/conversations/$CONV_ID/messages" \
  -H 'Content-Type: application/json' \
  -d '{"text":"Automated test reply"}')"
cat /tmp/wa_send.json; echo
case "$OUT" in
  201) pass "reply sent (201)" ;;
  409) pass "blocked by 24h window (409) — expected if the window is closed" ;;
  *)   fail "unexpected status $OUT" ;;
esac

info "All checks completed."
