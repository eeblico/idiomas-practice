@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Renderizando o video com as alteracoes de legenda_bilingue.ass...
ffmpeg -y -i "D:\DADOS USUÁRIO\Users\jonvargas\Downloads\Acoustic_Angst_Meets_Street_Art__Live_Performance_in_a_Painted_Room.mp4" -vf "ass=legenda_bilingue.ass" -c:v libx264 -preset veryfast -crf 18 -c:a copy "video_legendado.mp4"
copy /Y "video_legendado.mp4" "D:\DADOS USUÁRIO\Users\jonvargas\Downloads\Acoustic_Angst_Bilingue.mp4" >nul
echo.
echo Concluido! O arquivo "video_legendado.mp4" foi atualizado com sucesso.
pause
