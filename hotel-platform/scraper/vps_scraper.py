"""
TuniStay VPS Scraper - استخراج أسعار حقيقية من TunisiaBeds وإرسالها لـ MySQL
يعمل على Windows VPS مع Python + Playwright

التثبيت:
    pip install playwright mysql-connector-python
    playwright install chromium

الاستخدام:
    python vps_scraper.py
    python vps_scraper.py --city Sousse
    python vps_scraper.py --all
"""

import json
import os
import sys
import time
import re
import argparse
from datetime import datetime, timedelta

try:
    from playwright.sync_api import sync_playwright
    import mysql.connector
except ImportError:
    print("❌ Modules manquants. Installez-les avec:")
    print("   pip install playwright mysql-connector-python")
    print("   playwright install chromium")
    sys.exit(1)

# Load config
CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')

def load_config():
    if not os.path.exists(CONFIG_PATH):
        print(f"❌ Fichier config.json non trouvé: {CONFIG_PATH}")
        print("   Créez-le avec vos identifiants TunisiaBeds et MySQL")
        sys.exit(1)
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

config = load_config()


def connect_db():
    """Connexion à MySQL Hostinger"""
    try:
        conn = mysql.connector.connect(
            host=config['mysql']['host'],
            port=config['mysql']['port'],
            user=config['mysql']['user'],
            password=config['mysql']['password'],
            database=config['mysql']['database']
        )
        print("✅ Connecté à MySQL Hostinger")
        return conn
    except Exception as e:
        print(f"❌ Erreur MySQL: {e}")
        return None


def scrape_city(page, city, check_in, check_out, adults=2, children=0):
    """Scrape les hôtels pour une ville et des dates données"""
    
    print(f"\n🔍 Recherche: {city} | {check_in} → {check_out} | {adults} adultes, {children} enfants")
    
    url = config['tunisiabeds']['url']
    
    try:
        # Go to homepage
        page.goto(url, wait_until='networkidle', timeout=30000)
        time.sleep(2)
        
        # Fill search form
        # City
        city_selector = page.locator('input[placeholder*="ville"], input[placeholder*="destination"], .city-input, #destination, input[name*="city"]')
        if city_selector.count() > 0:
            city_selector.first.click()
            city_selector.first.fill(city)
            time.sleep(1)
            # Click suggestion if available
            suggestion = page.locator(f'li:has-text("{city}"), .suggestion:has-text("{city}"), .autocomplete-item:has-text("{city}")')
            if suggestion.count() > 0:
                suggestion.first.click()
                time.sleep(0.5)
        
        # Dates
        checkin_input = page.locator('input[name*="checkin"], input[name*="arrival"], input[name*="date_debut"], input[placeholder*="Arrivée"]')
        if checkin_input.count() > 0:
            checkin_input.first.fill(check_in)
        
        checkout_input = page.locator('input[name*="checkout"], input[name*="departure"], input[name*="date_fin"], input[placeholder*="Départ"]')
        if checkout_input.count() > 0:
            checkout_input.first.fill(check_out)
        
        # Submit
        search_btn = page.locator('button:has-text("Recherche"), button:has-text("Chercher"), .btn-search, button[type="submit"]')
        if search_btn.count() > 0:
            search_btn.first.click()
        
        # Wait for results
        page.wait_for_load_state('networkidle', timeout=15000)
        time.sleep(3)
        
        # Extract hotels
        hotels = extract_hotels_from_page(page, city, check_in, check_out)
        
        if not hotels:
            print(f"   ⚠️ Aucun hôtel trouvé, essai URL directe...")
            # Try direct URL
            direct_url = f"{url}/hotels?ville={city}&date_debut={check_in}&date_fin={check_out}&adultes={adults}&enfants={children}"
            page.goto(direct_url, wait_until='networkidle', timeout=30000)
            time.sleep(3)
            hotels = extract_hotels_from_page(page, city, check_in, check_out)
        
        print(f"   ✅ {len(hotels)} hôtels trouvés pour {city}")
        return hotels
        
    except Exception as e:
        print(f"   ❌ Erreur scraping {city}: {e}")
        return []


