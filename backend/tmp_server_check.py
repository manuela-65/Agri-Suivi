import urllib.request

try:
    r = urllib.request.urlopen('http://127.0.0.1:8000/', timeout=5)
    print('status', r.getcode())
    data = r.read(500).decode('utf-8', errors='ignore')
    print(data[:400])
except Exception as e:
    print('error', type(e).__name__, e)
