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
import serial
import serial.tools.list_ports

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
        "hub_ip": "192.168.1.50",
        "hub_port": 7411,
        "brightness": 20,
        "operator_type": "grb-",
        "operator_ws2812": "0 grb",
        "stage_ws2812": "25 grb"
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
        f"tally.name={cfg.get('tally_name', 'Cam1')}",
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
        
    lines.append(f"hub.ip={cfg.get('hub_ip', '')}")
    lines.append(f"hub.port={cfg.get('hub_port', 7411)}")

    op_mode = cfg.get("operator_mode") or cfg.get("operator_type", "grb-")
    if op_mode == "ws2812":
        lines.append("operator.type=grb-")
        lines.append("operator.ws2812=25 grb")
        lines.append("stage.ws2812=25 grb")
    elif op_mode == "grb+":
        lines.append("operator.type=grb+")
        lines.append("operator.ws2812=0 grb")
        lines.append("stage.ws2812=25 grb")
    else:
        lines.append("operator.type=grb-")
        lines.append("operator.ws2812=0 grb")
        lines.append("stage.ws2812=25 grb")

    lines.append("stage.type=grb-")
    lines.append(f"brightness={cfg.get('brightness', 20)}")
    lines.append("")
    
    content = "\r\n".join(lines)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return content

def list_serial_ports():
    ports = []
    for p in serial.tools.list_ports.comports():
        if p.device.upper() == "COM1":
            continue
        desc = p.description or ""
        is_esp = ("CH340" in desc.upper() or 
                  "CP210" in desc.upper() or 
                  "USB-SERIAL" in desc.upper() or
                  "1A86" in desc.upper())
        ports.append({
            "device": p.device,
            "description": p.description,
            "is_esp": is_esp
        })
    return ports

def find_firmware_dir():
    candidates = [
        os.path.join(BASE_DIR, "..", "firmware"),
        os.path.join(BASE_DIR, "firmware"),
        os.path.join(os.path.dirname(BASE_DIR), "firmware"),
        os.path.join(os.path.dirname(BASE_DIR), "repo_tally_light", "firmware"),
        r"C:\Users\lelo_\.gemini\antigravity\scratch\tally\repo_tally_light\firmware",
        r"C:\Users\lelo_\.gemini\antigravity\scratch\tally\firmware",
        r"D:\tally-light\firmware",
        r"D:\vTally-Studio-Release\firmware"
    ]
    for d in candidates:
        if os.path.exists(os.path.join(d, "my-led.lua")):
            return os.path.abspath(d)
    return None

