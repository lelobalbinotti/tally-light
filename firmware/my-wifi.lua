local isConnected = false

_G.MyWifi = {
    connect = function()
        MyLed.waitForWifiConnection()
        MyLog.info("Connect to WiFi " .. MySettings:staSsid())
        wifi.setmode(wifi.STATION)
        wifi.sleeptype(wifi.NONE_SLEEP)
        local cfg = {
            ssid = MySettings:staSsid(),
            pwd = MySettings:staPw(),
            auto = true,
            save = true,
        }
        if MySettings.staIp and MySettings:staIp() and MySettings:staIp() ~= "" then
            local gw = (MySettings.staGateway and MySettings:staGateway()) or "192.168.3.1"
            local nm = (MySettings.staNetmask and MySettings:staNetmask()) or "255.255.255.0"
            wifi.sta.setip({ip = MySettings:staIp(), netmask = nm, gateway = gw})
        end
        wifi.sta.config(cfg)
        wifi.sta.sethostname(MySettings:hostName())
        wifi.sta.connect()
    end,
    disconnect = function()
        wifi.sta.disconnect()
    end,
    isConnected = function()
        return isConnected
    end,
    getIp = function()
        return wifi.sta.getip()
    end,
    getMac = function()
        return wifi.sta.getmac()
    end,
}

wifi.setmaxtxpower(82)
wifi.sleeptype(wifi.NONE_SLEEP)

wifi.eventmon.register(wifi.eventmon.STA_CONNECTED, function(T)
    isConnected = false
    MyLog.info("Connected to " .. T.SSID .. ". Waiting for IP.")
    MyLed.waitForWifiIp()
end)

wifi.eventmon.register(wifi.eventmon.STA_DISCONNECTED, function(T)
    isConnected = false
    local humanReadable = T.reason
    for key, val in pairs(wifi.eventmon.reason) do
        if val == T.reason then
            humanReadable = key
            break
        end
    end
    MyLog.error("Got disconnected from " ..T.SSID .. ". Reason " .. humanReadable)
    MyLed.waitForWifiConnection()
    local delay = 2000
    if T.reason == wifi.eventmon.reason.AUTH_EXPIRE then delay = 500 end
    tmr.create():alarm(delay, tmr.ALARM_SINGLE, MyWifi.connect)
end)

wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, function(T)
    MyLog.info("Got IP " .. T.IP)
    isConnected = true
    MyLed.waitForServerConnection()
    MyTally:connect()
end)

wifi.eventmon.register(wifi.eventmon.STA_DHCP_TIMEOUT, function()
    if MySettings.staIp and MySettings:staIp() and MySettings:staIp() ~= "" then
        return
    end
    isConnected = false
    MyLog.error("DHCP timeout")
    MyLed.waitForWifiConnection()
    MyWifi.disconnect()
    tmr.create():alarm(500, tmr.ALARM_SINGLE, MyWifi.connect)
end)
