local pinOpG, pinOpR, pinOpB = 1, 2, 3
local pinOnBoard = 0
local pinMainG, pinMainR, pinMainB = 5, 6, 7

gpio.mode(pinOnBoard, gpio.OUTPUT)
ws2812.init(ws2812.MODE_SINGLE)
ws2812.write(string.char(0):rep(75))

local opInitDuty = (MySettings and MySettings.operatorType and MySettings.operatorType() == LightTypes.COMMON_ANODE) and 100 or 0
local stInitDuty = (MySettings and MySettings.stageType and MySettings.stageType() == LightTypes.COMMON_ANODE) and 100 or 0

local timer = tmr.create()
pwm2.setup_pin_hz(pinOpR, 1000, 100, opInitDuty)
pwm2.setup_pin_hz(pinOpG, 1000, 100, opInitDuty)
pwm2.setup_pin_hz(pinOpB, 1000, 100, opInitDuty)
pwm2.setup_pin_hz(pinMainR, 1000, 100, stInitDuty)
pwm2.setup_pin_hz(pinMainG, 1000, 100, stInitDuty)
pwm2.setup_pin_hz(pinMainB, 1000, 100, stInitDuty)
pwm2.start()

local lastR, lastG, lastB = -1, -1, -1

local showColor = function(operatorR, operatorG, operatorB, stageR, stageG, stageB)
    stageR = stageR or 0
    stageG = stageG or 0
    stageB = stageB or 0

    -- 1. CONTROLE DO LED DO OPERADOR (4 pinos)
    local opR = operatorR
    local opG = operatorG
    local opB = operatorB

    -- Calibracao de cores para LED de 5mm:
    -- O diodo verde tem muito mais lumens que o vermelho; atenuamos no amarelo para nao virar verde-limao
    if opR > 180 and opG > 180 and opB < 60 then
        opG = math.floor(opG * 0.35)
    -- Atenuamos o azul no rosa para ficar rosa puro e nao roxo/violeta
    elseif opR > 180 and opB > 180 and opG < 60 then
        opB = math.floor(opB * 0.40)
    end

    local operatorDutyR = (opR / 255) * 100
    local operatorDutyG = (opG / 255) * 100
    local operatorDutyB = (opB / 255) * 100

    -- Se for sinal de idle (ex: opG=1 enviado pelo Hub para estado ocioso):
    -- garante duty minimo de 3% para que o LED de 4 pinos funcione como luz piloto fraca
    if opG > 0 and operatorDutyG < 3 then operatorDutyG = 3 end
    if opR > 0 and operatorDutyR < 3 then operatorDutyR = 3 end
    if opB > 0 and operatorDutyB < 3 then operatorDutyB = 3 end

    if MySettings.operatorType() == LightTypes.COMMON_ANODE then
        operatorDutyR = 100 - operatorDutyR
        operatorDutyG = 100 - operatorDutyG
        operatorDutyB = 100 - operatorDutyB
    end
    pwm2.set_duty(pinOpR, operatorDutyR)
    pwm2.set_duty(pinOpG, operatorDutyG)
    pwm2.set_duty(pinOpB, operatorDutyB)

    -- 2. CONTROLE DO PALCO (PWM se houver)
    local stageDutyR = (stageR / 255) * 100
    local stageDutyG = (stageG / 255) * 100
    local stageDutyB = (stageB / 255) * 100

    if MySettings.stageType() == LightTypes.COMMON_ANODE then
        stageDutyR = 100 - stageDutyR
        stageDutyG = 100 - stageDutyG
        stageDutyB = 100 - stageDutyB
    end
    pwm2.set_duty(pinMainR, stageDutyR)
    pwm2.set_duty(pinMainG, stageDutyG)
    pwm2.set_duty(pinMainB, stageDutyB)

    -- 3. CONTROLE DA MATRIZ WS2812 (Stage / Palco)
    local matR, matG, matB
    if (operatorB > 0 and operatorR == 0 and operatorG == 0 and stageR == 0 and stageG == 0 and stageB == 0) then
        -- Modo Boot / Conexao Wi-Fi (azul): usa o azul para os 9 LEDs do centro
        matR, matG, matB = 0, 0, operatorB
    else
        -- Modo Operacional Normal: a matriz obedece estritamente ao comando de Stage do Hub!
        -- Quando 'Exibir Estado de Preview' estiver desmarcado, o Hub envia Stage=0/0/0 e a matriz APAGA completamente.
        -- Quando estiver marcado, o Hub envia a cor de preview configurada.
        matR, matG, matB = stageR, stageG, stageB
    end

    -- Brilho maximo da matriz WS2812 (limita consumo)
    local maxPct = 0.25
    if MySettings.ws2812Brightness ~= nil then
        local b = MySettings.ws2812Brightness()
        if b and b > 0 and b <= 100 then
            maxPct = b / 100
        end
    end

    local sR = math.floor(matR * maxPct)
    local sG = math.floor(matG * maxPct)
    local sB = math.floor(matB * maxPct)

    if sR ~= lastR or sG ~= lastG or sB ~= lastB then
        lastR, lastG, lastB = sR, sG, sB
        local isGRB = (MySettings.stageWs2812Type() ~= Ws2812Types.RGB)
        local l = isGRB and string.char(sG, sR, sB) or string.char(sR, sG, sB)
        local d = string.char(0, 0, 0)

        local m25
        if sB > 0 and sR == 0 and sG == 0 then
            -- Boot / Inicializacao (azul): 9 LEDs do centro
            m25 = d:rep(6) .. l:rep(3) .. d:rep(2) .. l:rep(3) .. d:rep(2) .. l:rep(3) .. d:rep(6)
        else
            -- Tally ativo (vermelho, verde, amarelo, rosa, etc): 16 LEDs da borda externa
            m25 = l:rep(6) .. d:rep(3) .. l:rep(2) .. d:rep(3) .. l:rep(2) .. d:rep(3) .. l:rep(6)
        end

        local totalLeds = (MySettings.operatorNumberOfWs2812Lights() or 0) + (MySettings.stageNumberOfWs2812Lights() or 0)
        if totalLeds > 25 then
            ws2812.write(m25 .. m25)
        else
            ws2812.write(m25)
        end
    end

    if (operatorR == 0 and operatorG == 0 and operatorB < 255) or (operatorR == operatorG and operatorG == operatorB and operatorB < 255) then
        gpio.write(pinOnBoard, gpio.HIGH)
    else
        gpio.write(pinOnBoard, gpio.LOW)
    end
