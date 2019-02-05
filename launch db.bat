@echo off
title Kerr DB
:start
"C:\Program Files\MongoDB\Server\4.0\bin\mongod.exe" --dbpath=./db
pause
cls
echo DB is restarting...
echo.
goto start