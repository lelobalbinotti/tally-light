# -*- coding: utf-8 -*-
"""
vTally Light - Gravador e Recuperador de Placas ESP8266 (NodeMCU)
Permite desentupir placas travadas em luz branca e instalar o firmware otimizado com suporte à matriz 5x5 (25 LEDs).
"""

import os
import sys
import time
import socket
import subprocess
import serial
import serial.tools.list_ports

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "192.168.1.50"

def find_firmware_files():
    candidates = [
        os.path.join(BASE_DIR, "firmware"),
        os.path.join(BASE_DIR, "..", "firmware"),
        r"D:\tally-light\firmware",
        r"D:\vTally-Studio-Release\firmware"
    ]
    for d in candidates:
        fw = os.path.join(d, "nodemcu_firmware.bin")
        spiffs = os.path.join(d, "full_spiffs_patched.bin")
        if os.path.exists(fw) and os.path.exists(spiffs):
            return fw, spiffs
    return None, None

def find_settings_lua():
    candidates = [
        os.path.join(BASE_DIR, "firmware", "my-settings.lua"),
        os.path.join(BASE_DIR, "..", "firmware", "my-settings.lua"),
        r"D:\tally-light\firmware\my-settings.lua",
        r"D:\vTally-Studio-Release\firmware\my-settings.lua"
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None

def list_ports():
    ports = []
    for p in serial.tools.list_ports.comports():
        if p.device.upper() == "COM1":
            continue
        desc = p.description or ""
        hwid = p.hwid or ""
        is_arduino = "2341" in hwid or "ARDUINO" in desc.upper()
        is_esp = ("CH340" in desc.upper() or 
                  "CP210" in desc.upper() or 
                  "1A86" in hwid.upper() or 
                  "USB-SERIAL" in desc.upper())
        ports.append({
            "device": p.device,
            "description": desc,
            "hwid": hwid,
            "is_esp": is_esp,
            "is_arduino": is_arduino
        })
    return ports

def select_port():
    while True:
        ports = list_ports()
        print("\n" + "="*50)
        print("          PORTAS SERIAIS DETECTADAS")
        print("="*50)
        if not ports:
            print("  [Nenhuma porta COM encontrada!]")
            print("\n  DICAS IMPORTANTES:")
            print("  1. Verifique se o cabo USB e de DADOS e nao apenas de carga.")
            print("  2. Conecte a placa NodeMCU diretamente na USB do computador.")
            print("  3. Certifique-se de que o driver CH340 esta instalado.")
            input("\nConecte a placa e pressione ENTER para tentar novamente...")
            continue

        default_idx = None
        for i, p in enumerate(ports):
            tag = ""
            if p["is_esp"]:
                tag = " <-- [RECOMENDADO: Placa NodeMCU/CH340]"
                if default_idx is None:
                    default_idx = i
            elif p["is_arduino"]:
                tag = " (AVISO: Arduino detectado, nao selecione para gravar Tally!)"
            print(f"  [{i+1}] {p['device']} - {p['description']}{tag}")

        print("  [R] Atualizar lista de portas")
        def_prompt = f" [{default_idx+1}]" if default_idx is not None else ""
        escolha = input(f"\nSelecione o numero da porta{def_prompt} ou R para atualizar: ").strip()

        if escolha.upper() == "R":
            continue
        if not escolha and default_idx is not None:
            return ports[default_idx]["device"]
        if escolha.isdigit() and 1 <= int(escolha) <= len(ports):
            selected = ports[int(escolha)-1]
            if selected["is_arduino"]:
                conf = input("Aviso: Essa porta parece ser um Arduino e nao uma placa ESP8266. Deseja continuar mesmo assim? (s/N): ")
                if conf.lower() != "s":
                    continue
            return selected["device"]
        print("Opcao invalida. Tente novamente.")

def run_esptool_flash(port, fw_path, spiffs_path):
    print("\nIniciando conexao com a placa...")
    print("Tentando colocar a placa em modo de gravacao...")

    for attempt in range(2):
        for baud in [460800, 115200]:
            print(f"\nTentando gravar a {baud} baud...")
            cmd = [
                sys.executable, "-m", "esptool",
                "--chip", "esp8266",
                "--port", port,
                "--baud", str(baud),
                "--before", "default_reset",
                "--after", "hard_reset",
                "write_flash",
                "--flash_mode", "dio",
                "--flash_size", "4MB",
                "0x00000", fw_path,
                "0x80000", spiffs_path
            ]
            res = subprocess.run(cmd)
            if res.returncode == 0:
                print("\n" + "="*50)
                print("  FIRMWARE E SPIFFS GRAVADOS COM SUCESSO!")
                print("="*50)
                return True
            else:
                print(f"Falha a {baud} baud.")

        if attempt == 0:
            print("\n" + "!"*60)
            print("  O computador nao conseguiu colocar o ESP8266 em modo FLASH!")
            print("  Procedimento manual de Bootloader:")
            print("  1. Mantenha pressionado o botao 'FLASH' (ou 'BOOT') na placa.")
            print("  2. De um clique rapido no botao 'RST' (Reset).")
            print("  3. Solte o botao 'FLASH'.")
            print("!"*60)
            input("Apos fazer o procedimento acima, pressione ENTER para tentar de novo...")

    return False

def send_wait_prompt(ser, cmd, timeout=3.5):
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

def upload_file_hex(ser, local_path, remote_name):
    if not os.path.exists(local_path):
        return False
    with open(local_path, "rb") as f:
        data = f.read()

    lc_name = remote_name.replace(".lua", ".lc")
    send_wait_prompt(ser, f'file.remove("{remote_name}"); file.remove("{lc_name}")')
    ok, _ = send_wait_prompt(ser, f'f = file.open("{remote_name}", "w")')
    if not ok:
        return False

    chunk_size = 64
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i+chunk_size]
        h = chunk.hex()
        ok, _ = send_wait_prompt(ser, f'f:write(encoder.fromHex("{h}"))')
        if not ok:
            send_wait_prompt(ser, 'f:close()')
            return False

    send_wait_prompt(ser, 'f:close()')

    send_wait_prompt(ser, f'node.compile("{remote_name}")', timeout=5.0)
    ok, check_resp = send_wait_prompt(ser, f'print("EXISTS_" .. "{lc_name}:", file.exists("{lc_name}"))')
    if "true" in check_resp:
        send_wait_prompt(ser, f'file.remove("{remote_name}")')
        print(f"  [OK] {lc_name} compilado com sucesso.")
    else:
        print(f"  [Aviso] {lc_name} mantido em lua para execucao direta.")
    return True

