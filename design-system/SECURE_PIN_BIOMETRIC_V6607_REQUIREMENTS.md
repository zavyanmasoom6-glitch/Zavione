# ZAVI ONE / ADMIN — secure cloud + eight-digit local unlock
Status: implementation requirements, NOT an APK release.

1. Existing cloud authentication remains inside ZAVI ONE and is required for first-time account provisioning. Never treat entering an arbitrary email as an authenticated session.
2. Only after a valid Supabase session is established, offer setup of exactly eight ASCII digits. Confirm the PIN twice. Do not reuse the cloud password as the local PIN.
3. Derive an encryption/verifier key with a device-bound, salted KDF; store no plaintext PIN, reversible PIN, or session token in localStorage. Use Android Keystore for the PIN verifier/secret and encrypted storage for any offline session material. Android BiometricPrompt with BIOMETRIC_STRONG or DEVICE_CREDENTIAL must gate use of a Keystore key. Do not use a JS-only fingerprint imitation.
4. Offer fingerprint only if Android reports enrolled, supported biometrics. Fingerprint is optional and fallback is eight-digit PIN. Do not use fingerprint as a bypass of cloud authorization, owner checks, subscription or server RLS.
5. Keep an explicit recovery route via verified cloud reauthentication; rate-limit PIN attempts and require online reauthentication after repeated failures. Account recovery must never expose or reset another user's PIN.
6. For ZAVI ONE ADMIN, retain existing server-verified owner allowlist. The local PIN and biometrics unlock only an already authorized owner session.
7. On startup, display a compact PIN unlock if an eligible account has been provisioned; otherwise show the existing cloud login/registration inside the app. Remove duplicate legacy private-password and recovery panels only after verifying the new unlock flow, offline authorization, and migration of prior user data.
8. Full Dari Afghanistan UI; do not modify stored dates or calendar logic. Respect dark/light mode and accessibility.
9. Speech and typed commands stay independent; never start a microphone from typed execution, and never synthesize spoken replies.
10. Before release: instrumented tests for first login, existing accounts, account switch, sign-out, no internet, wrong PIN, biometric cancel/failure, biometric enrollment change, device transfer, owner ADMIN rejection, PIN recovery, dark/light, and regression of all financial operations.
11. Build distinct Android QA APKs, validate signatures and asset presence, test on real Android devices. Only after passing tests mark production-ready. Windows Setup is a separate next phase.
