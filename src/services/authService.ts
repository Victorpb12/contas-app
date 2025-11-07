type AuthResult = { ok: true; user?: any } | { ok: false; error?: string };

export const authService = {
  signIn: async (
    email: string,
    password: string,
    remember = false
  ): Promise<AuthResult> => {
    await new Promise((r) => setTimeout(r, 700));

    if (!email || !email.includes("@"))
      return { ok: false, error: "Email inválido" };
    if (password !== "1234")
      return { ok: false, error: "Senha inválida (use 1234 no stub)" };

    return { ok: true, user: { id: "local-1", email } };
  },
  signUp: async (email: string, password: string, meta?: any) => {
    await new Promise((r) => setTimeout(r, 800));
    if (!email.includes("@")) return { ok: false, error: "Email inválido" };
    return { ok: true, user: { id: "local-signup-1", email, ...meta } };
  },
  resetPassword: async (email: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (!email.includes("@")) return { ok: false, error: "Email inválido" };
    return { ok: true };
  },
};
