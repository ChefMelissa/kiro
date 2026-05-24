@echo off
echo ====================================
echo TuniStay Scraper - Configuration
echo ====================================
echo.

REM Installer les dépendances
echo Installation des dépendances...
pip install playwright mysql-connector-python
playwright install chromium

echo.
echo ====================================
echo Configuration du Task Scheduler
echo ====================================
echo.

REM Créer une tâche planifiée (toutes les 2 heures)
schtasks /create /tn "TuniStay-Scraper" /tr "python C:\TuniStay-Scraper\vps_scraper.py --all --headless" /sc hourly /mo 2 /st 06:00 /f

echo.
echo ✅ Tâche planifiée créée!
echo    Le scraper s'exécutera toutes les 2 heures à partir de 06:00
echo.
echo Pour exécuter manuellement:
echo    python C:\TuniStay-Scraper\vps_scraper.py --all
echo.
echo Pour voir les logs:
echo    Vérifiez le Task Scheduler Windows
echo.
pause