def write_tally_ini(port, cfg):
    print(f"\nConectando a {port} a 115200 baud para preparar a placa...")
    try:
        ser = serial.Serial()
        ser.port = port
        ser.baudrate = 115200
        ser.timeout = 1.0
        ser.dtr = False
        ser.rts = False
        ser.open()
        ser.setDTR(False)
        ser.setRTS(False)
    except Exception as e:
        print(f"Erro ao abrir {port}: {e}")
        return False

    time.sleep(0.8)
    ser.reset_input_buffer()
    ser.reset_output_buffer()

    # 1. Reiniciar em modo limpo para liberar memoria RAM (>40KB)
    print("Reiniciando ESP8266 em modo limpo para liberar memoria RAM...")
    clean_cmd = b'for i=0,6 do tmr.stop(i) end; wifi.sta.disconnect(); pcall(function() file.rename("init.lua", "init.bak") end); node.restart()\r\n'
    try:
        ser.write(clean_cmd)
        time.sleep(0.8)
        ser.close()
    except Exception:
        try: ser.close()
        except Exception: pass

    time.sleep(2.8)

    print(f"Reconectando a {port} com prompt puro...")
    try:
        ser = serial.Serial()
        ser.port = port
        ser.baudrate = 115200
        ser.timeout = 1.0
        ser.dtr = False
        ser.rts = False
        ser.open()
        ser.setDTR(False)
        ser.setRTS(False)
    except Exception as e:
        print(f"Erro ao reconectar a {port}: {e}")
        return False

    time.sleep(0.5)
    ser.reset_input_buffer()
    ser.reset_output_buffer()
    ser.write(b"\r\ncollectgarbage()\r\n")
    time.sleep(0.2)
    if ser.in_waiting:
        ser.read(ser.in_waiting)

    # 2. Gravar e compilar modulos essenciais otimizados (settings, tally timer, log timer, led 25 leds)
    settings_file = find_settings_lua()
    fw_dir = os.path.dirname(settings_file) if settings_file else ""
    modules = ["my-settings.lua", "my-tally.lua", "my-log.lua", "my-wifi.lua", "my-led.lua"]
    for mod in modules:
        mod_path = os.path.join(fw_dir, mod)
        if os.path.exists(mod_path):
            print(f"Gravando e compilando {mod} otimizado...")
            upload_file_hex(ser, mod_path, mod)

    # 3. Atualizar init.lua com inicializacao limpa (evita flash branco)
    print("Gravando init.lua com rotina de inicializacao limpa (sem flash branco)...")
    init_code = b"""ws2812.init(ws2812.MODE_SINGLE)
ws2812.write(string.char(0):rep(75))
dofile("my-app.lc")
"""
    send_wait_prompt(ser, 'file.remove("init.lua")')
    send_wait_prompt(ser, 'pcall(function() file.remove("init.bak") end)')
    send_wait_prompt(ser, 'f = file.open("init.lua", "w")')
    send_wait_prompt(ser, f'f:write(encoder.fromHex("{init_code.hex()}"))')
    send_wait_prompt(ser, 'f:close()')

    # 3. Gravar tally-settings.ini
    lines = [
        f"tally.name={cfg.get('name', 'Cam1')}",
        f"station.ssid={cfg.get('ssid', '')}",
        f"station.password={cfg.get('password', '')}",
        f"station.ip={cfg.get('static_ip', '')}",
        f"station.gateway={cfg.get('gateway', '')}",
        f"station.netmask={cfg.get('netmask', '')}",
        f"hub.ip={cfg.get('hub_ip', '192.168.1.100')}",
        f"hub.port={cfg.get('hub_port', 7411)}",
        f"operator.type={cfg.get('operator_type', 'grb-')}",
        f"stage.type=grb-",
        f"operator.ws2812={cfg.get('operator_ws2812', '0 grb')}",
        f"stage.ws2812={cfg.get('stage_ws2812', '25 grb')}",
        f"brightness={cfg.get('brightness', 20)}",
        ""
    ]
    ini_content = "\r\n".join(lines).encode('utf-8')

    print("Gravando tally-settings.ini...")
    send_wait_prompt(ser, 'file.remove("tally-settings.ini")')
    send_wait_prompt(ser, 'f = file.open("tally-settings.ini", "w")')
    send_wait_prompt(ser, f'f:write(encoder.fromHex("{ini_content.hex()}"))')
    send_wait_prompt(ser, 'f:close()')
    print("Configuracoes gravadas com sucesso.")

    # 4. Reiniciar a placa e monitorar Wi-Fi
    print("Reiniciando a placa e aguardando conexao Wi-Fi...")
    ser.write(b'node.restart()\r\n')
    time.sleep(1.0)

    start = time.time()
    boot_log = ""
    while time.time() - start < 10.0:
        if ser.in_waiting:
            chunk = ser.read(ser.in_waiting).decode('latin1', errors='ignore')
            clean = ''.join(c if (32 <= ord(c) < 127 or c in '\r\n\t') else '' for c in chunk)
            if clean:
                sys.stdout.write(clean)
                sys.stdout.flush()
        time.sleep(0.1)

    ser.close()
    print("\n" + "="*50)
    print("  PLACA CONFIGURADA E PRONTA PARA USO!")
    print("="*50)
    return True

