-- Migration: Add settings_json column to gyms table
-- Enables runtime branding and feature toggles per gym

ALTER TABLE gyms
  ADD COLUMN IF NOT EXISTS settings_json JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add a comment explaining the schema
COMMENT ON COLUMN gyms.settings_json IS
  'Runtime gym settings: logo_url, primary_color, cover_image_url, tagline, social_links, features_enabled, kiosk_message';

-- Example of what a populated settings_json looks like:
-- {
--   "logo_url": "https://example.com/logo.png",
--   "primary_color": "#D4956A",
--   "cover_image_url": "https://example.com/hero.jpg",
--   "tagline": "Your Fitness Journey Starts Here",
--   "social_links": {
--     "facebook": "https://facebook.com/mygym",
--     "instagram": "https://instagram.com/mygym"
--   },
--   "features_enabled": {
--     "qr_checkin": true,
--     "payment_tracking": true,
--     "class_scheduling": false,
--     "trainer_management": false,
--     "challenges": true,
--     "leaderboard": true
--   },
--   "kiosk_message": "Welcome! Scan your QR code to check in."
-- }