def extract_hotels_from_page(page, city, check_in, check_out):
    """Extrait les données des hôtels depuis la page de résultats"""
    hotels = []
    
    try:
        # Wait for hotel cards to appear
        page.wait_for_selector('.hotel-card, .hotel-item, [class*="hotel"], .card-hotel', timeout=10000)
    except:
        print("   ⚠️ Pas de cartes hôtel détectées")
        return hotels
    
    # Get all hotel elements
    hotel_elements = page.query_selector_all('.hotel-card, .hotel-item, [class*="hotel-result"], .card-hotel')
    
    if not hotel_elements:
        # Alternative selectors
        hotel_elements = page.query_selector_all('[class*="hotel"]')
    
    for el in hotel_elements:
        try:
            hotel = {}
            
            # Hotel name
            name_el = el.query_selector('h2, h3, h4, [class*="name"], [class*="title"], .hotel-name')
            if name_el:
                hotel['name'] = name_el.inner_text().strip()
            else:
                continue
            
            # Stars
            stars_els = el.query_selector_all('.fa-star, [class*="star"]:not([class*="stars"])')
            hotel['stars'] = len(stars_els) if stars_els else 3
            
            # Price
            price_el = el.query_selector('[class*="price"], .tarif, .montant, .prix')
            if price_el:
                price_text = price_el.inner_text()
                numbers = re.findall(r'[\d\s]+[,.]?\d*', price_text.replace('\xa0', '').replace(' ', ''))
                if numbers:
                    try:
                        price_str = numbers[0].replace(',', '.').replace(' ', '')
                        hotel['price_lpd'] = float(price_str)
                    except:
                        hotel['price_lpd'] = 0
            
            # Discount
            discount_el = el.query_selector('[class*="discount"], [class*="promo"], [class*="reduction"]')
            if discount_el:
                disc_text = discount_el.inner_text()
                disc_match = re.search(r'(\d+)', disc_text)
                hotel['discount'] = int(disc_match.group(1)) if disc_match else 0
            else:
                hotel['discount'] = 0
            
            # Image
            img_el = el.query_selector('img')
            if img_el:
                hotel['image'] = img_el.get_attribute('src') or img_el.get_attribute('data-src') or ''
            
            # Tags/features
            tag_els = el.query_selector_all('.tag, .badge, .label, [class*="tag"]')
            hotel['tags'] = [t.inner_text().strip() for t in tag_els if t.inner_text().strip()]
            
            hotel['city'] = city
            hotel['check_in'] = check_in
            hotel['check_out'] = check_out
            
            # Calculate DP and AI prices from LPD
            if hotel.get('price_lpd', 0) > 0:
                hotel['price_dp'] = int(hotel['price_lpd'] * 1.3)
                hotel['price_ai'] = int(hotel['price_lpd'] * 1.6)
                hotels.append(hotel)
                
        except Exception as e:
            continue
    
    return hotels


def save_to_database(conn, hotels, city, check_in, check_out, adults, children):
    """Sauvegarde les résultats dans MySQL"""
    if not conn or not hotels:
        return
    
    cursor = conn.cursor()
    
    # Save to search_cache as JSON
    results_json = json.dumps(format_for_frontend(hotels), ensure_ascii=False)
    
    try:
        # Delete old cache for same search
        cursor.execute(
            "DELETE FROM search_cache WHERE city = %s AND check_in = %s AND check_out = %s AND adults = %s AND children = %s",
            (city, check_in, check_out, adults, children)
        )
        
        # Insert new cache
        cursor.execute(
            "INSERT INTO search_cache (city, check_in, check_out, adults, children, results) VALUES (%s, %s, %s, %s, %s, %s)",
            (city, check_in, check_out, adults, children, results_json)
        )
        
        conn.commit()
        print(f"   💾 Sauvegardé {len(hotels)} hôtels dans MySQL")
    except Exception as e:
        print(f"   ❌ Erreur sauvegarde: {e}")
        conn.rollback()


