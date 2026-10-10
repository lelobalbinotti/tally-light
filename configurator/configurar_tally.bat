@echo off
title Configurador vTally Light
cd /d "%~dp0"
echo ========================================================
echo         Painel de Configuracao do vTally Light
echo ========================================================
echo.
echo Abrindo interface no navegador...
python configurator_server.py
pause
