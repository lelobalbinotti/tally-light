# vTally Light - Wireless Tally System

Sistema completo de Tally Light sem fio para **OBS Studio** e **Blackmagic ATEM**, baseado em hardware acessível com **ESP8266 (NodeMCU)**. 

O sistema conta com iluminação dupla independente:
- **LED do Operador:** LED RGB de 5mm (4 pinos, cátodo comum `grb-` ou ânodo comum `grb+`).
- **Luz de Palco / Apresentador:** Matriz de 25 LEDs endereçáveis **WS2812B 5x5** (ou fita de LED cascateada).

---

## Recursos Principais

- **Compatibilidade Nativa com OBS Studio:** Integração via OBS WebSocket (suporte a v5 e v4 através de ponte automática integrada).
- **Suporte a Blackmagic ATEM:** Conexão direta com mixers ATEM via rede local.
- **Painel de Configuração Web Embutido:** Interface moderna acessível em `http://localhost:3000/tally-setup`.
  - Simulador visual em tempo real da matriz 5x5.
  - Botões de teste rápido com contagem regressiva de 10 segundos na placa física (Preview, Program, Boot, Apagar).
  - Terminal de logs com data e hora local do computador.
  - Gravador serial via USB integrado no próprio navegador (gravação rápida de configurações ou instalação completa de placas virgens com 1 clique).
- **Firmware Otimizado para ESP8266:**
  - Inicialização limpa: eliminação total do flash branco de PWM no boot.
  - Cores calibradas para evitar distorção óptica (amarelo quente e rosa definidos no LED de 5mm).
  - Isolamento completo entre as luzes de operador e palco (o operador pode ficar em preview enquanto a matriz desliga, se configurado).

---

## Download Rápido (Executável Pronto para Windows)

Não é necessário instalar Node.js ou compilar o código para usar o vTally Hub.
1. Acesse a aba [**Releases**](https://github.com/lelobalbinotti/tally-light/releases).
2. Baixe o arquivo `vTally-Studio-Release.zip`.
3. Extraia a pasta e execute `vTally Hub.exe`.
4. O servidor iniciará automaticamente na porta `3000`.

---

## Diagrama de Conexão do Hardware (Pinout)

Placa recomendada: **NodeMCU ESP8266 (ESP-12E / CH340 ou CP2102)**.

| Pino NodeMCU | Função | Conexão no Hardware |
| :--- | :--- | :--- |
| **D1** (GPIO 5) | PWM Verde | Terminal Verde do LED RGB 5mm |
| **D2** (GPIO 4) | PWM Vermelho | Terminal Vermelho do LED RGB 5mm |
| **D3** (GPIO 0) | PWM Azul | Terminal Azul do LED RGB 5mm |
| **D4** (GPIO 2) | Dados WS2812 | Pino **DIN** da Matriz WS2812 5x5 |
| **GND** | Terra Comum | Terminal Longo do LED (Cátodo) e **GND** da Matriz |
| **VIN / 3V3** | Alimentação | Alimentação 5V / 3.3V do circuito |

> **Nota:** Para LEDs ânodo comum (`grb+`), o terminal longo é conectado ao `3V3` e o modo correspondente é selecionado no painel.

---

## Estrutura do Repositório

```text
├── firmware/         # Firmware base NodeMCU (.bin), SPIFFS e scripts Lua corrigidos
├── hub/              # Código-fonte do vTally Hub, rotas de API, ponte OBS e tray
├── configurator/     # Interface web do configurador, simulador e servidor auxiliar
├── config/           # Modelo limpo de configuração (tally-settings.example.ini)
└── README.md         # Documentação do projeto
```

---

## Configuração do Tally (`tally-settings.ini`)

As configurações são salvas diretamente no sistema de arquivos do ESP8266:

```ini
tally.name=Cam1
station.ssid=Nome_Da_Sua_Rede_WiFi
station.password=Senha_Do_WiFi
station.ip=192.168.1.50        ; Opcional (deixe vazio para DHCP automático)
station.gateway=192.168.1.1
station.netmask=255.255.255.0
hub.ip=192.168.1.100            ; IP do computador onde roda o vTally Hub
hub.port=7411                  ; Porta padrão UDP
operator.type=grb-             ; grb- (cátodo comum) ou grb+ (ânodo comum)
operator.ws2812=0 grb          ; 0 se usar LED 5mm analógico
stage.ws2812=25 grb            ; Quantidade de LEDs na matriz (ex: 25)
brightness=20                  ; Brilho (1 a 100%)
```

---

## Como Gravar ou Atualizar as Placas

1. Conecte o NodeMCU ao computador via cabo USB.
2. Abra o vTally Hub e acesse `http://localhost:3000/tally-setup`.
3. Selecione a porta serial (**COM**) correspondente.
4. Defina o nome da câmera (ex: `Cam1`, `Cam2`) e as informações de rede.
5. Clique em:
   - **Instalar Firmware e Configurar Placa Nova:** Para placas de fábrica sem firmware prévio.
   - **Gravar na Placa e Reiniciar:** Para placas que já possuem o NodeMCU e precisam apenas atualizar as configurações ou o script de iluminação.

---

## Licença

Este projeto é distribuído sob a licença [MIT](LICENSE).
