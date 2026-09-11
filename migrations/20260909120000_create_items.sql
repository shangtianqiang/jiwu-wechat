-- 物记：物品表（PostgreSQL）
-- 迁移版本：20260909120000
-- 通过 managePgDatabase(action="applyMigration") 应用

CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '其他',
  quantity INTEGER NOT NULL DEFAULT 1,
  location TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  preset TEXT NOT NULL DEFAULT '',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_items_user_recorded ON items (user_id, recorded_at DESC);

-- 回滚 SQL：
-- DROP TABLE IF EXISTS items;
