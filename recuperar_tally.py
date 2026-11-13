# -*- coding: utf-8 -*-
"""
vTally Light - Gravador e Recuperador de Placas ESP8266 (NodeMCU)
Permite atualizar placas montadas sem apertar botoes ou regravar a flash inteira.
"""

import os
import sys
import time
import socket
import struct
import subprocess
import serial
import serial.tools.list_ports

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

COMPACT_MY_LED = """local pOG,pOR,pOB=1,2,3
local pB=0
local pMG,pMR,pMB=5,6,7
gpio.mode(pB,gpio.OUTPUT)
ws2812.init(ws2812.MODE_SINGLE)
ws2812.write(string.char(0):rep(75))
local opD=(MySettings and MySettings.operatorType and MySettings.operatorType()==LightTypes.COMMON_ANODE) and 100 or 0
local stD=(MySettings and MySettings.stageType and MySettings.stageType()==LightTypes.COMMON_ANODE) and 100 or 0
local timer=tmr.create()
pwm2.setup_pin_hz(pOR,1000,100,opD)
pwm2.setup_pin_hz(pOG,1000,100,opD)
pwm2.setup_pin_hz(pOB,1000,100,opD)
pwm2.setup_pin_hz(pMR,1000,100,stD)
pwm2.setup_pin_hz(pMG,1000,100,stD)
pwm2.setup_pin_hz(pMB,1000,100,stD)
pwm2.start()
local lR,lG,lB=-1,-1,-1
local function showColor(oR,oG,oB,sR,sG,sB)
sR,sG,sB=sR or 0,sG or 0,sB or 0
local opR,opG,opB=oR,oG,oB
if opR>180 and opG>180 and opB<60 then opG=math.floor(opG*0.35)
elseif opR>180 and opB>180 and opG<60 then opB=math.floor(opB*0.40) end
local dR,dG,dB=(opR/255)*100,(opG/255)*100,(opB/255)*100
if opG>0 and dG<3 then dG=3 end
if opR>0 and dR<3 then dR=3 end
if opB>0 and dB<3 then dB=3 end
if MySettings.operatorType()==LightTypes.COMMON_ANODE then dR,dG,dB=100-dR,100-dG,100-dB end
pwm2.set_duty(pOR,dR);pwm2.set_duty(pOG,dG);pwm2.set_duty(pOB,dB)
local sdR,sdG,sdB=(sR/255)*100,(sG/255)*100,(sB/255)*100
if MySettings.stageType()==LightTypes.COMMON_ANODE then sdR,sdG,sdB=100-sdR,100-sdG,100-sdB end
pwm2.set_duty(pMR,sdR);pwm2.set_duty(pMG,sdG);pwm2.set_duty(pMB,sdB)
local mR,mG,mB
if (oB>0 and oR==0 and oG==0 and sR==0 and sG==0 and sB==0) then mR,mG,mB=0,0,oB
else mR,mG,mB=sR,sG,sB end
local maxP=0.25
if MySettings.ws2812Brightness then
local b=MySettings.ws2812Brightness()
if b and b>0 and b<=100 then maxP=b/100 end
end
local cR,cG,cB=math.floor(mR*maxP),math.floor(mG*maxP),math.floor(mB*maxP)
if cR~=lR or cG~=lG or cB~=lB then
lR,lG,lB=cR,cG,cB
local isGRB=(MySettings.stageWs2812Type()~=Ws2812Types.RGB)
local l=isGRB and string.char(cG,cR,cB) or string.char(cR,cG,cB)
local d=string.char(0,0,0)
local m25
if cB>0 and cR==0 and cG==0 then
m25=d:rep(6)..l:rep(3)..d:rep(2)..l:rep(3)..d:rep(2)..l:rep(3)..d:rep(6)
else
m25=l:rep(6)..d:rep(3)..l:rep(2)..d:rep(3)..l:rep(2)..d:rep(3)..l:rep(6)
end
local tot=(MySettings.operatorNumberOfWs2812Lights() or 0)+(MySettings.stageNumberOfWs2812Lights() or 0)
if tot>25 then ws2812.write(m25..m25) else ws2812.write(m25) end
end
if (oR==0 and oG==0 and oB<255) or (oR==oG and oG==oB and oB<255) then
gpio.write(pB,gpio.HIGH)
else
gpio.write(pB,gpio.LOW)
end
end
local curHash=nil
local function showFlashPattern(oR,oG,oB,sR,sG,sB,pattern,dur)
local pH=""
for _,step in pairs(pattern) do pH=pH..(step and "1" or "0") end
local h=string.format("%d/%d/%d-%s-%d",oR,oG,oB,pH,dur)
if h==curHash then return end
curHash=h
local idx=1
local maxI=#pattern
local function nxt()
lR,lG,lB=-1,-1,-1
if pattern[idx] then showColor(oR,oG,oB,sR,sG,sB)
else showColor(0,0,0,0,0,0) end
idx=idx+1
if idx>maxI then idx=1 end
end
timer:unregister()
nxt()
timer:alarm(dur,tmr.ALARM_AUTO,nxt)
end
local function showStaticColor(oR,oG,oB,sR,sG,sB)
timer:unregister()
curHash=nil
showColor(oR,oG,oB,sR,sG,sB)
end
local B,D=true,false
_G.MyLed={
initial=function() showStaticColor(0,0,255,0,0,0) end,
waitForWifiConnection=function() showFlashPattern(0,0,255,0,0,0,{B,D},500) end,
invalidSettingsFile=function() showFlashPattern(0,0,255,0,0,0,{B,D,B,D,B,D,D,D,D,D,D,D},150) end,
waitForWifiIp=function() showFlashPattern(0,0,255,0,0,0,{B,D,B,D},250) end,
waitForServerConnection=function() showFlashPattern(0,0,255,0,0,0,{B,D,B,D,D,D},150) end,
static=showStaticColor,
flash=showFlashPattern
}
return _G.MyLed
""".strip()

