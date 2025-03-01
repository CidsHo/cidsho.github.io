@echo off
setlocal enabledelayedexpansion

:: 设置控制台代码页为 UTF-8
chcp 65001 >nul

:: 设置输入文件和输出文件路径
set "input_file=input.txt"
set "portfolio_output=portfolio.txt"
set "images_output=images.txt"
set "html_output=html.txt"

:: 清空输出文件
echo. > %portfolio_output%
echo. > %images_output%
echo. > %html_output%

:: 逐段读取输入文件内容
set /a segment_num=0
set /a line_num=0
for /f "tokens=*" %%a in (%input_file%) do (
    set "line=%%a"
    :: 如果遇到 "/end"，表示一段结束
    if "!line!"=="/end" (
        call :generate_json
        call :generate_html
        set /a segment_num+=1
        :: 重置变量
        set "title="
        set "image="
        set "data_src="
        set "link="
        set "tags="
        set "description_cn="
        set "description_en="
        set "date="
        set "src="
        set "location="
        set "location_en="
        set /a line_num=0
    ) else (
        :: 按行号映射到对应字段
        set /a line_num+=1
        if "!line!"=="/e" set "line="
        if !line_num!==1 set "title=!line!"
        if !line_num!==2 set "data_src=!line!"
        if !line_num!==3 set "link=!line!"
        if !line_num!==4 set "tags=!line!"
        if !line_num!==5 set "description_cn=!line!"
        if !line_num!==6 set "description_en=!line!"
        if !line_num!==7 set "date=!line!"
        if !line_num!==8 set "src=!line!"
        if !line_num!==9 set "location=!line!"
        if !line_num!==10 set "location_en=!line!"
    )
)

:: 处理最后一段（如果文件没有以 "/end" 结束）
if "!title!" neq "" call :generate_json
if "!title!" neq "" call :generate_html

echo 转换完成！请检查输出文件。
pause
exit /b

:generate_json
    :: 检查并处理空字段
    if "!title!"=="" set "title="
    if "!data_src!"=="" set "data_src="
    if "!link!"=="" set "link="
    if "!tags!"=="" set "tags="
    if "!description_cn!"=="" set "description_cn="
    if "!description_en!"=="" set "description_en="
    if "!date!"=="" set "date="
    if "!src!"=="" set "src="
    if "!location!"=="" set "location="
    if "!location_en!"=="" set "location_en="

    :: 生成portfolio.txt（直接以UTF-8编码输出）
    (
        echo {
        echo     "title": "!title!",
        echo     "image": "assets/placeholder.jpg",
        echo     "data-src": "!data_src!",
        echo     "link": "!link!",
        echo     "tags": ["!tags!"],
        echo     "description": "!description_cn!",
        echo     "date": "!date!"
        echo },
    ) >> %portfolio_output%

    :: 生成images.txt（直接以UTF-8编码输出）
    (
        echo {
        echo     "src": "!src!",
        echo     "captionLine1": "!title!",
        echo     "captionLine2": "!location!",
        echo     "captionLine3": "!location_en!",
        echo     "link": "!link!"
        echo },
    ) >> %images_output%

    :: 重置行号计数器
    set /a line_num=0
    exit /b

:generate_html
    :: 检查并处理空字段
    if "!title!"=="" set "title="
    if "!tags!"=="" set "tags="
    if "!description_cn!"=="" set "description_cn="
    if "!description_en!"=="" set "description_en="
    if "!date!"=="" set "date="
    if "!location!"=="" set "location="
    if "!location_en!"=="" set "location_en="

    :: 生成HTML格式的TXT文件
    (
        echo ^<div class="photo-info"^>
        echo     ^<h1 class="photo-title"^>!title!^</h1^>
        echo     ^<div class="photo-tags"^>
        echo         ^<span class="tag"^>!location!^</span^>
        echo         ^<span class="tag"^>!location_en!^</span^>
        echo         ^<span class="tag"^>!date!^</span^>
        echo     ^</div^>
        echo     ^<p class="photo-description"^>!description_cn!^</p^>
        echo     ^<p class="photo-description"^>!description_en!^</p^>
        echo     ^<div class="photo-tags"^>
        echo         ^<span class="tag"^>!tags!^</span^>
        echo     ^</div^>
        echo ^</div^>
    ) >> %html_output%
    exit /b