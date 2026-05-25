"""
TunisiaBeds Scraper - استخراج أسعار الفنادق من tunisiabeds.tn
يستخدم Playwright للتعامل مع الصفحات الديناميكية

الاستخدام:
    python tunisiabeds_scraper.py --city "Sousse" --checkin "2025-06-04" --checkout "2025-06-10" --adults 2 --children 0

متطلبات:
    pip install playwright beautifulsoup4
    playwright install chromium
"""

import asyncio
import json
import sys
import argparse
from datetime import datetime

try:
    from playwright.async_api import async_playwright
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "playwright", "beautifulsoup4"])
    subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"])
    from playwright.async_api import async_playwright
    from bs4 import BeautifulSoup


# Configuration
TUNISIABEDS_URL = "https://www.tunisiabeds.tn"
# Credentials - à configurer via variables d'environnement
USERNAME = ""  # Mettre votre username ici ou via env var
PASSWORD = ""  # Mettre votre password ici ou via env var

# Cities mapping (French names as used on the site)
CITIES = {
    "Sousse": "Sousse",
    "Hammamet": "Hammamet", 
    "Djerba": "Djerba",
    "Monastir": "Monastir"
}


async def login(page, username, password):
    """Se connecter au compte TunisiaBeds si nécessaire"""
    if not username or not password:
        print("⚠️  Pas de credentials fournis - utilisation en mode public")
        return False
    
    try:
        await page.goto(f"{TUNISIABEDS_URL}/login", wait_until="networkidle")
        await page.fill('input[name="email"], input[name="username"], input[type="email"]', username)
        await page.fill('input[name="password"], input[type="password"]', password)
        await page.click('button[type="submit"], input[type="submit"]')
        await page.wait_for_load_state("networkidle")
        print("✅ Connexion réussie")
        return True
    except Exception as e:
        print(f"⚠️  Erreur de connexion: {e}")
        return False


async def search_hotels(page, city, check_in, check_out, adults=2, children=0):
    """Rechercher des hôtels sur TunisiaBeds"""
    
    print(f"🔍 Recherche: {city} | {check_in} → {check_out} | {adults} adultes, {children} enfants")
    
    # Navigate to search page
    await page.goto(TUNISIABEDS_URL, wait_until="networkidle")
    
    # Fill search form
    try:
        # City field
        city_input = page.locator('input[placeholder*="ville"], input[placeholder*="destination"], #city, .city-input')
        if await city_input.count() > 0:
            await city_input.first.fill(city)
            await page.wait_for_timeout(500)
            # Select from autocomplete if it appears
            suggestion = page.locator(f'text="{city}"').first
            if await suggestion.is_visible():
                await suggestion.click()
        
        # Date fields
        checkin_input = page.locator('input[name*="checkin"], input[name*="arrival"], input[name*="date_debut"]')
        if await checkin_input.count() > 0:
            await checkin_input.first.fill(check_in)
        
        checkout_input = page.locator('input[name*="checkout"], input[name*="departure"], input[name*="date_fin"]')
        if await checkout_input.count() > 0:
            await checkout_input.first.fill(check_out)
        
        # Submit search
        search_btn = page.locator('button:has-text("Recherche"), button:has-text("Chercher"), .btn-search, input[type="submit"]')
        if await search_btn.count() > 0:
            await search_btn.first.click()
        
        # Wait for results
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(3000)
        
    except Exception as e:
        print(f"⚠️  Erreur lors de la recherche: {e}")
        # Try direct URL approach
        search_url = f"{TUNISIABEDS_URL}/hotels?ville={city}&date_debut={check_in}&date_fin={check_out}&adultes={adults}&enfants={children}"
        await page.goto(search_url, wait_until="networkidle")
        await page.wait_for_timeout(3000)
    
    return await extract_hotels(page)


async def extract_hotels(page):
    """Extraire les données des hôtels depuis la page de résultats"""
    
    hotels = []
    
    # Get page content
    content = await page.content()
    soup = BeautifulSoup(content, 'html.parser')
    
    # Try to find hotel cards - adapt selectors based on site structure
    hotel_cards = soup.select('.hotel-card, .hotel-item, .hotel-result, [class*="hotel"], .card')
    
    if not hotel_cards:
        # Try alternative approach - look for common patterns
        hotel_cards = soup.find_all('div', class_=lambda x: x and ('hotel' in x.lower() or 'result' in x.lower()))
    
    print(f"📋 {len(hotel_cards)} hôtels trouvés")
    
    for card in hotel_cards:
        try:
            hotel = extract_hotel_data(card)
            if hotel and hotel.get('name'):
                hotels.append(hotel)
        except Exception as e:
            print(f"  ⚠️  Erreur extraction: {e}")
            continue
    
    # If no hotels found with BeautifulSoup, try Playwright selectors
    if not hotels:
        hotels = await extract_hotels_playwright(page)
    
    return hotels


