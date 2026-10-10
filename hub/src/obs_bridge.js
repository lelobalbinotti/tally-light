const WebSocket = require('ws');

const OBS_V4_PORT = 4444;

let targetObsIp = '127.0.0.1';
let targetObsPort = 4455;
let targetObsPassword = process.env.OBS_PASSWORD || '';

console.log(`[Bridge Embutida] Iniciando ponte OBS (v5 alvo ws://${targetObsIp}:${targetObsPort}) -> vTally (v4 porta ${OBS_V4_PORT})...`);

let currentProgramScene = "";
let currentPreviewScene = "";
let scenesList = [];
let isStreaming = false;
let isRecording = false;
let isStudioMode = true;
let isObsConnected = false;
let clients = new Set();
let obsWs = null;
let reconnectTimer = null;

// 1. Criar Servidor WebSocket v4 para o vTally Hub
let wss = null;
try {
  wss = new WebSocket.Server({ port: OBS_V4_PORT }, () => {
    console.log(`[Bridge Embutida] Servidor v4 ouvindo em ws://127.0.0.1:${OBS_V4_PORT}`);
  });

  wss.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Bridge Embutida] Porta ${OBS_V4_PORT} já em uso (outra instância ativa).`);
    } else {
      console.error('[Bridge Embutida] Erro no servidor v4:', err.message);
    }
  });

  wss.on('connection', (ws) => {
    if (!isObsConnected) {
      try { ws.terminate(); } catch (e) {}
      return;
    }
    clients.add(ws);
    console.log('[Bridge Embutida] vTally Hub conectou no servidor v4.');

    ws.on('error', () => {});
    ws.on('message', (message) => {
      try {
        const req = JSON.parse(message.toString());
        const msgId = req['message-id'] || '1';
        const reqType = req['request-type'];

        if (reqType === 'GetSceneList') {
          ws.send(JSON.stringify({
            'message-id': msgId,
            status: 'ok',
            'current-scene': currentProgramScene,
            scenes: (scenesList || []).map(s => ({
              name: s.sceneName || s.name || '',
              sources: []
            }))
          }));
        } else if (reqType === 'GetPreviewScene') {
          ws.send(JSON.stringify({
            'message-id': msgId,
            status: 'ok',
            name: currentPreviewScene || currentProgramScene
          }));
        } else if (reqType === 'GetCurrentScene') {
          ws.send(JSON.stringify({
            'message-id': msgId,
            status: 'ok',
            name: currentProgramScene
          }));
        } else if (reqType === 'GetStreamingStatus') {
          ws.send(JSON.stringify({
            'message-id': msgId,
            status: 'ok',
            streaming: isStreaming,
            recording: isRecording
          }));
        } else if (reqType === 'GetStudioModeStatus') {
          ws.send(JSON.stringify({
            'message-id': msgId,
            status: 'ok',
            'studio-mode': isStudioMode
          }));
        } else {
          ws.send(JSON.stringify({ 'message-id': msgId, status: 'ok' }));
        }
      } catch (err) {}
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('[Bridge Embutida] vTally Hub desconectou do servidor v4.');
    });
  });
} catch (err) {
  console.error('[Bridge Embutida] Falha ao iniciar WebSocket v4:', err);
}

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch (e) {}
    }
  }
}

// 2. Conectar ao OBS Studio (v5)
function connectObsV5() {
  if (obsWs) {
    try { obsWs.terminate(); } catch (e) {}
    obsWs = null;
  }

  try {
    console.log(`[Bridge Embutida] Conectando ao OBS Studio v5 em ws://${targetObsIp}:${targetObsPort}...`);
    obsWs = new WebSocket(`ws://${targetObsIp}:${targetObsPort}`);
  } catch (err) {
    scheduleReconnect();
    return;
  }

  obsWs.on('open', () => {
    console.log(`[Bridge Embutida] Conectado ao OBS Studio via WebSocket v5 (ws://${targetObsIp}:${targetObsPort})!`);
    if (reconnectTimer) { clearInterval(reconnectTimer); reconnectTimer = null; }
  });

  obsWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      // Handshake Hello do OBS v5
      if (msg.op === 0) {
        // EventSubscriptions:
        // General(1) + Config(2) + Scenes(4) + Inputs(8) + Transitions(16) +
        // Filters(32) + Outputs(64) + SceneItems(128) + MediaInputs(256) +
        // Vendors(512) + UI(1024) = 2047
        let identifyPayload = {
          rpcVersion: 1,
          eventSubscriptions: 2047
        };

        if (msg.d && msg.d.authentication) {
          try {
            const crypto = require('crypto');
            const salt = msg.d.authentication.salt;
            const challenge = msg.d.authentication.challenge;
            const password = targetObsPassword || process.env.OBS_PASSWORD || '';
            const secret = crypto.createHash('sha256').update(password + salt).digest('base64');
            const auth = crypto.createHash('sha256').update(secret + challenge).digest('base64');
            identifyPayload.authentication = auth;
          } catch (e) {
            console.error('[Bridge Embutida] Erro ao calcular autenticação OBS:', e);
          }
        }

        obsWs.send(JSON.stringify({ op: 1, d: identifyPayload }));
      }
      // Identificado com sucesso no OBS v5
      else if (msg.op === 2) {
        console.log('[Bridge Embutida] Autenticado e ouvindo eventos do OBS Studio 30.');
        isObsConnected = true;
        // Requisita estado inicial completo
        obsWs.send(JSON.stringify({
          op: 6,
          d: { requestType: 'GetSceneList', requestId: 'req_scenes' }
        }));
        obsWs.send(JSON.stringify({
          op: 6,
          d: { requestType: 'GetCurrentProgramScene', requestId: 'req_prog' }
        }));
        obsWs.send(JSON.stringify({
          op: 6,
          d: { requestType: 'GetCurrentPreviewScene', requestId: 'req_prev' }
        }));
        obsWs.send(JSON.stringify({
          op: 6,
          d: { requestType: 'GetStudioModeEnabled', requestId: 'req_studio' }
        }));
        obsWs.send(JSON.stringify({
          op: 6,
          d: { requestType: 'GetStreamStatus', requestId: 'req_stream' }
        }));
        obsWs.send(JSON.stringify({
          op: 6,
          d: { requestType: 'GetRecordStatus', requestId: 'req_record' }
        }));
      }
      // Respostas de Requests
      else if (msg.op === 7) {
        const resp = msg.d;
        if (!resp) return;
        const resData = resp.responseData;

        if (resp.requestId === 'req_scenes' && resData) {
          scenesList = resData.scenes || [];
          if (resData.currentProgramSceneName) {
            currentProgramScene = resData.currentProgramSceneName;
          }
          if (resData.currentPreviewSceneName) {
            currentPreviewScene = resData.currentPreviewSceneName;
          }
          broadcast({
            'update-type': 'SwitchScenes',
            'scene-name': currentProgramScene
          });
          if (currentPreviewScene) {
            broadcast({
              'update-type': 'PreviewSceneChanged',
              'scene-name': currentPreviewScene
            });
          }
        } else if (resp.requestId === 'req_prog' && resData) {
          currentProgramScene = resData.currentProgramSceneName || currentProgramScene;
          broadcast({
            'update-type': 'SwitchScenes',
            'scene-name': currentProgramScene
          });
        } else if (resp.requestId === 'req_prev' && resData) {
          currentPreviewScene = resData.currentPreviewSceneName || currentPreviewScene;
          broadcast({
            'update-type': 'PreviewSceneChanged',
            'scene-name': currentPreviewScene
          });
        } else if (resp.requestId === 'req_studio' && resData) {
          isStudioMode = !!resData.studioModeEnabled;
          broadcast({
            'update-type': 'StudioModeSwitched',
            'new-state': isStudioMode
          });
        } else if (resp.requestId === 'req_stream' && resData) {
          isStreaming = !!resData.outputActive;
          broadcast({
            'update-type': isStreaming ? 'StreamStarting' : 'StreamStopped'
          });
        } else if (resp.requestId === 'req_record' && resData) {
          isRecording = !!resData.outputActive;
          broadcast({
            'update-type': isRecording ? 'RecordingStarting' : 'RecordingStopped'
          });
        }
      }
      // Eventos do OBS em tempo real
      else if (msg.op === 5 && msg.d) {
        const evType = msg.d.eventType;
        const evData = msg.d.eventData || {};

        if (evType === 'CurrentProgramSceneChanged') {
          currentProgramScene = evData.sceneName || '';
          console.log(`[OBS 30 -> vTally] PROGRAMA: "${currentProgramScene}"`);
          broadcast({
            'update-type': 'SwitchScenes',
            'scene-name': currentProgramScene
          });
        } else if (evType === 'CurrentPreviewSceneChanged') {
          currentPreviewScene = evData.sceneName || '';
          console.log(`[OBS 30 -> vTally] PREVIEW: "${currentPreviewScene}"`);
          broadcast({
            'update-type': 'PreviewSceneChanged',
            'scene-name': currentPreviewScene
          });
        } else if (evType === 'SceneTransitionStarted') {
          console.log(`[OBS 30 -> vTally] TRANSIÇÃO INICIADA (${evData.transitionName || ''})`);
          broadcast({
            'update-type': 'TransitionBegin',
            'from-scene': currentProgramScene,
            'to-scene': currentPreviewScene || currentProgramScene
          });
        } else if (evType === 'SceneTransitionEnded') {
          console.log(`[OBS 30 -> vTally] TRANSIÇÃO FINALIZADA -> Programa atual: "${currentProgramScene}"`);
          broadcast({
            'update-type': 'TransitionEnd',
            'to-scene': currentProgramScene
          });
        } else if (evType === 'SceneListChanged') {
          console.log('[OBS 30 -> vTally] Lista de cenas alterada');
          scenesList = evData.scenes || [];
          if (obsWs && obsWs.readyState === WebSocket.OPEN) {
            obsWs.send(JSON.stringify({
              op: 6,
              d: { requestType: 'GetSceneList', requestId: 'req_scenes' }
            }));
          }
          broadcast({ 'update-type': 'ScenesChanged' });
        } else if (evType === 'StudioModeStateChanged') {
          isStudioMode = !!evData.studioModeEnabled;
          broadcast({
            'update-type': 'StudioModeSwitched',
            'new-state': isStudioMode
          });
        } else if (evType === 'StreamStateChanged') {
          isStreaming = !!evData.outputActive;
          broadcast({
            'update-type': isStreaming ? 'StreamStarting' : 'StreamStopped'
          });
        } else if (evType === 'RecordStateChanged') {
          isRecording = !!evData.outputActive;
          broadcast({
            'update-type': isRecording ? 'RecordingStarting' : 'RecordingStopped'
          });
        }
      }
    } catch (e) {
      console.error('[Bridge Embutida] Erro ao processar mensagem OBS:', e);
    }
  });

  const handleObsDisconnect = () => {
    if (isObsConnected) {
      console.log('[Bridge Embutida] Conexão com OBS Studio perdida.');
    }
    isObsConnected = false;
    currentProgramScene = "";
    currentPreviewScene = "";
    scenesList = [];
    isStreaming = false;
    isRecording = false;

    // Desconecta imediatamente os clientes v4 (vTally Hub) para atualizar o estado do mixer
    for (const client of clients) {
      try { client.terminate(); } catch (e) {}
    }
    clients.clear();

    scheduleReconnect();
  };

  obsWs.on('error', (err) => {
    console.error('[Bridge Embutida] Erro no socket OBS v5:', err.message);
    handleObsDisconnect();
  });

  obsWs.on('close', () => {
    handleObsDisconnect();
  });
}

function scheduleReconnect() {
  if (!reconnectTimer) {
    reconnectTimer = setInterval(connectObsV5, 3000);
  }
}

function setTarget(ip, port, password) {
  const newIp = (ip && String(ip).trim()) || '127.0.0.1';
  const newPort = parseInt(port, 10) || 4455;
  const newPassword = password !== undefined ? password : targetObsPassword;

  if (targetObsIp !== newIp || targetObsPort !== newPort || targetObsPassword !== newPassword) {
    console.log(`[Bridge Embutida] Configuração atualizada para ws://${newIp}:${newPort}`);
    targetObsIp = newIp;
    targetObsPort = newPort;
    targetObsPassword = newPassword;
    connectObsV5();
  }
}

connectObsV5();

module.exports = {
  setTarget,
  getTarget: () => ({ ip: targetObsIp, port: targetObsPort }),
  isObsConnected: () => isObsConnected,
  getStatus: () => ({
    obsConnected: isObsConnected,
    currentProgram: currentProgramScene,
    currentPreview: currentPreviewScene,
  })
};