end

local currentFlashHash = nil

local showFlashPattern = function(operatorR, operatorG, operatorB, stageR, stageG, stageB, pattern, stepDuration)
    local patternHash = ""
    for _, step in pairs(pattern) do
        patternHash = patternHash .. (step and "1" or "0")
    end
    local flashHash = string.format("%d/%d/%d-%s-%d", operatorR, operatorG, operatorB, patternHash, stepDuration)
    if flashHash == currentFlashHash then return end
    currentFlashHash = flashHash

    local currentIdx = 1
    local maxIdx = #pattern
    local next = function()
        lastR, lastG, lastB = -1, -1, -1
        local isBright = pattern[currentIdx]
        if isBright then
            showColor(operatorR, operatorG, operatorB, stageR, stageG, stageB)
        else
            showColor(
                math.ceil(operatorR * 0.3), math.ceil(operatorG * 0.3), math.ceil(operatorB * 0.3),
                math.ceil((stageR or 0) * 0.3), math.ceil((stageG or 0) * 0.3), math.ceil((stageB or 0) * 0.3)
            )
        end
        currentIdx = currentIdx + 1
        if currentIdx > maxIdx then currentIdx = 1 end
    end
    timer:unregister()
    next()
    timer:alarm(stepDuration, tmr.ALARM_AUTO, next)
end

local showStaticColor = function(operatorR, operatorG, operatorB, stageR, stageG, stageB)
    timer:unregister()
    currentFlashHash = nil
    showColor(operatorR, operatorG, operatorB, stageR, stageG, stageB)
end

local bright = true
local dim = false

_G.MyLed = {
    initial = function()
        showStaticColor(0, 0, 255, 0, 0, 0)
    end,
    waitForWifiConnection = function()
        showFlashPattern(0, 0, 255, 0, 0, 0, {bright, dim}, 500)
    end,
    invalidSettingsFile = function()
        showFlashPattern(0, 0, 255, 0, 0, 0, {bright, dim, bright, dim, bright, dim, dim, dim, dim, dim, dim, dim}, 150)
    end,
    waitForWifiIp = function()
        showFlashPattern(0, 0, 255, 0, 0, 0, {bright, dim, bright, dim}, 250)
    end,
    waitForServerConnection = function()
        showFlashPattern(0, 0, 255, 0, 0, 0, {bright, dim, bright, dim, dim, dim}, 150)
    end,
    static = showStaticColor,
    flash = showFlashPattern,
}
