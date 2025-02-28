@echo off
setlocal enabledelayedexpansion

REM 清空现有的 JSON 文件
echo [] > data\portfolio.json
echo [] > data\images.json

REM 初始化变量
set "portfolio_entries="
set "images_entries="

REM 读取 entries.txt 文件
set "entry="
for /f "tokens=*" %%l in (data\entries.txt) do (
    REM 如果当前行不为空，则添加到当前条目
    if not "%%l"=="" (
        set "entry=!entry!%%l\n"
    ) else (
        REM 处理当前条目
        if not "!entry!"=="" (
            REM 提取字段
            for /f "tokens=1,2,3,4,5,6 delims=\n" %%a in ("!entry!") do (
                set "title=%%a"
                set "description=%%b"
                set "date=%%c"
                set "tags=%%d"
                set "image=%%e"
                set "link=%%f"
            )

            REM 生成 portfolio.json 条目
            set "portfolio_entry={""title"": ""!title!"", ""description"": ""!description!"", ""date"": ""!date!"", ""tags"": [""!tags: ,="",""!""], ""image"": ""!image!"", ""link"": ""!link!""}"

            REM 将条目添加到 portfolio_entries
            if defined portfolio_entries (
                set "portfolio_entries=!portfolio_entries!,!portfolio_entry!"
            ) else (
                set "portfolio_entries=!portfolio_entry!"
            )

            REM 生成 images.json 条目
            set "images_entry={""src"": ""!image!"", ""captionLine1"": ""!title!"", ""captionLine2"": ""!description!"", ""captionLine3"": ""!date!"", ""link"": ""!link!""}"

            REM 将条目添加到 images_entries
            if defined images_entries (
                set "images_entries=!images_entries!,!images_entry!"
            ) else (
                set "images_entries=!images_entry!"
            )

            REM 清空当前条目
            set "entry="
        )
    )
)

REM 处理最后一个条目（如果文件末尾没有空行）
if not "!entry!"=="" (
    REM 提取字段
    for /f "tokens=1,2,3,4,5,6 delims=\n" %%a in ("!entry!") do (
        set "title=%%a"
        set "description=%%b"
        set "date=%%c"
        set "tags=%%d"
        set "image=%%e"
        set "link=%%f"
    )

    REM 生成 portfolio.json 条目
    set "portfolio_entry={""title"": ""!title!"", ""description"": ""!description!"", ""date"": ""!date!"", ""tags"": [""!tags: ,="",""!""], ""image"": ""!image!"", ""link"": ""!link!""}"

    REM 将条目添加到 portfolio_entries
    if defined portfolio_entries (
        set "portfolio_entries=!portfolio_entries!,!portfolio_entry!"
    ) else (
        set "portfolio_entries=!portfolio_entry!"
    )

    REM 生成 images.json 条目
    set "images_entry={""src"": ""!image!"", ""captionLine1"": ""!title!"", ""captionLine2"": ""!description!"", ""captionLine3"": ""!date!"", ""link"": ""!link!""}"

    REM 将条目添加到 images_entries
    if defined images_entries (
        set "images_entries=!images_entries!,!images_entry!"
    ) else (
        set "images_entries=!images_entry!"
    )
)

REM 将条目写入 JSON 文件
echo [!portfolio_entries!] > data\portfolio.json
echo [!images_entries!] > data\images.json

echo JSON 文件生成完成！
pause