def monitor_serial(port):
    print(f"\nAbrindo monitor serial em {port} a 115200 baud...")
    print("Pressione Ctrl+C para sair do monitor serial.\n")
    try:
        ser = serial.Serial(port, 115200, timeout=0.1)
        while True:
            if ser.in_waiting:
                data = ser.read(ser.in_waiting).decode('latin1', errors='ignore')
                clean = ''.join(c if (32 <= ord(c) < 127 or c in '\r\n\t') else '' for c in data)
                if clean:
                    sys.stdout.write(clean)
                    sys.stdout.flush()
            time.sleep(0.02)
    except KeyboardInterrupt:
        print("\nMonitor encerrado.")
    except Exception as e:
        print(f"\nErro serial: {e}")
    finally:
        try:
            ser.close()
        except Exception:
            pass

def main():
    os.system("cls" if os.name == "nt" else "clear")
    print("="*65)
    print("   vTally Light - Gravador e Recuperador de Placas ESP8266")
    print("="*65)
    local_ip = get_local_ip()
    print(f"IP deste computador: {local_ip}")

    fw_path, spiffs_path = find_firmware_files()
    if not fw_path or not spiffs_path:
        print("\nERRO CRITICO: Arquivos de firmware nao encontrados!")
        print("Certifique-se de que a pasta 'firmware' existe com:")
        print("  - nodemcu_firmware.bin")
        print("  - full_spiffs_patched.bin")
        input("\nPressione ENTER para sair...")
        return

    print(f"Firmware encontrado: {os.path.basename(fw_path)}")
    print(f"SPIFFS encontrado:   {os.path.basename(spiffs_path)}")

    while True:
        print("\n" + "-"*50)
        print("O que voce deseja fazer?")
        print("  [1] Recuperar Placa Travada (Luz Branca) ou Gravar Firmware Completo")
        print("  [2] Atualizar Somente as Configuracoes (Nome / Wi-Fi / IP)")
        print("  [3] Abrir Terminal / Monitor Serial para ver mensagens da placa")
        print("  [S] Sair")
        print("-"*50)
        opcao = input("Escolha uma opcao [1]: ").strip().upper()
        if opcao == "S":
            break
        if not opcao:
            opcao = "1"

        port = select_port()
        if not port:
            continue

        if opcao == "1":
            print(f"\nVoce escolheu regravar a placa na porta {port}.")
            print("Isso ira restaurar o sistema completo, desentupir qualquer travamento")
            print("e instalar a versao otimizada para a matriz de 25 LEDs.\n")

            cam_name = input("Nome da Camera (ex: Cam1, Cam2, Cam3) [Cam1]: ").strip() or "Cam1"
            ssid = input("Nome da Rede Wi-Fi (SSID): ").strip()
            password = input("Senha da Rede Wi-Fi: ").strip()
            hub_ip = input(f"IP do Computador rodando o vTally Hub [{local_ip}]: ").strip() or local_ip
            
            print("\nTipo do LED do Operador:")
            print("  [1] Catodo Comum (grb-) [Padrao recomendado]")
            print("  [2] Anodo Comum (grb+)")
            print("  [3] Fita/Matriz WS2812")
            tipo_sel = input("Escolha o tipo de LED [1]: ").strip()
            op_type = "grb-"
            op_ws = "0 grb"
            if tipo_sel == "2":
                op_type = "grb+"
            elif tipo_sel == "3":
                op_ws = "25 grb"

            cfg = {
                "name": cam_name,
                "ssid": ssid,
                "password": password,
                "hub_ip": hub_ip,
                "hub_port": 7411,
                "operator_type": op_type,
                "operator_ws2812": op_ws,
                "stage_ws2812": "25 grb",
                "brightness": 20
            }

            print("\nIniciando gravacao do sistema operacional e SPIFFS...")
            ok = run_esptool_flash(port, fw_path, spiffs_path)
            if ok:
                print("Aguardando 3 segundos para inicializar o NodeMCU...")
                time.sleep(3.0)
                write_tally_ini(port, cfg)
            else:
                print("\nNao foi possivel regravar a placa. Verifique o cabo e o procedimento do botao FLASH.")

        elif opcao == "2":
            cam_name = input("Nome da Camera [Cam1]: ").strip() or "Cam1"
            ssid = input("Nome do Wi-Fi (SSID): ").strip()
            password = input("Senha do Wi-Fi: ").strip()
            hub_ip = input(f"IP do Hub [{local_ip}]: ").strip() or local_ip

            cfg = {
                "name": cam_name,
                "ssid": ssid,
                "password": password,
                "hub_ip": hub_ip,
                "hub_port": 7411,
                "operator_type": "grb-",
                "operator_ws2812": "0 grb",
                "stage_ws2812": "25 grb",
                "brightness": 20
            }
            write_tally_ini(port, cfg)

        elif opcao == "3":
            monitor_serial(port)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nOperacao cancelada pelo usuario.")
