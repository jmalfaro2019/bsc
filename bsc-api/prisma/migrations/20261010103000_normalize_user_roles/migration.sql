-- Normalize legacy role values
UPDATE "users" SET "role" = 'lector' WHERE "role" = 'user';