def format_for_frontend(hotels):
    """Formate les données pour le frontend"""
    formatted = []
    for hotel in hotels:
        nights = 1
        try:
            d1 = datetime.strptime(hotel['check_in'], '%Y-%m-%d')
            d2 = datetime.strptime(hotel['check_out'], '%Y-%m-%d')
            nights = max(1, (d2 - d1).days)
        except:
            pass
        
        price_lpd = hotel.get('price_lpd', 0)
        price_dp = hotel.get('price_dp', int(price_lpd * 1.3))
        price_ai = hotel.get('price_ai', int(price_lpd * 1.6))
        discount = hotel.get('discount', 0)
        
        original_lpd = int(price_lpd * (100 / (100 - discount))) if discount > 0 else int(price_lpd * 1.3)
        original_dp = int(price_dp * (100 / (100 - discount))) if discount > 0 else int(price_dp * 1.3)
        original_ai = int(price_ai * (100 / (100 - discount))) if discount > 0 else int(price_ai * 1.3)
        
        formatted.append({
            'name': hotel['name'],
            'stars': hotel.get('stars', 3),
            'city': hotel['city'],
            'tags': hotel.get('tags', []),
            'description': f"Hôtel {hotel.get('stars', 3)} étoiles situé à {hotel['city']}, Tunisie.",
            'image': hotel.get('image', f"https://placehold.co/400x250/0099cc/ffffff?text={hotel['name']}"),
            'discount': discount,
            'nights': nights,
            'prices': {
                'lpd': {'label': 'Logement Petit Déjeuner', 'price': price_lpd, 'originalPrice': original_lpd},
                'dp': {'label': 'Demi Pension (DP+)', 'price': price_dp, 'originalPrice': original_dp},
                'ai': {'label': 'Soft All Inclusive', 'price': price_ai, 'originalPrice': original_ai}
            },
            'rooms': [
                {'type': 'Chambre Standard', 'available': True},
                {'type': 'Chambre Vue Mer', 'available': True},
                {'type': 'Suite Familiale', 'available': True}
            ],
            'currency': 'DZD'
        })
    
    return formatted


def login_tunisiabeds(page):
    """Se connecter à TunisiaBeds"""
    url = config['tunisiabeds']['url']
    username = config['tunisiabeds']['username']
    password = config['tunisiabeds']['password']
    
    if not username or not password:
        print("⚠️ Pas de credentials TunisiaBeds - mode public")
        return False
    
    try:
        page.goto(f"{url}/login", wait_until='networkidle', timeout=30000)
        time.sleep(2)
        
        # Fill username (id="username", name="_username")
        page.fill('#username', username)
        time.sleep(0.5)
        
        # Fill password (id="password", name="_password")
        page.fill('#password', password)
        time.sleep(0.5)
        
        # Click submit button
        page.click('.fxt-btn-fill')
        
        page.wait_for_load_state('networkidle', timeout=15000)
        time.sleep(2)
        
        # Check if login was successful
        if '/login' not in page.url:
            print("✅ Connecte a TunisiaBeds")
            return True
        else:
            print("⚠️ Login echoue - verifiez username/password dans config.json")
            return False
    except Exception as e:
        print(f"⚠️ Login erreur: {e}")
        return False


def run_scraper(cities=None, days_ahead=None):
    """Lance le scraping complet"""
    
    print("=" * 50)
    print(f"🏨 TuniStay Scraper - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 50)
    
    if cities is None:
        cities = config.get('cities', ['Sousse', 'Hammamet', 'Djerba', 'Monastir'])
    
    if days_ahead is None:
        days_ahead = config.get('days_ahead', 30)
    
    adults = config.get('default_adults', 2)
    children = config.get('default_children', 0)
    
    # Connect to MySQL
    conn = connect_db()
    
    # Generate date ranges (every 7 days for the next X days)
    today = datetime.now()
    date_ranges = []
    for i in range(0, days_ahead, 7):
        check_in = (today + timedelta(days=i+1)).strftime('%Y-%m-%d')
        check_out = (today + timedelta(days=i+8)).strftime('%Y-%m-%d')
        date_ranges.append((check_in, check_out))
    
    total_hotels = 0
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,  # Set True for production
            args=['--no-sandbox']
        )
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = context.new_page()
        
        # Login
        login_tunisiabeds(page)
        
        # Scrape each city and date range
        for city in cities:
            for check_in, check_out in date_ranges:
                hotels = scrape_city(page, city, check_in, check_out, adults, children)
                
                if hotels:
                    save_to_database(conn, hotels, city, check_in, check_out, adults, children)
                    total_hotels += len(hotels)
                
                time.sleep(2)  # Pause between requests
        
        browser.close()
    
    if conn:
        conn.close()
    
    print(f"\n{'=' * 50}")
    print(f"✅ Terminé! {total_hotels} hôtels extraits et sauvegardés")
    print(f"{'=' * 50}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='TuniStay VPS Scraper')
    parser.add_argument('--city', help='Ville spécifique (Sousse, Hammamet, Djerba, Monastir)')
    parser.add_argument('--all', action='store_true', help='Scraper toutes les villes')
    parser.add_argument('--days', type=int, default=30, help='Nombre de jours à scraper')
    parser.add_argument('--headless', action='store_true', help='Mode sans fenêtre')
    
    args = parser.parse_args()
    
    cities = None
    if args.city:
        cities = [args.city]
    
    run_scraper(cities=cities, days_ahead=args.days)
