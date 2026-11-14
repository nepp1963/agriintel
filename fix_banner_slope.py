import os

search_dirs = ["/home", "/app", "."]
for d in search_dirs:
    if os.path.exists(d):
        for root, dirs, files in os.walk(d):
            if "node_modules" in root or ".git" in root:
                continue
            for file in files:
                if file.endswith((".tsx", ".jsx", ".ts", ".js")):
                    path = os.path.join(root, file)
                    try:
                        with open(path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()

                        if "Extracted Slope" in content or "slopePercent" in content:
                            print(f"Found target in: {path}")
                            new_content = content.replace("0.0%", "{slopePercent}%").replace("Extracted Slope: 0.0%", "Extracted Slope: {slopePercent}%")
                            if new_content != content:
                                with open(path, "w", encoding="utf-8", newline="\n") as f:
                                    f.write(new_content)
                                print(f"Successfully patched banner in: {path}")
                    except Exception as e:
                        pass

print("UI Banner slope sync complete!")
