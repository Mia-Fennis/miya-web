#!/usr/bin/env python3
import base64
import json
import urllib.request
import os

TOKEN = os.environ.get("GITHUB_TOKEN", "")
if not TOKEN:
    raise ValueError("请设置环境变量 GITHUB_TOKEN")
OWNER = "Mia-Fennis"
REPO = "miya-web"
BASE_DIR = "/Users/user/.kimi_openclaw/workspace/vibe-coding/米娅私人网页"

files_to_upload = [
    "blog/encrypted/tech/wsss-survey.data",
    "blog/encrypted/diary/hello-world.data",
    "blog/encrypted/diary/second-day.data",
]

def get_sha(path):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"token {TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "MiaUploader/1.0"
    })
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            return data.get("sha")
    except Exception:
        return None

def upload_file(local_path, repo_path):
    full_local = os.path.join(BASE_DIR, local_path)
    with open(full_local, "rb") as f:
        content = base64.b64encode(f.read()).decode()

    sha = get_sha(repo_path)
    payload = {
        "message": "fix: re-encrypt with current password mia-1R2931",
        "content": content,
        "branch": "main"
    }
    if sha:
        payload["sha"] = sha

    data = json.dumps(payload).encode()
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{repo_path}"
    req = urllib.request.Request(url, data=data, headers={
        "Authorization": f"token {TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "MiaUploader/1.0",
        "Content-Length": str(len(data))
    }, method="PUT")

    try:
        with urllib.request.urlopen(req) as resp:
            print(f"✅ {repo_path} ({resp.status})")
    except urllib.error.HTTPError as e:
        print(f"❌ {repo_path}: {e.code} {e.read().decode()[:200]}")

for f in files_to_upload:
    upload_file(f, f)

print("\n🌐 https://mia-fennis.github.io/miya-web/")
print("🔑 当前密码: mia-1R2931")
