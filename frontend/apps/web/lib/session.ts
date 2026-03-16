export type SessionData = {
  userId: string;
  email: string;
  role: string;
  locale: "fr" | "ar";
};

export const sessionOptions = {
  cookieName: "ferza_session",
  password: "insecure_placeholder_password_for_dev_only",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production"
  }
};
