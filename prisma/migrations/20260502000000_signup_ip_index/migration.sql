-- Speed up "is this IP creating too many accounts" lookups during signup
-- and IP-based usage merging. As the User table grows, this avoids a
-- sequential scan on every auth flow.
CREATE INDEX IF NOT EXISTS "User_signupIpHash_idx" ON "User"("signupIpHash");
