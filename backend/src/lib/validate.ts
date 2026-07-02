/* Minimal request validation helpers — no schema library needed at this size. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function validEmail(email: unknown): email is string {
  return typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email);
}

export function validUsername(username: unknown): username is string {
  return typeof username === "string" && USERNAME_RE.test(username);
}

export function validPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 6 && password.length <= 128;
}

export function validBio(bio: unknown): bio is string {
  return typeof bio === "string" && bio.length <= 300;
}

/*
 * Base64 raster data-URL avatars only, capped at ~2 MB of encoded text.
 * SVG is deliberately excluded — an `image/svg+xml` data URL can embed
 * <script>/onload handlers and become a stored-XSS payload if ever rendered
 * outside an <img> context.
 */
const AVATAR_DATA_URL_RE = /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/]+=*$/i;
export function validAvatar(avatar: unknown): avatar is string {
  return (
    typeof avatar === "string" && avatar.length <= 2_800_000 && AVATAR_DATA_URL_RE.test(avatar)
  );
}