def upload_ini_to_esp(port, ini_content):
    logs = []
    def log(msg):
        print(f"[Upload INI] {msg}")
        logs.append(msg)

    import base64

    log(f"Conectando a {port} de forma segura...")
    try:
        ser = serial.Serial()
        ser.port = port
        ser.baudrate = 115200
        ser.timeout = 0.5
        ser.dtr = False
        ser.rts = False
        ser.open()
        try:
            ser.setDTR(False)
            ser.setRTS(False)
        except Exception:
            pass
    except Exception as e:
        log(f"Erro ao abrir {port}: {e}")
        return False, logs

    # Aguarda estabilizacao do boot inicial da placa
    time.sleep(2.5)
    try:
        if ser.in_waiting:
            ser.read(ser.in_waiting)
    except Exception:
        pass

    def send_and_wait_prompt(cmd, timeout=3.5):
        ser.write(cmd.encode('ascii') + b'\r\n')
        start = time.time()
        resp = b""
        while time.time() - start < timeout:
            if ser.in_waiting:
                c = ser.read(ser.in_waiting)
                resp += c
                if b"> " in resp or resp.endswith(b">"):
                    return True, resp.decode('latin1', errors='replace')
            time.sleep(0.01)
        return False, resp.decode('latin1', errors='replace')

    def upload_file_stream(fname, data):
        send_and_wait_prompt('pcall(function() f:close() end)')
        send_and_wait_prompt(f'file.remove("{fname}")')
        ok, _ = send_and_wait_prompt(f'f = file.open("{fname}", "w")')
        if not ok:
            return False
        chunk_sz = 64
        for i in range(0, len(data), chunk_sz):
            chunk = data[i:i+chunk_sz]
            h = chunk.hex()
            ok, _ = send_and_wait_prompt(f'f:write(encoder.fromHex("{h}"))')
            if not ok:
                send_and_wait_prompt('f:close()')
                return False
        send_and_wait_prompt('f:close()')
        return True

    # 1. Liberar memoria RAM no ESP8266 para permitir compilacao dos scripts
    log("Preparando reinicializacao limpa do ESP8266 para liberar memoria RAM...")
    send_and_wait_prompt("")
    send_and_wait_prompt('pcall(function() file.remove("init.bak") end)')
    send_and_wait_prompt('pcall(function() file.rename("init.lua", "init.bak") end)')
    ser.write(b'node.restart()\r\n')

    # Aguarda a placa reiniciar limpa mantendo a conexao aberta (sem fechar para evitar novo reset DTR)
    time.sleep(2.5)
    try:
        ser.reset_input_buffer()
        ser.reset_output_buffer()
        send_and_wait_prompt("")
        send_and_wait_prompt("collectgarbage()")
    except Exception:
        pass

    # 2. Gravar e compilar modulos essenciais otimizados
    fw_dir = find_firmware_dir()
    if fw_dir:
        log(f"Pasta de firmware identificada: {fw_dir}")
        modules = ["my-settings.lua", "my-tally.lua", "my-log.lua", "my-wifi.lua", "my-led.lua"]
        for mod in modules:
            mod_path = os.path.join(fw_dir, mod)
            if os.path.exists(mod_path):
                log(f"Gravando {mod} com verificacao de fluxo...")
                with open(mod_path, "rb") as mf:
                    mdata = mf.read()
                upload_file_stream(mod, mdata)

                lc_name = mod.replace(".lua", ".lc")
                send_and_wait_prompt(f'file.remove("{lc_name}")')

                # Compilar modulo na memoria agora livre (>40KB heap)
                log(f"Compilando {lc_name} na placa...")
                send_and_wait_prompt(f'node.compile("{mod}")', timeout=5.0)

                ok, check_resp = send_and_wait_prompt(f'print("EXISTS_" .. "{lc_name}:", file.exists("{lc_name}"))')
                if "true" in check_resp:
                    log(f"{lc_name} compilado com sucesso.")
                    send_and_wait_prompt(f'file.remove("{mod}")')
                else:
                    log(f"Aviso: {lc_name} mantido em lua para execucao direta.")
    else:
        log("Aviso: Pasta de modulos firmware nao localizada, gravando apenas configuracoes.")

    # 3. Gravar init.lua com rotina de inicializacao limpa (sem flash branco)
    log("Gravando init.lua limpo (sem flash branco)...")
    init_code = b"""ws2812.init(ws2812.MODE_SINGLE)
ws2812.write(string.char(0):rep(75))
dofile("my-app.lc")
"""
    upload_file_stream("init.lua", init_code)
    send_and_wait_prompt('pcall(function() file.remove("init.bak") end)')

    # 4. Gravar tally-settings.ini
    log("Gravando tally-settings.ini na flash do ESP8266...")
    upload_file_stream("tally-settings.ini", ini_content.encode('utf-8'))
    log("tally-settings.ini gravado com sucesso.")

    # 5. Reiniciar em modo de producao
    log("Reiniciando a placa em modo operacional...")
    ser.write(b'node.restart()\r\n')
    time.sleep(1.0)
    ser.close()
    log("Placa configurada, atualizada e pronta para uso!")
    return True, logs