def extract_hotel_data(card):
    """Extraire les données d'un hôtel depuis un élément HTML"""
    
    hotel = {}
    
    # Hotel name
    name_el = card.select_one('h2, h3, h4, .hotel-name, [class*="name"], [class*="title"]')
    if name_el:
        hotel['name'] = name_el.get_text(strip=True)
    
    # Stars
    stars_els = card.select('.fa-star, .star, [class*="star"]')
    hotel['stars'] = len(stars_els) if stars_els else 0
    
    # Location
    location_el = card.select_one('.location, [class*="location"], [class*="city"]')
    if location_el:
        hotel['location'] = location_el.get_text(strip=True)
    
    # Tags
    tag_els = card.select('.tag, .badge, .label, [class*="tag"]')
    hotel['tags'] = [tag.get_text(strip=True) for tag in tag_els]
    
    # Prices
    price_els = card.select('[class*="price"], .tarif, .montant')
    prices = []
    for price_el in price_els:
        text = price_el.get_text(strip=True)
        # Extract numeric value
        import re
        numbers = re.findall(r'[\d\s]+[,.]?\d*', text.replace(' ', ''))
        if numbers:
            try:
                price_value = float(numbers[0].replace(',', '.').replace(' ', ''))
                prices.append(price_value)
            except ValueError:
                pass
    
    if prices:
        hotel['price_min'] = min(prices)
        hotel['prices_found'] = prices
    
    # Discount
    discount_el = card.select_one('[class*="discount"], [class*="promo"], [class*="reduction"]')
    if discount_el:
        text = discount_el.get_text(strip=True)
        import re
        discount_match = re.search(r'(\d+)%', text)
        if discount_match:
            hotel['discount'] = int(discount_match.group(1))
    
    # Image
    img_el = card.select_one('img')
    if img_el:
        hotel['image'] = img_el.get('src', '') or img_el.get('data-src', '')
    
    # Availability
    avail_el = card.select_one('[class*="disponible"], [class*="available"]')
    hotel['available'] = avail_el is not None
    
    return hotel


async def extract_hotels_playwright(page):
    """Fallback: extraire avec les sélecteurs Playwright"""
    hotels = []
    
    try:
        # Wait for hotel elements to load
        await page.wait_for_selector('.hotel-card, .hotel-item, [class*="hotel"]', timeout=5000)
        
        hotel_elements = await page.query_selector_all('.hotel-card, .hotel-item, [class*="hotel-result"]')
        
        for el in hotel_elements:
            name = await el.query_selector('h2, h3, h4, [class*="name"]')
            price = await el.query_selector('[class*="price"], .tarif')
            
            hotel = {
                'name': await name.inner_text() if name else 'Unknown',
                'price_min': 0,
            }
            
            if price:
                import re
                price_text = await price.inner_text()
                numbers = re.findall(r'[\d\s]+', price_text)
                if numbers:
                    try:
                        hotel['price_min'] = float(numbers[0].replace(' ', ''))
                    except ValueError:
                        pass
            
            hotels.append(hotel)
    except Exception as e:
        print(f"  ⚠️  Playwright extraction error: {e}")
    
    return hotels


async def scrape_tunisiabeds(city, check_in, check_out, adults=2, children=0, headless=True):
    """Fonction principale de scraping"""
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()
        
        try:
            # Login if credentials provided
            import os
            username = os.environ.get('TUNISIABEDS_USER', USERNAME)
            password = os.environ.get('TUNISIABEDS_PASS', PASSWORD)
            
            if username and password:
                await login(page, username, password)
            
            # Search hotels
            hotels = await search_hotels(page, city, check_in, check_out, adults, children)
            
            return {
                'success': True,
                'city': city,
                'check_in': check_in,
                'check_out': check_out,
                'adults': adults,
                'children': children,
                'hotels_count': len(hotels),
                'hotels': hotels,
                'scraped_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return {
                'success': False,
                'error': str(e),
                'city': city
            }
        finally:
            await browser.close()


def main():
    parser = argparse.ArgumentParser(description='TunisiaBeds Hotel Scraper')
    parser.add_argument('--city', required=True, help='City name (Sousse, Hammamet, Djerba, Monastir)')
    parser.add_argument('--checkin', required=True, help='Check-in date (YYYY-MM-DD)')
    parser.add_argument('--checkout', required=True, help='Check-out date (YYYY-MM-DD)')
    parser.add_argument('--adults', type=int, default=2, help='Number of adults')
    parser.add_argument('--children', type=int, default=0, help='Number of children')
    parser.add_argument('--headless', action='store_true', default=True, help='Run headless')
    parser.add_argument('--output', default='results.json', help='Output file')
    
    args = parser.parse_args()
    
    # Run scraper
    results = asyncio.run(scrape_tunisiabeds(
        city=args.city,
        check_in=args.checkin,
        check_out=args.checkout,
        adults=args.adults,
        children=args.children,
        headless=args.headless
    ))
    
    # Save results
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Résultats sauvegardés dans {args.output}")
    print(f"   {results.get('hotels_count', 0)} hôtels trouvés")


if __name__ == '__main__':
    main()
