import {
  AuthSessionSchema,
  type AuthSession,
  type AuthenticatedAuthSession,
} from "contracts/auth/auth-session.schema";

type MockAccount = {
  password: string;
  session: AuthenticatedAuthSession;
  verificationCode: string;
  verificationExpiresAt: number;
};

type MockPasswordReset = {
  email: string;
  expiresAt: number;
};

const ACCOUNTS_STORAGE_KEY = "causolve_mock_accounts";
const SESSION_STORAGE_KEY = "causolve_mock_session";
const PASSWORD_RESETS_STORAGE_KEY = "causolve_mock_password_resets";
const accounts = new Map<string, MockAccount>();
const passwordResets = new Map<string, MockPasswordReset>();

const anonymousSession = () => AuthSessionSchema.parse({ authenticated: false, oauthError: null });

const getStorage = () => {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
};

const persistAccounts = () => {
  const storage = getStorage();

  if (!storage) return;

  storage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(Object.fromEntries(accounts.entries())));
};

const persistSession = (session: AuthSession) => {
  const storage = getStorage();

  if (!storage) return;

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const persistPasswordResets = () => {
  const storage = getStorage();

  if (!storage) return;

  storage.setItem(
    PASSWORD_RESETS_STORAGE_KEY,
    JSON.stringify(Object.fromEntries(passwordResets.entries())),
  );
};

const restoreAccounts = () => {
  const storage = getStorage();
  const serializedAccounts = storage?.getItem(ACCOUNTS_STORAGE_KEY);

  if (!serializedAccounts) return;

  try {
    const persistedAccounts = JSON.parse(serializedAccounts) as Record<
      string,
      { password: string; session: unknown }
    >;

    for (const [email, account] of Object.entries(persistedAccounts)) {
      if (typeof account.password !== "string") continue;

      const session = AuthSessionSchema.safeParse(account.session);

      if (session.success && session.data.authenticated) {
        accounts.set(email, {
          password: account.password,
          session: session.data,
          verificationCode: "123456",
          verificationExpiresAt: 0,
        });
      }
    }
  } catch {
    storage?.removeItem(ACCOUNTS_STORAGE_KEY);
  }
};

const restorePasswordResets = () => {
  const storage = getStorage();
  const serializedResets = storage?.getItem(PASSWORD_RESETS_STORAGE_KEY);

  if (!serializedResets) return;

  try {
    const persistedResets = JSON.parse(serializedResets) as Record<string, MockPasswordReset>;

    for (const [token, reset] of Object.entries(persistedResets)) {
      if (typeof reset.email === "string" && typeof reset.expiresAt === "number") {
        passwordResets.set(token, reset);
      }
    }
  } catch {
    storage?.removeItem(PASSWORD_RESETS_STORAGE_KEY);
  }
};

const restoreSession = (): AuthSession => {
  const storage = getStorage();
  const serializedSession = storage?.getItem(SESSION_STORAGE_KEY);

  if (!serializedSession) return anonymousSession();

  try {
    const session = AuthSessionSchema.safeParse(JSON.parse(serializedSession));

    return session.success ? session.data : anonymousSession();
  } catch {
    storage?.removeItem(SESSION_STORAGE_KEY);
    return anonymousSession();
  }
};

restoreAccounts();
restorePasswordResets();

export let authSession: AuthSession = restoreSession();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const createId = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return "00000000-0000-4000-8000-000000000000";
};

const createNumericCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const createResetToken = () => `${createId().replaceAll("-", "")}${createId().replaceAll("-", "")}`;

export const getAuthSession = () => authSession;

export const setAuthSession = (session: unknown) => {
  authSession = AuthSessionSchema.parse(session);
  persistSession(authSession);

  if (authSession.authenticated) {
    const account = accounts.get(normalizeEmail(authSession.user.email));

    if (account) {
      account.session = authSession;
      persistAccounts();
    }
  }
};

