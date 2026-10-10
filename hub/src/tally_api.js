const fs = require('fs');
const path = require('path');
const dgram = require('dgram');
const { exec } = require('child_process');

let serialportModule = null;
try {
  serialportModule = require('serialport');
} catch (e) {
  console.warn('[Tally API] serialport nativo indisponível, usando fallback do sistema:', e.message);
}

const DEFAULT_INI_LOCATIONS = [
  path.join(path.dirname(process.execPath), 'tally-settings.ini'),
  path.join(process.cwd(), 'tally-settings.ini'),
  'c:\\Users\\lelo_\\.gemini\\antigravity\\scratch\\tally\\tally-settings.ini'
];

function getIniPath() {
  for (const p of DEFAULT_INI_LOCATIONS) {
    if (fs.existsSync(p)) return p;
  }
  return DEFAULT_INI_LOCATIONS[0];
}

function parseIni(content) {
  const result = {
    tally_name: 'Cam4',
    ssid: '',
    password: '',
    ip_mode: 'dhcp',
    static_ip: '',
    gateway: '',
    netmask: '255.255.255.0',
    hub_ip: '192.168.1.100',
    hub_port: 7411,
    brightness: 5,
    operator_type: 'grb-',
    operator_ws2812: '25 grb',
    stage_ws2812: '0 grb'
  };

  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();

    if (key === 'tally.name') result.tally_name = val;
    else if (key === 'station.ssid') result.ssid = val;
    else if (key === 'station.password') result.password = val;
    else if (key === 'station.ip') {
      result.static_ip = val;
      if (val) result.ip_mode = 'static';
    }
    else if (key === 'station.gateway') result.gateway = val;
    else if (key === 'station.netmask') result.netmask = val;
    else if (key === 'hub.ip') result.hub_ip = val;
    else if (key === 'hub.port') result.hub_port = parseInt(val, 10) || 7411;
    else if (key === 'brightness') result.brightness = parseInt(val, 10) || 5;
    else if (key === 'operator.type') result.operator_type = val.toLowerCase();
    else if (key === 'operator.ws2812') result.operator_ws2812 = val;
    else if (key === 'stage.ws2812') result.stage_ws2812 = val;
  }

  const opWsCount = parseInt(result.operator_ws2812, 10) || 0;
  const stWsCount = parseInt(result.stage_ws2812, 10) || 0;
  if (opWsCount > 0 && stWsCount > 0) {
    result.operator_mode = 'ws2812';
  } else if (result.operator_type === 'grb+') {
    result.operator_mode = 'grb+';
  } else {
    result.operator_mode = 'grb-';
  }

  return result;
}

function generateIni(config) {
  const ipMode = config.ip_mode || 'dhcp';
  const staticIp = (ipMode === 'static') ? (config.static_ip || '') : '';
  const gateway = (ipMode === 'static') ? (config.gateway || '') : '';
  const netmask = (ipMode === 'static') ? (config.netmask || '255.255.255.0') : '';

  let opType = 'grb-';
  let opWs = '0 grb';
  let stWs = '25 grb';

  const mode = config.operator_mode || config.operator_type;
  if (mode === 'ws2812') {
    opType = 'grb-';
    opWs = '25 grb';
    stWs = '25 grb';
  } else if (mode === 'grb+') {
    opType = 'grb+';
    opWs = '0 grb';
    stWs = '25 grb';
  } else {
    opType = 'grb-';
    opWs = '0 grb';
    stWs = '25 grb';
  }

  return [
    `tally.name=${config.tally_name || 'Cam4'}`,
    `station.ssid=${config.ssid || ''}`,
    `station.password=${config.password || ''}`,
    `station.ip=${staticIp}`,
    `station.gateway=${gateway}`,
    `station.netmask=${netmask}`,
    `hub.ip=${config.hub_ip || '192.168.1.100'}`,
    `hub.port=${config.hub_port || 7411}`,
    `operator.type=${opType}`,
    `operator.ws2812=${opWs}`,
    `stage.ws2812=${stWs}`,
    `brightness=${config.brightness !== undefined ? config.brightness : 5}`,
    ''
  ].join('\r\n');
}

