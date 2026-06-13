import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: "Too many requests, try again later" },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: "Too many auth attempts" },
});

export const codeExecutionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: "Too many code executions" },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: "Too many AI requests — wait a minute and try again" },
});