INIT_CODE = """ws2812.init(ws2812.MODE_SINGLE)
ws2812.write(string.char(0):rep(75))
dofile("my-app.lc")
""".strip()

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "192.168.1.100"

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
            input("\nConecte a placa e pressione ENTER para atualizar...")
            continue

        default_idx = None
        for i, p in enumerate(ports):
            tag = ""
            if p["is_esp"]:
                tag = " <-- [RECOMENDADO: NodeMCU / CH340]"
                if default_idx is None:
                    default_idx = i
            elif p["is_arduino"]:
                tag = " (Arduino detectado)"
            print(f"  [{i+1}] {p['device']} - {p['description']}{tag}")

        print("  [R] Atualizar lista de portas")
        def_prompt = f" [{default_idx+1}]" if default_idx is not None else ""
        escolha = input(f"\nSelecione o numero da porta{def_prompt} ou R para atualizar: ").strip()

        if escolha.upper() == "R":
            continue
        if not escolha and default_idx is not None:
            return ports[default_idx]["device"]
        if escolha.isdigit() and 1 <= int(escolha) <= len(ports):
            return ports[int(escolha)-1]["device"]
        print("Opcao invalida. Tente novamente.")

def send_file_chunks(ser, filename, content_bytes):
    print(f"  Gravando {filename} ({len(content_bytes)} bytes)...")
    ser.write(f'file.remove("{filename}")\r\n'.encode('ascii'))
    time.sleep(0.08)
    ser.write(f'f = file.open("{filename}", "w")\r\n'.encode('ascii'))
    time.sleep(0.08)

    chunk_sz = 64
    for i in range(0, len(content_bytes), chunk_sz):
        chunk = content_bytes[i:i+chunk_sz]
        h = chunk.hex()
        ser.write(f'f:write(encoder.fromHex("{h}"))\r\n'.encode('ascii'))
        time.sleep(0.05)
        sys.stdout.write(".")
        sys.stdout.flush()

    ser.write(b'f:close()\r\n')
    time.sleep(0.1)
    print(" [OK]")

def deploy_software_direct(port, cfg):
    print(f"\nConectando a {port}...")
    try:
        ser = serial.Serial(port, 115200, timeout=1.0)
        ser.dtr = False
        ser.rts = False
        time.sleep(0.2)
    except Exception as e:
        print(f"Erro ao abrir {port}: {e}")
        return False

    print("1. Parando tarefas em segundo plano e liberando memoria...")
    ser.write(b'\r\nfor i=0,6 do tmr.stop(i) end; wifi.sta.disconnect(); collectgarbage()\r\n')
    time.sleep(0.5)

    print("2. Removendo versao antiga dos modulos...")
    ser.write(b'file.remove("my-led.lc"); file.remove("my-led.lua")\r\n')
    time.sleep(0.2)

    print("3. Enviando my-led.lua (9 centro / 16 borda / sem azul fraco)...")
    send_file_chunks(ser, "my-led.lua", COMPACT_MY_LED.encode('utf-8'))

    print("4. Compilando my-led.lc na placa...")
    ser.write(b'node.compile("my-led.lua")\r\n')
    time.sleep(1.2)
    ser.write(b'file.remove("my-led.lua")\r\n')
    time.sleep(0.2)

    print("5. Gravando init.lua (sem flash branco)...")
    send_file_chunks(ser, "init.lua", INIT_CODE.encode('utf-8'))

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
    print("6. Gravando tally-settings.ini...")
    send_file_chunks(ser, "tally-settings.ini", ini_content)

    print("\n7. Reiniciando a placa em modo operacional...")
    ser.write(b'node.restart()\r\n')
    time.sleep(1.0)

    print("8. Verificando inicializacao da placa:")
    t0 = time.time()
    boot_text = ""
    while time.time() - t0 < 6.0:
        if ser.in_waiting:
            c = ser.read(ser.in_waiting).decode('latin1', errors='replace')
            clean = ''.join(ch if (32 <= ord(ch) < 127 or ch in '\r\n\t') else '' for ch in c)
            if clean:
                sys.stdout.write(clean)
                sys.stdout.flush()
                boot_text += clean
        time.sleep(0.05)

    ser.close()
    print("\n" + "="*50)
    print("  PLACA ATUALIZADA E CONFIGURADA COM SUCESSO!")
    print("  Nenhum botao fisico precisou ser pressionado!")
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
        try: ser.close()
        except Exception: pass

def main():
    os.system("cls" if os.name == "nt" else "clear")
    print("="*65)
    print("   vTally Light - Gravador e Atualizador de Placas ESP8266")
    print("="*65)
    local_ip = get_local_ip()

    while True:
        print("\n" + "-"*50)
        print("O que voce deseja fazer?")
        print("  [1] Atualizar Placa Montada (Sem Botoes / Sem Desmontar)")
        print("  [2] Abrir Monitor Serial (Depuracao)")
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
            print(f"\nConfigurando gravacao para a placa na porta {port}.\n")
            cam_name = input("Nome da Camera (ex: Cam1, Cam2) [Cam1]: ").strip() or "Cam1"
            ssid = input("Nome da Rede Wi-Fi (SSID): ").strip()
            password = input("Senha da Rede Wi-Fi: ").strip()
            hub_ip = input(f"IP do Computador do vTally Hub [{local_ip}]: ").strip() or local_ip
            
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

            deploy_software_direct(port, cfg)
            input("\nPressione ENTER para continuar...")

        elif opcao == "2":
            monitor_serial(port)

if __name__ == "__main__":
    main()
