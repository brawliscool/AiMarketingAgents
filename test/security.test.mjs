import test from "node:test";
import assert from "node:assert/strict";
import { securityInternals } from "../server.mjs";

function mockRequest({ headers = {}, remoteAddress = "127.0.0.1", method = "GET" } = {}) {
  return {
    headers,
    method,
    socket: { remoteAddress },
  };
}

test("clientIp ignores spoofed X-Forwarded-For by default", () => {
  const req = mockRequest({
    headers: { "x-forwarded-for": "203.0.113.10" },
    remoteAddress: "198.51.100.7",
  });

  assert.equal(securityInternals.clientIp(req), "198.51.100.7");
});

test("origin allow-list accepts trusted local origins only", () => {
  assert.equal(
    securityInternals.isAllowedRequestOrigin(mockRequest({ headers: { origin: "http://127.0.0.1:5173" } })),
    true,
  );
  assert.equal(
    securityInternals.isAllowedRequestOrigin(mockRequest({ headers: { origin: "https://evil.example" } })),
    false,
  );
});

test("JSON content type detection is explicit", () => {
  assert.equal(
    securityInternals.hasJsonContentType(mockRequest({ headers: { "content-type": "application/json; charset=utf-8" } })),
    true,
  );
  assert.equal(
    securityInternals.hasJsonContentType(mockRequest({ headers: { "content-type": "text/plain" } })),
    false,
  );
});

test("privileged APIs are available to localhost development only without admin key", () => {
  assert.equal(securityInternals.hasPrivilegedApiAccess(mockRequest({ remoteAddress: "127.0.0.1" })), true);
  assert.equal(securityInternals.hasPrivilegedApiAccess(mockRequest({ remoteAddress: "198.51.100.7" })), false);
});

test("token comparisons are value-based and timing-safe", () => {
  assert.equal(securityInternals.timingSafeTokenEqual("same-token", "same-token"), true);
  assert.equal(securityInternals.timingSafeTokenEqual("same-token", "different-token"), false);
});
