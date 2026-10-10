import http.server
import socketserver
import json
import urllib.parse
import os
import sys
import time
import socket
import webbrowser
import threading
import subprocess
import serial.tools.list_ports
from check_lua_win32 import Win32Serial

PORT = 7420
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INI_PATH = os.path.join(BASE_DIR, "tally-settings.ini")

def parse_ini_file(path):
    config = {
        "tally_name": "Cam4",
        "ssid": "",
        "password": "",
        "ip_mode": "static",
        "static_ip": "192.168.1.50",
        "gateway": "192.168.1.1",
        "netmask": "255.255.255.0",
        "hub_ip": "192.168.1.100",
        "hub_port": 7411,
        "brightness": 5,
        "operator_type": "grb-",
        "operator_ws2812": "25 grb",
        "stage_ws2812": "0 grb"
    }
    if not os.path.exists(path):
        return config

    with open(path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith(";"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip()
                if k == "tally.name":
                    config["tally_name"] = v
                elif k == "station.ssid":
                    config["ssid"] = v
                elif k == "station.password":
                    config["password"] = v
                elif k == "station.ip":
                    config["static_ip"] = v
                    config["ip_mode"] = "static" if v else "dhcp"
                elif k == "station.gateway":
                    config["gateway"] = v
                elif k == "station.netmask":
                    config["netmask"] = v
                elif k == "hub.ip":
                    config["hub_ip"] = v
                elif k == "hub.port":
                    try:
                        config["hub_port"] = int(v)
                    except ValueError:
                        pass
                elif k == "brightness" or k == "ws2812.brightness":
                    try:
                        config["brightness"] = int(v)
                    except ValueError:
                        pass
                elif k == "operator.type":
                    config["operator_type"] = v.lower()
                elif k == "operator.ws2812":
                    config["operator_ws2812"] = v
                elif k == "stage.ws2812":
                    config["stage_ws2812"] = v
    if not config.get("static_ip"):
        config["ip_mode"] = "dhcp"
    return config

def write_ini_file(path, cfg):
    lines = [
        f"tally.name={cfg.get('tally_name', 'Cam4')}",
        f"station.ssid={cfg.get('ssid', '')}",
        f"station.password={cfg.get('password', '')}",
    ]
    if cfg.get("ip_mode") == "static" and cfg.get("static_ip"):
        lines.append(f"station.ip={cfg.get('static_ip')}")
        lines.append(f"station.gateway={cfg.get('gateway', '192.168.1.1')}")
        lines.append(f"station.netmask={cfg.get('netmask', '255.255.255.0')}")
    else:
        lines.append("station.ip=")
        lines.append("station.gateway=")
        lines.append("station.netmask=")
        
    lines.append(f"hub.ip={cfg.get('hub_ip', '192.168.1.100')}")
    lines.append(f"hub.port={cfg.get('hub_port', 7411)}")
    lines.append(f"operator.type={cfg.get('operator_type', 'grb-')}")
    lines.append(f"operator.ws2812={cfg.get('operator_ws2812', '25 grb')}")
    lines.append(f"stage.ws2812={cfg.get('stage_ws2812', '0 grb')}")
    lines.append(f"brightness={cfg.get('brightness', 5)}")
    lines.append("")
    
    content = "\n".join(lines)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return content

def list_serial_ports():
    ports = []
    for p in serial.tools.list_ports.comports():
        if p.device.upper() == "COM1":
            continue
        is_esp = ("CH340" in p.description.upper() or 
                  "CP210" in p.description.upper() or 
                  "USB" in p.description.upper() or 
                  "SERIAL" in p.description.upper())
        ports.append({
            "device": p.device,
            "description": p.description,
            "is_esp": is_esp
        })
    return ports

def upload_ini_to_esp(port, ini_content):
    logs = []
    def log(msg):
        logs.append(msg)

    log(f"Conectando a {port}...")
    try:
        ser = Win32Serial(port, 115200)
    except Exception as e:
        log(f"Erro ao abrir {port}: {e}")
        return False, logs

    time.sleep(0.3)
    ser.read(4096)
    
    log("Gravando tally-settings.ini na flash...")
    ser.write(b'file.remove("tally-settings.ini")\r\n')
    time.sleep(0.1)
    ser.write(b'f = file.open("tally-settings.ini", "w")\r\n')
    time.sleep(0.1)
    
    import base64
    data = ini_content.encode('utf-8')
    chunk_size = 90
    offset = 0
    while offset < len(data):
        chunk = data[offset:offset+chunk_size]
        b64 = base64.b64encode(chunk).decode('ascii')
        ser.write(f'f:write(encoder.fromBase64("{b64}"))\r\n'.encode('ascii'))
        time.sleep(0.1)
        ser.read(4096)
        offset += len(chunk)
        
    ser.write(b'f:close()\r\n')
    time.sleep(0.2)
    ser.read(4096)
    log("tally-settings.ini gravado com sucesso.")

    # 2. Atualizar init.lua para evitar flash branco na inicialização
    log("Atualizando init.lua (inicialização limpa de LEDs)...")
    init_bytes = b'ws2812.init(ws2812.MODE_SINGLE)\nws2812.write(string.char(0):rep(75))\ndofile("my-app.lc")\n'
    ser.write(b'file.remove("init.lua")\r\n')
    time.sleep(0.1)
    ser.write(b'f = file.open("init.lua", "w")\r\n')
    time.sleep(0.1)
    init_b64 = base64.b64encode(init_bytes).decode('ascii')
    ser.write(f'f:write(encoder.fromBase64("{init_b64}"))\r\n'.encode('ascii'))
    time.sleep(0.1)
    ser.write(b'f:close()\r\n')
    time.sleep(0.2)
    ser.read(4096)

    # 3. Atualizar e compilar my-led.lua se existir localmente
    my_led_paths = [
        os.path.join(BASE_DIR, "my-led.lua"),
        os.path.join(BASE_DIR, "unpacked_asar", "firmware", "my-led.lua")
    ]
    my_led_file = None
    for mlp in my_led_paths:
        if os.path.exists(mlp):
            my_led_file = mlp
            break

    if my_led_file:
        log("Atualizando my-led.lua e compilando my-led.lc na placa...")
        with open(my_led_file, "rb") as mf:
            led_bytes = mf.read()
        ser.write(b'file.remove("my-led.lua")\r\n')
        time.sleep(0.1)
        ser.write(b'f = file.open("my-led.lua", "w")\r\n')
        time.sleep(0.1)
        led_offset = 0
        while led_offset < len(led_bytes):
            chunk = led_bytes[led_offset:led_offset+chunk_size]
            b64 = base64.b64encode(chunk).decode('ascii')
            ser.write(f'f:write(encoder.fromBase64("{b64}"))\r\n'.encode('ascii'))
            time.sleep(0.08)
            ser.read(4096)
            led_offset += len(chunk)
        ser.write(b'f:close()\r\n')
        time.sleep(0.2)
        ser.read(4096)
        # Compilar nativamente no ESP8266
        ser.write(b'node.compile("my-led.lua")\r\n')
        time.sleep(1.0)
        ser.read(4096)
        # Remover fonte .lua para economizar heap
        ser.write(b'file.remove("my-led.lua")\r\n')
        time.sleep(0.1)
        ser.read(4096)
        log("Firmware de iluminação my-led.lc atualizado com sucesso.")

    log("Todos os scripts atualizados. Reiniciando a placa...")
    ser.write(b'node.restart()\r\n')
    time.sleep(1.0)
    
    log("Aguardando inicialização da placa...")
    start = time.time()
    boot_text = ""
    while time.time() - start < 7.0:
        chunk = ser.read(512)
        if chunk:
            for b in chunk:
                if 32 <= b <= 126 or b in (10, 13):
                    boot_text += chr(b)
        time.sleep(0.1)
        
    ser.close()
    for line in boot_text.splitlines():
        line = line.strip()
        if line and any(k in line for k in ["[INFO]", "Got IP", "Connect", "Contacting", "Listening", "NodeMCU"]):
            log(line)
            
    return True, logs

def send_udp_test(ip, port, r, g, b):
    # Formato vTally pacote: "O%03d/%03d/%03d S000/000/000" (25 bytes)
    pkt = f"O{r:03d}/{g:03d}/{b:03d} S000/000/000".encode('ascii')
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(1.0)
    sock.sendto(pkt, (ip, port))
    sock.close()

def ping_ip(ip):
    try:
        # Ping no Windows
        res = subprocess.run(["ping", "-n", "1", "-w", "800", ip], capture_output=True, text=True)
        return res.returncode == 0
    except Exception:
        return False

class TallyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass # Silenciar logs padrao HTTP no terminal

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        if path == "/" or path == "/index.html":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(os.path.join(BASE_DIR, "index.html"), "rb") as f:
                self.wfile.write(f.read())
            return
            
        elif path == "/api/ports":
            ports = list_serial_ports()
            self.send_json({"success": True, "ports": ports})
            return
            
        elif path == "/api/config":
            cfg = parse_ini_file(INI_PATH)
            self.send_json({"success": True, "config": cfg})
            return
            
        elif path == "/api/status":
            cfg = parse_ini_file(INI_PATH)
            target_ip = cfg.get("static_ip") or "192.168.1.50"
            online = ping_ip(target_ip)
            ports = list_serial_ports()
            esp_port = next((p["device"] for p in ports if p["is_esp"]), None)
            self.send_json({
                "success": True,
                "ip": target_ip,
                "is_online": online,
                "esp_port": esp_port,
                "all_ports": ports
            })
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len) if content_len > 0 else b"{}"
        try:
            body = json.loads(post_data.decode("utf-8"))
        except Exception:
            body = {}
            
        if path == "/api/save":
            cfg = body.get("config", {})
            port = body.get("port")
            ini_content = write_ini_file(INI_PATH, cfg)
            
            if port:
                ok, logs = upload_ini_to_esp(port, ini_content)
                self.send_json({
                    "success": ok,
                    "saved_to_board": ok,
                    "logs": logs,
                    "message": "Configurações gravadas com sucesso na placa!" if ok else "Falha ao gravar na porta USB."
                })
            else:
                self.send_json({
                    "success": True,
                    "saved_to_board": False,
                    "message": "Configurações salvas localmente no tally-settings.ini."
                })
            return
            
        elif path == "/api/test-led":
            color = body.get("color", "preview")
            cfg = parse_ini_file(INI_PATH)
            target_ip = cfg.get("static_ip") or "192.168.1.50"
            port = cfg.get("hub_port", 7411)
            
            colors = {
                "preview": (0, 255, 0),
                "program": (255, 0, 0),
                "both": (255, 255, 0),
                "boot": (0, 0, 255),
                "off": (0, 0, 0)
            }
            rgb = colors.get(color, (0, 255, 0))
            try:
                send_udp_test(target_ip, port, *rgb)
                self.send_json({"success": True, "color": color, "target": f"{target_ip}:{port}"})
            except Exception as e:
                self.send_json({"success": False, "error": str(e)})
            return

        self.send_error(404, "Not Found")

    def send_json(self, data):
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

def open_browser():
    time.sleep(1.2)
    webbrowser.open(f"http://127.0.0.1:{PORT}")

if __name__ == "__main__":
    server_address = ("", PORT)
    with socketserver.TCPServer(server_address, TallyRequestHandler) as httpd:
        print(f"=====================================================")
        print(f"   Painel de Configuração vTally iniciado com sucesso!")
        print(f"   Acesse no navegador: http://127.0.0.1:{PORT}")
        print(f"=====================================================")
        threading.Thread(target=open_browser, daemon=True).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")