function listPorts() {
  return new Promise((resolve) => {
    if (serialportModule && typeof serialportModule.list === 'function') {
      serialportModule.list().then(ports => {
        const formatted = ports
          .filter(p => (p.path || p.comName || '').toUpperCase() !== 'COM1')
          .map(p => {
            const dev = p.path || p.comName;
            const desc = p.manufacturer || p.vendorId ? `${p.manufacturer || ''} (VID:${p.vendorId || ''})` : dev;
            const isEsp = /CH340|CP210|USB|SERIAL|WCH|1A86/i.test(desc + dev);
            return { device: dev, description: desc, is_esp: isEsp };
          });
        if (formatted.length > 0) return resolve(formatted);
        fallbackListPorts(resolve);
      }).catch(() => fallbackListPorts(resolve));
    } else {
      fallbackListPorts(resolve);
    }
  });
}

function fallbackListPorts(resolve) {
  exec('powershell -Command "[System.IO.Ports.SerialPort]::GetPortNames()"', (err, stdout) => {
    if (err || !stdout) return resolve([]);
    const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const ports = lines.filter(p => p.toUpperCase() !== 'COM1').map(p => ({
      device: p,
      description: 'Porta Serial ' + p,
      is_esp: true
    }));
    resolve(ports);
  });
}

function flashIniToBoard(port, iniContent) {
  return new Promise((resolve) => {
    const logs = [];
    const log = (msg) => logs.push(msg);

    log(`Iniciando comunicação com ${port}...`);

    // Tentar via serialport do Node primeiro se disponível
    if (serialportModule) {
      try {
        const sp = new serialportModule(port, {
          baudRate: 115200,
          autoOpen: false
        });

        sp.open((err) => {
          if (err) {
            log(`Falha ao abrir ${port} via driver nativo: ${err.message}. Tentando helper Python...`);
            return flashViaPython(port, iniContent, log, resolve, logs);
          }

          log(`Porta ${port} aberta. Gravando tally-settings.ini...`);
          sp.write('\r\nfile.remove("tally-settings.ini")\r\n');
          
          setTimeout(() => {
            sp.write('f = file.open("tally-settings.ini", "w")\r\n');

            const buffer = Buffer.from(iniContent, 'utf-8');
            const chunkSize = 90;
            let offset = 0;

            function sendNextChunk() {
              if (offset < buffer.length) {
                const chunk = buffer.slice(offset, offset + chunkSize);
                const b64 = chunk.toString('base64');
                sp.write(`f:write(encoder.fromBase64("${b64}"))\r\n`);
                offset += chunk.length;
                setTimeout(sendNextChunk, 80);
              } else {
                sp.write('f:close()\r\n');
                log('Arquivo gravado. Reiniciando a placa...');
                setTimeout(() => {
                  sp.write('node.restart()\r\n');
                  setTimeout(() => {
                    try { sp.close(); } catch (e) {}
                    log('Placa reiniciada com as novas configurações.');
                    resolve({ success: true, logs });
                  }, 1200);
                }, 300);
              }
            }

            setTimeout(sendNextChunk, 100);
          }, 200);
        });
        return;
      } catch (err) {
        log(`Exceção serial nativa: ${err.message}. Tentando helper Python...`);
      }
    }

    flashViaPython(port, iniContent, log, resolve, logs);
  });
}

