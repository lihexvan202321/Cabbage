# -*- coding: utf-8 -*-
"""
文本替换脚本 - 将所有卷心菜相关文本替换为模拟器相关文本
"""
import os
import re

# 定义所有替换规则
replacements = [
    # 核心词汇
    ('卷心菜', '模拟器'),
    ('Cabbage', 'Simulator'),
    ('cabbage', 'simulator'),

    # 量词
    ('颗', '个'),

    # 产品/物品
    ('罐头', '产品包'),

    # 技术/研究
    ('科技点', '研发点'),
    ('实验研究', '技术研究'),
    ('组织培养', '批量复制'),
    ('基因改良', '算法优化'),
    ('克隆技术', '复制技术'),
    ('垂直农业', '层级架构'),
    ('太空种植', '云端部署'),

    # 宗教/神秘
    ('神佑点', '信仰点'),
    ('献祭', '供奉'),
    ('神圣商店', '信仰商店'),
    ('神圣财富', '神圣资金'),
    ('神圣祝福', '神圣增益'),
    ('神圣卷心菜', '神圣模拟器'),

    # 品质
    ('优质卷心菜', '优质模拟器'),
    ('劣质卷心菜', '劣质模拟器'),

    # 地点/建筑
    ('种植基地', '生产基地'),

    # 活动/赛事
    ('创意料理大赛', '创意设计大赛'),
    ('奥林匹克卷心菜竞赛', '奥林匹克模拟器竞赛'),
    ('卷心菜文化节', '模拟器文化节'),
    ('卷心菜之王', '模拟器之王'),
    ('卷心菜大师', '模拟器大师'),

    # 特殊
    ('做干净的卷心菜', '做纯净的模拟器'),
]

def process_file(filepath):
    """处理单个文件，执行文本替换"""
    if not os.path.exists(filepath):
        print(f"文件不存在: {filepath}")
        return False

    try:
        # 尝试多种编码读取
        content = None
        used_encoding = None

        for encoding in ['utf-8', 'gbk', 'gb2312', 'cp936', 'latin-1']:
            try:
                with open(filepath, 'r', encoding=encoding) as f:
                    content = f.read()
                used_encoding = encoding
                print(f"  使用编码: {encoding}")
                break
            except (UnicodeDecodeError, UnicodeError):
                continue

        if content is None:
            print(f"  错误: 无法用任何编码读取文件")
            return False

        # 执行替换
        original_content = content
        replacement_count = 0

        for old_text, new_text in replacements:
            if old_text in content:
                count = content.count(old_text)
                content = content.replace(old_text, new_text)
                replacement_count += count
                if count > 0:
                    print(f"    '{old_text}' -> '{new_text}': {count}处")

        # 保存文件（使用UTF-8编码）
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  [OK] 完成: {replacement_count}处替换")
        return True

    except Exception as e:
        print(f"  [ERROR] 错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# 需要处理的文件列表
files_to_process = [
    'index.html',
    'test.html',
    'diagnose.html',
    'game.js',
    'README.md',
    'UPDATE_NOTES.md',
    'RESEARCH_UPGRADES_IMPLEMENTATION.md',
    'test-research-upgrades.html',
    'style.css',
    'cabbage-save-day79.json',
    'cabbage-save-day152.json'
]

print("=" * 60)
print("开始文本替换...")
print("=" * 60)

success_count = 0
for filepath in files_to_process:
    print(f"\n处理: {filepath}")
    if process_file(filepath):
        success_count += 1

print("\n" + "=" * 60)
print(f"完成! 成功处理 {success_count}/{len(files_to_process)} 个文件")
print("=" * 60)
