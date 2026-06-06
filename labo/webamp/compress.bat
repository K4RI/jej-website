:: https://stackoverflow.com/questions/13805187/how-to-set-a-variable-inside-a-loop-for-f/13809834#13809834
:: https://stackoverflow.com/questions/10558316/example-of-delayed-expansion-in-batch-file/10558905#10558905
:: todo conserver la date pour ajouter les fichiers en cet ordre https://stackoverflow.com/questions/2111333/how-to-get-last-modified-date-on-windows-command-line-for-a-set-of-files/48519636#48519636

@echo off
setlocal ENABLEDELAYEDEXPANSION

copy NUL filelist.txt
:: pour écrire des utf-8 en fichier https://stackoverflow.com/questions/11962172/echo-utf-8-characters-in-windows-batch/31770411#31770411
chcp 65001
for /r %%i in (*.mp3) do (
    :: tokens=10 ou 9 selon l'ordi
    for /f "tokens=10 delims=\" %%a in ("%%i") do (
        :: file.mp3
        set filepath=%%a
        :: file
        set filename=!filepath:~0,-4!
        echo !filename!
        :: file_2.mp3
        ffmpeg -i "!filename!.mp3" -map 0:a:0 -b:a 96k "!filename!_2.mp3"
        del "!filename!.mp3"
        ren "!filename!_2.mp3" "!filename!.mp3"
        echo !filename!>> filelist.txt
    )
)