export const registerMockAccount = (input: {
  fullName: string;
  email: string;
  password: string;
}) => {
  const email = normalizeEmail(input.email);
  const session = AuthSessionSchema.parse({
    authenticated: true,
    user: {
      id: createId(),
      fullName: input.fullName,
      email,
      emailVerified: false,
    },
    activeWorkspace: null,
    membership: null,
    onboarding: {
      status: "IN_PROGRESS",
      nextStep: "VERIFY_EMAIL",
      emailVerified: false,
      workspaceCreated: false,
      profileCompleted: false,
      completedAt: null,
    },
  });

  if (!session.authenticated) {
    throw new Error("Unable to create an authenticated mock account.");
  }

  accounts.set(email, {
    password: input.password,
    session,
    verificationCode: createNumericCode(),
    verificationExpiresAt: Date.now() + 10 * 60_000,
  });
  authSession = session;
  persistAccounts();
  persistSession(authSession);

  return session;
};

export const authenticateMockAccount = (email: string, password: string) => {
  const account = accounts.get(normalizeEmail(email));

  if (!account || account.password !== password) {
    return null;
  }

  authSession = account.session;
  persistSession(authSession);
  return account.session;
};

export const hasMockAccount = (email: string) => accounts.has(normalizeEmail(email));

export const issueVerificationCode = (email: string) => {
  const account = accounts.get(normalizeEmail(email));

  if (!account) return null;

  account.verificationCode = createNumericCode();
  account.verificationExpiresAt = Date.now() + 10 * 60_000;
  persistAccounts();

  return account.verificationCode;
};

export const getMockVerificationCode = (email: string) =>
  accounts.get(normalizeEmail(email))?.verificationCode ?? null;

export const verifyMockEmailCode = (email: string, code: string) => {
  const account = accounts.get(normalizeEmail(email));

  if (!account || Date.now() >= account.verificationExpiresAt) return false;

  return account.verificationCode === code;
};

export const issuePasswordResetToken = (email: string) => {
  const normalizedEmail = normalizeEmail(email);

  if (!accounts.has(normalizedEmail)) return null;

  const token = createResetToken();
  passwordResets.set(token, {
    email: normalizedEmail,
    expiresAt: Date.now() + 15 * 60_000,
  });
  persistPasswordResets();

  return token;
};

export const getMockPasswordResetToken = (email: string) => {
  const normalizedEmail = normalizeEmail(email);

  return (
    [...passwordResets.entries()].find(([, reset]) => reset.email === normalizedEmail)?.[0] ?? null
  );
};

export const validatePasswordResetToken = (token: string) => {
  const reset = passwordResets.get(token);

  if (!reset) return "INVALID" as const;

  if (Date.now() >= reset.expiresAt) {
    passwordResets.delete(token);
    persistPasswordResets();
    return "EXPIRED" as const;
  }

  return "VALID" as const;
};

export const resetMockPassword = (token: string, password: string) => {
  const reset = passwordResets.get(token);
  const account = reset ? accounts.get(reset.email) : undefined;

  if (!reset || !account || Date.now() >= reset.expiresAt) return false;

  account.password = password;
  passwordResets.delete(token);
  persistAccounts();
  persistPasswordResets();

  return true;
};

export const updateMockPassword = (email: string, currentPassword: string, newPassword: string) => {
  const account = accounts.get(normalizeEmail(email));

  if (!account || account.password !== currentPassword) return false;

  account.password = newPassword;
  persistAccounts();

  return true;
};

export const clearMockSession = () => {
  authSession = anonymousSession();
  getStorage()?.removeItem(SESSION_STORAGE_KEY);
};

export const resetMockAuthState = () => {
  accounts.clear();
  passwordResets.clear();
  clearMockSession();
  getStorage()?.removeItem(ACCOUNTS_STORAGE_KEY);
  getStorage()?.removeItem(PASSWORD_RESETS_STORAGE_KEY);
};
