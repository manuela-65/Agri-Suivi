import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        page.on("request", lambda request: print(f"Request: {request.method} {request.url} headers={request.headers.get('x-tenant-id')}"))
        page.on("response", lambda response: print(f"Response: {response.status} {response.url}"))
        
        print("Navigating to login...")
        await page.goto("http://localhost:5173/login")
        
        print("Filling login form...")
        await page.fill("input[name='tenant_schema']", "ferme_pirxj") # Or any existing schema
        await page.fill("input[name='email']", "test@test.com")
        await page.fill("input[name='password']", "pass1234")
        
        print("Submitting...")
        await page.click("button[type='submit']")
        
        await asyncio.sleep(5)
        print("Done")
        await browser.close()

asyncio.run(run())
