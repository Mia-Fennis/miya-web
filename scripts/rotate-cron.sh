#!/bin/zsh
# 米娅博客密码轮换 - 每日凌晨 2 点执行

# 设置必要的环境变量
export PATH="/opt/homebrew/bin:/Users/user/.local/bin:/usr/bin:/bin:/Users/user/.kimi_openclaw/bin:$PATH"

PROJECT_DIR="/Users/user/.kimi_openclaw/workspace/vibe-coding/米娅私人网页"
LOG_FILE="/tmp/password-rotate-$(date +%Y%m%d).log"
NODE_BIN="$(which node 2>/dev/null || echo '/private/var/folders/6q/172x8l9d63n1l18h3jlxr8j80000gn/T/AppTranslocation/19A9937D-D83B-422F-9E3C-44D9BA4ADB91/d/Kimi.app/Contents/Resources/resources/runtime/node')"

{
    echo "========================================"
    echo "米娅博客密码轮换"
    echo "执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Node路径: $NODE_BIN"
    echo "========================================"
    cd "$PROJECT_DIR" || exit 1
    $NODE_BIN scripts/rotate-password.js
    echo "========================================"
    echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "========================================"
} >> "$LOG_FILE" 2>&1