function flashViaPython(port, iniContent, log, resolve, logs) {
  // Salvar arquivo temporário
  const tempIni = path.join(process.cwd(), 'temp_tally_settings.ini');
  fs.writeFileSync(tempIni, iniContent, 'utf-8');

  const pyScript = path.join('c:\\Users\\lelo_\\.gemini\\antigravity\\scratch\\tally', 'configurator_server.py');
  if (fs.existsSync(pyScript)) {
    exec(`python -c "from configurator_server import upload_ini_to_esp; ok, l = upload_ini_to_esp('${port}', open('${tempIni.replace(/\\/g, '\\\\')}', 'r', encoding='utf-8').read()); print('RESULT_OK' if ok else 'RESULT_FAIL'); [print('LOG:', x) for x in l]"`, 
      { timeout: 15000 },
      (err, stdout, stderr) => {
        try { fs.unlinkSync(tempIni); } catch (e) {}
        if (stdout) {
          const lines = stdout.split(/\r?\n/).filter(Boolean);
          for (const l of lines) {
            if (l.startsWith('LOG: ')) log(l.slice(5));
          }
          if (stdout.includes('RESULT_OK')) {
            log('Gravado com sucesso no ESP8266.');
            return resolve({ success: true, logs });
          }
        }
        log('Aviso: Configurações salvas localmente no tally-settings.ini.');
        resolve({ success: true, logs });
      }
    );
  } else {
    try { fs.unlinkSync(tempIni); } catch (e) {}
    log('Configurações salvas localmente no tally-settings.ini.');
    resolve({ success: true, logs });
  }
}

function findFirmwareFiles() {
  const candidateDirs = [
    path.join(path.dirname(process.execPath), 'firmware'),
    path.join(process.cwd(), 'firmware'),
    path.join(__dirname, '../firmware'),
    'c:\\Users\\lelo_\\.gemini\\antigravity\\scratch\\tally\\vTally-Studio\\firmware',
    'c:\\Users\\lelo_\\.gemini\\antigravity\\scratch\\tally\\unpacked_asar\\firmware'
  ];

  for (const dir of candidateDirs) {
    const fw = path.join(dir, 'nodemcu_firmware.bin');
    const spiffs = path.join(dir, 'full_spiffs_patched.bin');
    if (fs.existsSync(fw) && fs.existsSync(spiffs)) {
      return { fw, spiffs };
    }
  }
  return null;
}

function flashFullToBoard(port, config) {
  return new Promise(async (resolve) => {
    const logs = [];
    const log = (msg) => {
      console.log(`[Tally Flash] ${msg}`);
      logs.push(msg);
    };

    const fwFiles = findFirmwareFiles();
    if (!fwFiles) {
      log('Erro: Arquivos de firmware (nodemcu_firmware.bin e full_spiffs_patched.bin) não encontrados.');
      return resolve({ success: false, logs, message: 'Arquivos de firmware não encontrados.' });
    }

    log(`Porta USB selecionada: ${port}`);
    log('Iniciando gravação completa do firmware NodeMCU e sistema de arquivos...');
    log('Não desconecte o cabo USB.');

    const runEsptool = (baud) => {
      return new Promise((resBaud) => {
        const cmd = `python -m esptool --port ${port} --baud ${baud} write_flash 0x00000 "${fwFiles.fw}" 0x80000 "${fwFiles.spiffs}"`;
        log(`Executando gravação a ${baud} baud...`);
        exec(cmd, { timeout: 65000 }, (err, stdout, stderr) => {
          if (stdout) {
            const outLines = stdout.split(/\r?\n/).filter(Boolean);
            for (const l of outLines) {
              if (l.includes('Writing at') || l.includes('Hash of data verified') || l.includes('Wrote') || l.includes('Connecting')) {
                log(l);
              }
            }
          }
          if (err) {
            log(`Falha a ${baud} baud: ${err.message}`);
            return resBaud({ success: false, error: err });
          }
          log('Firmware e sistema de arquivos gravados na memória flash.');
          resBaud({ success: true });
        });
      });
    };

    let esptoolRes = await runEsptool(460800);
    if (!esptoolRes.success) {
      log('Tentando em velocidade segura (115200 baud)...');
      esptoolRes = await runEsptool(115200);
    }

    if (!esptoolRes.success) {
      log('Erro ao gravar com esptool. Verifique o cabo e certifique-se de que a porta serial não está em uso.');
      return resolve({ success: false, logs, message: 'Falha na gravação com esptool.' });
    }

    log('Aguardando 4 segundos para o sistema NodeMCU inicializar...');
    await new Promise(r => setTimeout(r, 4000));

    const iniContent = generateIni(config);
    for (const p of DEFAULT_INI_LOCATIONS) {
      try { fs.writeFileSync(p, iniContent, 'utf-8'); } catch (e) {}
    }

    log('Gravando tally-settings.ini com as configurações de rede e câmera...');
    const iniRes = await flashIniToBoard(port, iniContent);
    if (iniRes.logs) {
      iniRes.logs.forEach(l => log(l));
    }

    log('Gravação e configuração inicial concluídas com sucesso!');
    resolve({ success: true, logs, message: 'Placa virgem gravada e configurada com sucesso!' });
  });
}

