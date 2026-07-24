-- Run once in the existing light_trace MySQL database.
CREATE TABLE IF NOT EXISTS study_environment_readings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  posture_status TINYINT UNSIGNED NULL COMMENT '0=good, 1=head too close, 2=feet on desk, 3=head tilted, 4=chin in hand',
  seat_status TINYINT UNSIGNED NULL COMMENT '0=seated, 1=away',
  ambient_light_lux INT UNSIGNED NULL COMMENT 'Ambient light in lx',
  desk_lamp_brightness_percent TINYINT UNSIGNED NULL COMMENT 'Desk lamp brightness from 0 to 100 percent',
  color_temperature_kelvin SMALLINT UNSIGNED NULL COMMENT 'Color temperature in K',
  writing_distance_cm INT UNSIGNED NULL COMMENT 'Writing distance in cm',
  study_duration_minutes INT UNSIGNED NULL COMMENT 'Accumulated study duration in minutes',
  captured_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_environment_readings_user_captured (user_id, captured_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
