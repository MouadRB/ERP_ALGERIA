const express = require("express");
const authMock = require("../mocks/auth.mock");

const router = express.Router();

router.get("/roles", (_req, res) => {
  res.json({ data: authMock.roles });
});

router.get("/debug", (_req, res) => {
  const normalizeDigits = (value) =>
    typeof value === "string" ? value.replace(/\D+/g, "") : "";

  res.json({
    data: {
      roles: authMock.roles,
      accounts: authMock.accounts.map((account) => ({
        id: account.id,
        name: account.name,
        roleId: account.roleId,
        phone: account.phone,
        phoneDigits: normalizeDigits(account.phone)
      }))
    }
  });
});

router.post("/login", (req, res) => {
  const { role, phone, password, mfaCode } = req.body || {};

  const normalizeDigits = (value) =>
    typeof value === "string" ? value.replace(/\D+/g, "") : "";
  const normalizedPhone = normalizeDigits(phone);
  const normalizedMfa = normalizeDigits(mfaCode);
  const normalizedPassword = typeof password === "string" ? password.trim() : "";
  const lastDigits = (value, count = 9) =>
    typeof value === "string" ? value.slice(-count) : "";

  const phoneMatches = (accountPhone, inputPhone) => {
    if (!accountPhone || !inputPhone) return false;
    if (lastDigits(accountPhone) && lastDigits(inputPhone)) {
      if (lastDigits(accountPhone) === lastDigits(inputPhone)) return true;
    }
    return (
      accountPhone === inputPhone ||
      accountPhone.endsWith(inputPhone) ||
      inputPhone.endsWith(accountPhone)
    );
  };

  let account = authMock.accounts.find((item) => {
    const accountPhone = normalizeDigits(item.phone);
    return item.roleId === role && phoneMatches(accountPhone, normalizedPhone);
  });

  if (!account) {
    account = authMock.accounts.find((item) => {
      const accountPhone = normalizeDigits(item.phone);
      return phoneMatches(accountPhone, normalizedPhone);
    });
  }

  const roleEntry =
    authMock.roles.find((item) => item.id === role) ||
    authMock.roles.find((item) => item.id === account?.roleId);

  if (!roleEntry || !account || account.password !== normalizedPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  if (roleEntry.mfaRequired && account.mfaCode !== normalizedMfa) {
    return res.status(401).json({ error: "MFA code required" });
  }

  return res.json({
    data: {
      user: {
        id: account.id,
        name: account.name,
        role: roleEntry.id,
        label: roleEntry.label,
        phone: account.phone,
        mfaRequired: roleEntry.mfaRequired
      },
      token: `mock-token-${account.id}`
    }
  });
});

module.exports = router;