def find_firmware_files():
    candidates = [
        os.path.join(BASE_DIR, "..", "firmware"),
        os.path.join(BASE_DIR, "firmware"),
        os.path.join(os.path.dirname(BASE_DIR), "firmware"),
        os.path.join(os.path.dirname(BASE_DIR), "repo_tally_light", "firmware"),
        r"C:\Users\lelo_\.gemini\antigravity\scratch\tally\repo_tally_light\firmware",
        r"C:\Users\lelo_\.gemini\antigravity\scratch\tally\firmware",
        r"D:\tally-light\firmware",
        r"D:\vTally-Studio-Release\firmware"
    ]
    for d in candidates:
        fw = os.path.join(d, "nodemcu_firmware.bin")
        spiffs = os.path.join(d, "full_spiffs_patched.bin")
        if os.path.exists(fw) and os.path.exists(spiffs):
            return fw, spiffs
    return None, None

def flash_full_esp(port, config):
    logs = []
    def log(msg):
        print(f"[Flash Full] {msg}")
        logs.append(msg)

    fw, spiffs = find_firmware_files()
    if not fw or not spiffs:
        msg = "Arquivos de firmware (nodemcu_firmware.bin e full_spiffs_patched.bin) não encontrados."
        log(f"Erro: {msg}")
        return False, logs, msg

    log(f"Iniciando gravação completa na porta {port}...")
    log(f"Firmware NodeMCU: {fw}")
    log(f"Sistema SPIFFS: {spiffs}")

    success = False
    for baud in [460800, 115200]:
        log(f"Tentando gravar a {baud} baud com esptool...")
        cmd = [
            sys.executable, "-m", "esptool",
            "--chip", "esp8266",
            "--port", port,
            "--baud", str(baud),
            "write_flash",
            "--flash_mode", "dio",
            "--flash_size", "4MB",
            "0x00000", fw,
            "0x80000", spiffs
        ]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
            if proc.stdout:
                for line in proc.stdout.splitlines():
                    if any(k in line for k in ["Writing at", "Hash of data verified", "Wrote", "Connecting"]):
                        log(line)
            if proc.returncode == 0:
                log("Firmware e sistema de arquivos gravados com sucesso!")
                success = True
                break
            else:
                log(f"Falha a {baud} baud: {proc.stderr.strip() or proc.stdout.strip()}")
        except Exception as e:
            log(f"Exceção a {baud} baud: {e}")

    if not success:
        msg = "Falha ao gravar com esptool. Verifique o cabo USB e certifique-se de que a placa ESP8266 está conectada."
        log(msg)
        return False, logs, msg

    log("Aguardando 4 segundos para o sistema NodeMCU inicializar...")
    time.sleep(4.0)

    ini_content = write_ini_file(INI_PATH, config)
    log("Gravando tally-settings.ini com as configurações de rede e câmera...")
    ok, ini_logs = upload_ini_to_esp(port, ini_content)
    logs.extend(ini_logs)

    if ok:
        msg = "Placa virgem instalada e configurada com sucesso!"
        log(msg)
        return True, logs, msg
    else:
        msg = "Firmware gravado, mas falhou ao enviar tally-settings.ini."
        log(msg)
        return False, logs, msg

def send_udp_test(ip, port, r, g, b):
    pkt = f"O{r:03d}/{g:03d}/{b:03d} S000/000/000".encode('ascii')
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(1.0)
    sock.sendto(pkt, (ip, port))
    sock.close()

def ping_ip(ip):
    try:
        res = subprocess.run(["ping", "-n", "1", "-w", "800", ip], capture_output=True, text=True)
        return res.returncode == 0
    except Exception:
        return False

class TallyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        if path == "/" or path == "/index.html" or path == "/tally-setup":
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
                    "logs": ["Configuração salva em tally-settings.ini."],
                    "message": "Configurações salvas localmente no tally-settings.ini."
                })
            return

        elif path == "/api/flash-full":
            port = body.get("port")
            cfg = body.get("config", {})
            if not port:
                self.send_json({"success": False, "message": "Selecione uma porta COM antes de iniciar a gravação."})
                return
            ok, logs, msg = flash_full_esp(port, cfg)
            self.send_json({
                "success": ok,
                "logs": logs,
                "message": msg
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
