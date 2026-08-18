-- Seed default classic template for MVP editor preview
INSERT INTO templates (id, slug, name, category, version, config, is_active)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'classic',
  '经典',
  'general',
  1,
  '{
    "layout": "single-column",
    "sectionLabels": {
      "PROFILE": "基本信息",
      "SUMMARY": "个人简介",
      "EXPERIENCE": "工作经历",
      "PROJECT": "项目经历",
      "EDUCATION": "教育经历",
      "SKILL": "技能",
      "LANGUAGE": "语言能力",
      "CERTIFICATE": "证书",
      "LINKS": "链接",
      "CUSTOM": "自定义"
    }
  }'::jsonb,
  true
)
ON CONFLICT (slug) DO NOTHING;
