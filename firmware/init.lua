-- Inicializacao limpa: apaga todos os LEDs antes de carregar o app para evitar flash branco
ws2812.init(ws2812.MODE_SINGLE)
ws2812.write(string.char(0):rep(75))
dofile("my-app.lc")
