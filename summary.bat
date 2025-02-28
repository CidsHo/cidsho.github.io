@echo off
setlocal enabledelayedexpansion

:: 设置输出文件
set "output_file=summary.txt"

:: 清空输出文件（如果已存在）
echo. > "%output_file%"

:: 设置输出文件编码为 UTF-8
chcp 65001 >nul

:: 遍历当前目录及其子目录中的所有文件
for /r %%f in (*.css *.js *.html) do (
    :: 获取文件名
    set "filename=%%~nxf"

    :: 在输出文件中添加文件名和分隔符
    echo. >> "%output_file%"
    echo 以下是文件: !filename! >> "%output_file%"
    echo. >> "%output_file%"

    :: 使用 PowerShell 读取文件内容并追加到输出文件中（确保 UTF-8 编码）
    powershell -Command "Get-Content -Path '%%f' -Encoding UTF8 | Out-File -FilePath '%output_file%' -Encoding UTF8 -Append"
)

:: 完成提示
echo 文件汇总已完成，结果保存在 %output_file% 中。
pause