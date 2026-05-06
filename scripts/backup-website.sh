#!/bin/bash
# 米娅私人网页自动备份脚本
# 每天凌晨 3:00 执行，保留最近 3 天备份
# 备份内容为凌晨 2:00 推送到 GitHub 后的本地版本

set -e

WEBSITE_DIR="/Users/user/.kimi_openclaw/workspace/vibe-coding/米娅私人网页"
BACKUP_DIR="$WEBSITE_DIR/backups"
DATE=$(date +%Y-%m-%d)
TODAY_BACKUP="$BACKUP_DIR/$DATE"

# 创建当日备份目录
mkdir -p "$TODAY_BACKUP"

# 复制核心文件（排除 .git、backups、node_modules 等）
cp -r "$WEBSITE_DIR"/*.html "$TODAY_BACKUP/" 2>/dev/null || true
cp -r "$WEBSITE_DIR"/*.md "$TODAY_BACKUP/" 2>/dev/null || true
cp -r "$WEBSITE_DIR"/*.jpg "$TODAY_BACKUP/" 2>/dev/null || true
cp -r "$WEBSITE_DIR"/css "$TODAY_BACKUP/" 2>/dev/null || true
cp -r "$WEBSITE_DIR"/js "$TODAY_BACKUP/" 2>/dev/null || true
cp -r "$WEBSITE_DIR"/blog "$TODAY_BACKUP/" 2>/dev/null || true
cp -r "$WEBSITE_DIR"/data "$TODAY_BACKUP/" 2>/dev/null || true
cp -r "$WEBSITE_DIR"/scripts "$TODAY_BACKUP/" 2>/dev/null || true
cp -r "$WEBSITE_DIR"/memory "$TODAY_BACKUP/" 2>/dev/null || true
cp -r "$WEBSITE_DIR"/.gitignore "$TODAY_BACKUP/" 2>/dev/null || true

# 删除超过 3 天的旧备份
find "$BACKUP_DIR" -maxdepth 1 -type d -name '20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]' -mtime +3 -exec rm -rf {} + 2>/dev/null || true

# 记录日志
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Website backup completed: $DATE" >> "$BACKUP_DIR/backup.log"

# 清理 .DS_Store
find "$TODAY_BACKUP" -name '.DS_Store' -delete 2>/dev/null || true

echo "✅ Backup saved to backups/$DATE"
