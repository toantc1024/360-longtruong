#!/usr/bin/env python3
import os
import glob
import unicodedata
import re
import subprocess

def remove_vietnamese_accents(text):
    text = text.replace('đ', 'd').replace('Đ', 'D')
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    return unicodedata.normalize('NFC', text)

def format_filename(folder, filename):
    name, ext = os.path.splitext(filename)
    clean_name = remove_vietnamese_accents(name)
    # replace non-alphanumeric with single underscore
    clean_name = re.sub(r'[^a-zA-Z0-9]+', '_', clean_name).strip('_')
    prefix = folder.upper()
    new_name = f"{prefix}_{clean_name.upper()}{ext}"
    return new_name

def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    jpg_dir = os.path.join(repo_root, 'jpg')

    files = glob.glob(os.path.join(jpg_dir, '*', '*'))
    renamed_count = 0

    for filepath in sorted(files):
        filename = os.path.basename(filepath)
        if filename == '.DS_Store' or os.path.isdir(filepath):
            continue

        folder = os.path.basename(os.path.dirname(filepath))
        new_filename = format_filename(folder, filename)
        new_filepath = os.path.join(os.path.dirname(filepath), new_filename)

        if filepath != new_filepath:
            print(f"Renaming: {os.path.relative_to(filepath, repo_root) if hasattr(os.path, 'relative_to') else filepath}")
            print(f"      -> {new_filename}")
            try:
                # Try git mv first to preserve git history
                subprocess.run(['git', 'mv', filepath, new_filepath], check=True, cwd=repo_root)
            except Exception:
                os.rename(filepath, new_filepath)
            renamed_count += 1

    print(f"\nDone! Successfully renamed {renamed_count} files.")

if __name__ == '__main__':
    main()