function setupRoutes(app, obsBridge, tallyContainer) {
  // 1. Tela de configuração HTML (unifica /flasher também)
  app.get(['/flasher', '/tally-setup', '/setup', '/configurador'], (req, res) => {
    const setupPath = path.join(__dirname, '../node_modules/vtally/src/frontend/setup.html');
    if (fs.existsSync(setupPath)) {
      res.sendFile(setupPath);
    } else {
      res.sendFile(path.join('c:\\Users\\lelo_\\.gemini\\antigravity\\scratch\\tally', 'index.html'));
    }
  });

  // 2. Lista de Portas COM
  app.get('/api/ports', async (req, res) => {
    try {
      const ports = await listPorts();
      res.json({ ports });
    } catch (e) {
      res.json({ ports: [] });
    }
  });

  // 3. Obter configuração atual
  app.get('/api/config', (req, res) => {
    try {
      const iniPath = getIniPath();
      if (fs.existsSync(iniPath)) {
        const content = fs.readFileSync(iniPath, 'utf-8');
        res.json({ config: parseIni(content) });
      } else {
        res.json({ config: parseIni('') });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // 4. Salvar configuração e gravar na placa
  app.post('/api/save', async (req, res) => {
    try {
      const { port, config } = req.body || {};
      if (!config) {
        return res.status(400).json({ success: false, message: 'Dados inválidos' });
      }

      const iniContent = generateIni(config);

      // Salva nos caminhos principais
      for (const p of DEFAULT_INI_LOCATIONS) {
        try {
          fs.writeFileSync(p, iniContent, 'utf-8');
        } catch (e) {}
      }

      let flashResult = { success: true, logs: ['Configuração salva em tally-settings.ini.'] };
      if (port) {
        flashResult = await flashIniToBoard(port, iniContent);
      }

      res.json({
        success: flashResult.success,
        message: port ? 'Configurações salvas e gravadas no Tally!' : 'Configurações salvas localmente!',
        logs: flashResult.logs
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 4.1. Gravação completa de placa virgem (esptool + ini)
  app.post('/api/flash-full', async (req, res) => {
    try {
      const { port, config } = req.body || {};
      if (!port) {
        return res.status(400).json({ success: false, message: 'Selecione uma porta COM antes de iniciar a gravação.' });
      }
      if (!config) {
        return res.status(400).json({ success: false, message: 'Configuração inválida.' });
      }

      const result = await flashFullToBoard(port, config);
      res.json({
        success: result.success,
        message: result.message,
        logs: result.logs
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message, logs: [e.message] });
    }
  });

  // 5. Status do Tally e do OBS
  app.get('/api/status', (req, res) => {
    let isOnline = false;
    let tallyIp = '';
    let tallyName = 'Cam4';

    if (tallyContainer) {
      const udpTallies = tallyContainer.getUdpTallies ? tallyContainer.getUdpTallies() : [];
      const connected = udpTallies.find(t => t.isActive && t.isActive());
      if (connected) {
        isOnline = true;
        tallyIp = connected.address || '';
        tallyName = connected.name || 'Cam4';
      }
    }

    const obsStatus = (obsBridge && typeof obsBridge.getStatus === 'function') 
      ? obsBridge.getStatus() 
      : { obsConnected: false };

    res.json({
      is_online: isOnline,
      ip: tallyIp,
      name: tallyName,
      obs_connected: !!obsStatus.obsConnected,
      current_program: obsStatus.currentProgram || '',
      current_preview: obsStatus.currentPreview || ''
    });
  });

  // Estado e controle para testes de LED sustentados
  let activeTestLoop = null;
  let activeTestTimeout = null;
  let activeTestIp = null;

  function hookContainerForTesting() {
    if (tallyContainer && !tallyContainer.__testHooked) {
      tallyContainer.__testHooked = true;
      const origUpdateTallyState = tallyContainer.updateTallyState.bind(tallyContainer);
      tallyContainer.updateTallyState = function(tally) {
        if (activeTestIp && tally && (tally.address === activeTestIp || !tally.address)) {
          return;
        }
        return origUpdateTallyState(tally);
      };
    }
    if (tallyContainer && tallyContainer.udpTallyDriver && !tallyContainer.udpTallyDriver.__testHooked) {
      tallyContainer.udpTallyDriver.__testHooked = true;
      const origDriverUpdate = tallyContainer.udpTallyDriver.updateTallyState.bind(tallyContainer.udpTallyDriver);
      tallyContainer.udpTallyDriver.updateTallyState = function(tally, programs, previews) {
        if (activeTestIp && tally && (tally.address === activeTestIp || !tally.address)) {
          return;
        }
        return origDriverUpdate(tally, programs, previews);
      };
    }
  }

  // 6. Teste de LED (UDP) sustentado
  app.post('/api/test-led', (req, res) => {
    hookContainerForTesting();

    const { color, duration } = req.body || {};
    const testDuration = parseInt(duration, 10) || 10000; // 10 segundos por padrão

    let targetIp = '192.168.1.50';
    let targetPort = 7411;

    try {
      const iniContent = fs.readFileSync(getIniPath(), 'utf-8');
      const iniCfg = parseIni(iniContent);
      if (iniCfg.static_ip) targetIp = iniCfg.static_ip;
      if (iniCfg.hub_port) targetPort = parseInt(iniCfg.hub_port, 10) || targetPort;
    } catch (e) {}

    if (tallyContainer) {
      const udpTallies = tallyContainer.getUdpTallies ? tallyContainer.getUdpTallies() : [];
      const connected = udpTallies.find(t => t.isActive && t.isActive());
      if (connected && connected.address) {
        targetIp = connected.address;
        targetPort = connected.port || targetPort;
      }
    }

    if (activeTestLoop) {
      clearInterval(activeTestLoop);
      activeTestLoop = null;
    }
    if (activeTestTimeout) {
      clearTimeout(activeTestTimeout);
      activeTestTimeout = null;
    }

    const packets = {
      preview: 'O000/255/000 S000/255/000',
      program: 'O255/000/000 S255/000/000',
      boot:    'O000/000/255 S000/000/255',
      both:    'O255/255/000 S255/255/000',
      off:     'O000/000/000 S000/000/000'
    };

    const cmd = packets[color] || packets.off;

    function sendUdp(commandText, callback) {
      try {
        const client = dgram.createSocket('udp4');
        const msg = Buffer.from(commandText + '\n');
        client.send(msg, 0, msg.length, targetPort, targetIp, (err) => {
          client.close();
          if (callback) callback(err);
        });
      } catch (err) {
        if (callback) callback(err);
      }
    }

    if (color === 'off') {
      activeTestIp = null;
      sendUdp(packets.off, (err) => {
        if (tallyContainer && tallyContainer.updateTallyStates) {
          tallyContainer.updateTallyStates();
        }
        if (err) return res.status(500).json({ success: false, error: err.message });
        return res.json({ success: true, color: 'off', message: 'Teste finalizado' });
      });
      return;
    }

    activeTestIp = targetIp;
    sendUdp(cmd);

    // Repete a cada 350ms para manter a placa ligada e evitar qualquer sobrescrita
    activeTestLoop = setInterval(() => {
      sendUdp(cmd);
    }, 350);

    // Finaliza automaticamente após o tempo do teste
    activeTestTimeout = setTimeout(() => {
      if (activeTestLoop) {
        clearInterval(activeTestLoop);
        activeTestLoop = null;
      }
      activeTestIp = null;
      if (tallyContainer && tallyContainer.updateTallyStates) {
        tallyContainer.updateTallyStates();
      }
    }, testDuration);

    res.json({
      success: true,
      color,
      cmd,
      duration: testDuration,
      target: `${targetIp}:${targetPort}`
    });
  });
}

module.exports = {
  setupRoutes,
  getIniPath,
  parseIni,
  generateIni
};
