-- Run after 20260724_add_study_environment_readings.sql.
-- The mode controls whether the desk lamp follows automatic light adjustment.
ALTER TABLE study_environment_readings
  ADD COLUMN desk_lamp_mode ENUM('auto', 'manual') NOT NULL DEFAULT 'auto'
  COMMENT 'Desk lamp operating mode: auto or manual'
  AFTER color_temperature_kelvin;
