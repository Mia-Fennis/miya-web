#!/usr/bin/env python3
"""扫描 06-米娅心网，生成 knowledge.json 供网页渲染树形目录+摘要"""

import os, json, re

VAULT = os.path.expanduser("~/Documents/知识库/广莫野人/06-米娅心网")
OUTPUT = os.path.expanduser("~/miya-web/data/knowledge.json")

def extract_excerpt(filepath, max_chars=200):
    """读取 md 文件，提取首段纯文本作为摘要"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return ""
    
    # 去掉 YAML frontmatter
    content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)
    
    # 去掉 markdown 链接、图片、格式
    text = re.sub(r'!\[.*?\]\(.*?\)', '', content)
    text = re.sub(r'\[([^\]]+)\]\(.*?\)', r'\1', text)
    text = re.sub(r'[#*_~`>|]', '', text)
    text = re.sub(r'\n+', ' ', text).strip()
    
    if not text:
        return ""
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit('。', 1)[0] + '。'

def scan_directory(dirpath, relative_to):
    """递归扫描目录，返回树结构"""
    items = []
    rel = os.path.relpath(dirpath, relative_to)
    
    entries = sorted(os.listdir(dirpath))
    
    for entry in entries:
        full_path = os.path.join(dirpath, entry)
        if entry.startswith('.'):
            continue
        if entry == '99-归档':
            continue  # 归档目录不展示
        
        if os.path.isdir(full_path):
            children = scan_directory(full_path, relative_to)
            child_count = sum(1 for c in _count_files(children))
            if child_count > 0 or not entry.startswith('99-'):  # 空目录也展示，但排除归档
                items.append({
                    "type": "dir",
                    "name": entry,
                    "children": children,
                    "fileCount": child_count
                })
        elif entry.endswith('.md') and not entry.startswith('.'):
            excerpt = extract_excerpt(full_path)
            title = entry.replace('.md', '')
            # 如果文件名以日期开头，美化显示
            items.append({
                "type": "file",
                "name": entry,
                "title": title,
                "excerpt": excerpt
            })
    
    return items

def _count_files(items):
    for item in items:
        if item['type'] == 'file':
            yield item
        elif item['type'] == 'dir':
            yield from _count_files(item.get('children', []))

# 扫描
tree = scan_directory(VAULT, VAULT)

# 添加根目录信息
root_name = os.path.basename(VAULT)  # 06-米娅心网

output = {
    "root": root_name,
    "description": "米娅的知识库 · 前世记忆与阅读轨迹",
    "updatedAt": "2026-05-29",
    "tree": tree,
    "stats": {
        "totalDirs": 0,
        "totalFiles": 0
    }
}

# 统计
def count_stats(items):
    dirs = 0
    files = 0
    for item in items:
        if item['type'] == 'dir':
            dirs += 1
            d, f = count_stats(item.get('children', []))
            dirs += d
            files += f
        elif item['type'] == 'file':
            files += 1
    return dirs, files

output['stats']['totalDirs'], output['stats']['totalFiles'] = count_stats(tree)

# 写入
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"✅ knowledge.json 已生成")
print(f"   扫描目录: {VAULT}")
print(f"   输出路径: {OUTPUT}")
print(f"   目录数: {output['stats']['totalDirs']}")
print(f"   文件数: {output['stats']['totalFiles']}")
