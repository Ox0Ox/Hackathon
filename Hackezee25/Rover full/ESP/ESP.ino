/**
 * @file EcoBot_ESP8266_Gateway.ino
 * @author Gemini
 * @brief Main controller for EcoBot. Serves web UI, manages WebSockets,
 * controls sonar, and communicates with Arduino Mega for sensors/motors.
 * @version 2.0
 * @date 2025-10-15
 */

#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <Servo.h>
#include <ArduinoJson.h>

// --- WIFI CREDENTIALS ---
const char* ssid = "vivo 1921";
const char* password = "hipeople";

// --- STATIC IP CONFIGURATION ---
IPAddress local_IP(192, 168, 43, 137);
IPAddress gateway(192, 168, 43, 1);
IPAddress subnet(255, 255, 255, 0);

// --- SERVERS ---
WiFiServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

// --- PIN DEFINITIONS ---
const int SERVO_PIN = 2;
const int TRIG_PIN_1 = 5;
const int ECHO_PIN_1 = 4;
const int TRIG_PIN_2 = 14;
const int ECHO_PIN_2 = 12;

// --- SCAN PARAMETERS ---
const int SCAN_INTERVAL = 25;
const int PULSE_TIMEOUT = 10000;
Servo radarServo;

// --- GLOBAL DATA STORE (holds all sensor data) ---
StaticJsonDocument<512> globalData;

// --- FORWARD DECLARATIONS ---
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length);
void handleRoot(WiFiClient client);
extern const char index_html[]; // The HTML content is at the end of this file

void setup() {
  Serial.begin(115200); // For communication with Mega
  delay(100);
  Serial.println();
  
  // Connect to Wi-Fi
  WiFi.config(local_IP, gateway, subnet);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  // Start Servers
  server.begin();
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // Setup hardware
  pinMode(TRIG_PIN_1, OUTPUT);
  pinMode(ECHO_PIN_1, INPUT);
  pinMode(TRIG_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);
  radarServo.attach(SERVO_PIN);
  radarServo.write(0);
}

void loop() {
  webSocket.loop();
  
  // Handle incoming web requests to serve the page
  WiFiClient client = server.available();
  if (client) {
    handleRoot(client);
  }

  // Task 1: Non-blocking sonar scan
  scanSonar();
  
  // Task 2: Check for incoming sensor data from Mega
  readFromMega();

  // Task 3: Broadcast the combined data packet periodically
  broadcastData();
}

void scanSonar() {
  static unsigned long lastScanTime = 0;
  static int angle = 0;
  static int direction = 1;

  if (millis() - lastScanTime >= SCAN_INTERVAL) {
    lastScanTime = millis();
    radarServo.write(angle);
    delayMicroseconds(400); // Allow servo to settle

    // Update global data with sonar info
    globalData["angle"] = angle;
    globalData["dist1"] = getDistance(TRIG_PIN_1, ECHO_PIN_1); // Rear
    globalData["dist2"] = getDistance(TRIG_PIN_2, ECHO_PIN_2); // Front

    angle += direction;
    if (angle >= 180 || angle <= 0) {
      direction *= -1;
    }
  }
}

void readFromMega() {
  if (Serial.available() > 0) {
    String mega_json_str = Serial.readStringUntil('\n');
    StaticJsonDocument<256> mega_doc;
    DeserializationError error = deserializeJson(mega_doc, mega_json_str);
    if (!error) {
      // Copy key-value pairs from Mega's data into our global data store
      globalData["temp"] = mega_doc["temp"];
      globalData["hum"]  = mega_doc["hum"];
      globalData["aq"]   = mega_doc["aq"];
      globalData["alc"]  = mega_doc["alc"];
      globalData["co"]   = mega_doc["co"];
    }
  }
}

void broadcastData() {
  static unsigned long lastBroadcastTime = 0;
  if (millis() - lastBroadcastTime > 50) { // Broadcast at ~20Hz
    lastBroadcastTime = millis();
    String json_output;
    serializeJson(globalData, json_output);
    webSocket.broadcastTXT(json_output);
  }
}

long getDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, PULSE_TIMEOUT);
  return (duration > 0) ? (duration * 0.0343) / 2 : 0;
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      // Handle disconnection
      break;
    case WStype_CONNECTED:
      // Handle connection
      break;
    case WStype_TEXT:
      // Command from web page. Parse it and forward to Mega.
      StaticJsonDocument<256> doc;
      deserializeJson(doc, payload, length);
      serializeJson(doc, Serial); // Forward the JSON command directly
      Serial.println();
      break;
  }
}

// --- Web Server Function to serve the HTML page ---
void handleRoot(WiFiClient client) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("Connection: close");
  client.println();
  client.println(index_html);
  delay(1);
  client.stop();
}

// --- The Entire Web Page is stored here ---
const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcoBot-Crawler Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #1a202c; color: #e2e8f0; overflow: hidden; }
        .card { background-color: #2d3748; border-radius: 0.75rem; border: 1px solid #4a5568; }
        .status-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
        .dot-green { background-color: #48bb78; } .dot-red { background-color: #f56565; }
        #radarCanvas { background-color: #000; border-radius: 50%; display: block; }
        #joystick-container { position: relative; width: 160px; height: 160px; border: 2px solid #718096; border-radius: 50%; background-color: #4a5568; margin: auto; touch-action: none; }
        #joystick-handle { position: absolute; width: 50px; height: 50px; border-radius: 50%; background-color: #a0aec0; cursor: grab; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        #h-slider-container { width: 100%; max-width: 250px; height: 40px; background-color: #4a5568; border: 2px solid #718096; border-radius: 10px; position: relative; touch-action: none; }
        #h-slider-knob { width: 30px; height: 30px; background-color: #a0aec0; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); cursor: ew-resize; }
    </style>
</head>
<body class="p-4 sm:p-6 lg:p-8 flex flex-col h-screen">
    <header class="flex-shrink-0 flex justify-between items-center mb-4">
        <div><h1 class="text-xl sm:text-2xl font-bold text-gray-100">EcoBot-Crawler Control</h1></div>
        <div class="flex items-center space-x-2">
            <span id="system-status-dot" class="status-dot dot-red" title="Disconnected"></span>
            <span id="system-status-text" class="text-gray-300 font-medium">Disconnected</span>
        </div>
    </header>
    <div class="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
        <div class="lg:col-span-3 card p-4 flex flex-col min-h-0">
            <h2 class="font-semibold text-gray-400 mb-2 flex-shrink-0 text-center">DUAL SONAR</h2>
            <div class="relative flex-grow w-full flex items-center justify-center">
                <canvas id="radarCanvas"></canvas>
            </div>
        </div>
        <div class="lg:col-span-2 flex flex-col gap-4 min-h-0">
            <div class="card p-4">
                <h2 class="font-semibold text-gray-400 mb-3">Sensor Readings</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                    <div class="card p-2 bg-gray-900/50"><div class="flex items-center justify-center space-x-1 mb-1"><i data-feather="thermometer" class="w-4 h-4 text-blue-400"></i><span class="font-semibold text-xs text-gray-400">TEMP</span></div><p id="temp-value" class="text-xl font-bold text-gray-100">-- °C</p></div>
                    <div class="card p-2 bg-gray-900/50"><div class="flex items-center justify-center space-x-1 mb-1"><i data-feather="droplet" class="w-4 h-4 text-green-400"></i><span class="font-semibold text-xs text-gray-400">HUMID</span></div><p id="humidity-value" class="text-xl font-bold text-gray-100">-- %</p></div>
                    <div class="card p-2 bg-gray-900/50"><div class="flex items-center justify-center space-x-1 mb-1"><i data-feather="wind" class="w-4 h-4 text-gray-400"></i><span class="font-semibold text-xs text-gray-400">AQI</span></div><p id="aq-value" class="text-xl font-bold text-gray-100">--</p></div>
                    <div class="card p-2 bg-gray-900/50"><div class="flex items-center justify-center space-x-1 mb-1"><i data-feather="alert-triangle" class="w-4 h-4 text-yellow-400"></i><span class="font-semibold text-xs text-gray-400">ALCOHOL</span></div><p id="alc-value" class="text-xl font-bold text-gray-100">--</p></div>
                    <div class="card p-2 bg-gray-900/50 col-span-full"><div class="flex items-center justify-center space-x-1 mb-1"><i data-feather="alert-circle" class="w-4 h-4 text-red-400"></i><span class="font-semibold text-xs text-gray-400">CO GAS</span></div><p id="co-value" class="text-xl font-bold text-gray-100">--</p></div>
                </div>
            </div>
            <div class="card p-4 flex-grow flex flex-col justify-center items-center">
                <h2 class="font-semibold text-gray-400 mb-4 text-center">Rover Controls</h2>
                <div class="flex flex-col items-center justify-center w-full gap-6">
                    <div id="joystick-container"><div id="joystick-handle"></div></div>
                    <div id="h-slider-container"><div id="h-slider-knob"></div></div>
                    <button id="emergency-stop" class="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">EMERGENCY STOP</button>
                </div>
            </div>
        </div>
    </div>
    <script>
        const gateway = `ws://${window.location.hostname}:81/`;
        let websocket; const maxDistance = 200;
        const statusDot = document.getElementById('system-status-dot'); const statusText = document.getElementById('system-status-text');
        const tempValue = document.getElementById('temp-value'); const humidityValue = document.getElementById('humidity-value');
        const aqValue = document.getElementById('aq-value'); const alcValue = document.getElementById('alc-value'); const coValue = document.getElementById('co-value');
        const joystickContainer = document.getElementById('joystick-container'); const joystickHandle = document.getElementById('joystick-handle');
        const hSliderContainer = document.getElementById('h-slider-container'); const hSliderKnob = document.getElementById('h-slider-knob');
        let joystickActive = false; let hSliderActive = false; let joystickCenterX, joystickCenterY, joystickRadius; let sliderWidth;
        window.addEventListener('load', () => { feather.replace(); initWebSocket(); initControls(); resizeCanvas(); draw(); updateControlDimensions(); window.addEventListener('resize', () => { resizeCanvas(); updateControlDimensions(); }); });
        function initWebSocket() { websocket = new WebSocket(gateway); websocket.onopen = () => { statusDot.className = "status-dot dot-green"; statusText.textContent = "Connected"; }; websocket.onclose = () => { statusDot.className = "status-dot dot-red"; statusText.textContent = "Disconnected"; setTimeout(initWebSocket, 2000); }; websocket.onmessage = (event) => { const data = JSON.parse(event.data); updateSensorCards(data); updateRadar(data); }; }
        function updateSensorCards(data) { if (data.temp !== undefined) tempValue.textContent = `${data.temp.toFixed(1)} °C`; if (data.hum !== undefined) humidityValue.textContent = `${data.hum.toFixed(1)} %`; if (data.aq !== undefined) aqValue.textContent = data.aq; if (data.alc !== undefined) alcValue.textContent = data.alc; if (data.co !== undefined) coValue.textContent = data.co; }
        function updateRadar(data) { if (data.angle === undefined) return; currentAngle = data.angle; if (data.dist1 > 0 && data.dist1 < maxDistance) points.push(new RadarPoint(data.angle + 180, data.dist1, 'rgba(100, 150, 255,')); if (data.dist2 > 0 && data.dist2 < maxDistance) points.push(new RadarPoint(data.angle, data.dist2, 'rgba(255, 100, 100,')); }
        function sendCommand(command, data = {}) { if (websocket.readyState !== WebSocket.OPEN) return; const payload = { action: command, ...data }; websocket.send(JSON.stringify(payload)); }
        function initControls() { joystickContainer.addEventListener('mousedown', startJoystickMove); window.addEventListener('mousemove', moveJoystick); window.addEventListener('mouseup', stopJoystickMove); joystickContainer.addEventListener('touchstart', startJoystickMove, { passive: false }); window.addEventListener('touchmove', moveJoystick, { passive: false }); window.addEventListener('touchend', stopJoystickMove); hSliderContainer.addEventListener('mousedown', startHSliderMove); window.addEventListener('mousemove', moveHSlider); window.addEventListener('mouseup', stopHSliderMove); hSliderContainer.addEventListener('touchstart', startHSliderMove, { passive: false }); window.addEventListener('touchmove', moveHSlider, { passive: false }); window.addEventListener('touchend', stopHSliderMove); document.getElementById('emergency-stop').addEventListener('click', () => { sendCommand('stop'); resetControls(); }); }
        function updateControlDimensions() { const rect = joystickContainer.getBoundingClientRect(); joystickCenterX = rect.left + rect.width / 2; joystickCenterY = rect.top + rect.height / 2; joystickRadius = rect.width / 2 - joystickHandle.offsetWidth / 2; sliderWidth = hSliderContainer.clientWidth - hSliderKnob.offsetWidth; resetControls(); }
        function resetControls() { joystickHandle.style.transform = `translate(-50%, -50%) translate(0px, 0px)`; hSliderKnob.style.transform = `translate(-50%, -50%) translateX(0px)`; }
        function startJoystickMove(e) { joystickActive = true; if(e.cancelable) e.preventDefault(); }
        function moveJoystick(e) { if (!joystickActive) return; const clientX = e.clientX || e.touches[0].clientX; const clientY = e.clientY || e.touches[0].clientY; let deltaX = clientX - joystickCenterX; let deltaY = clientY - joystickCenterY; const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), joystickRadius); const angle = Math.atan2(deltaY, deltaX); const clampedX = distance * Math.cos(angle); const clampedY = distance * Math.sin(angle); joystickHandle.style.transform = `translate(-50%, -50%) translate(${clampedX}px, ${clampedY}px)`; let verticalSpeed = -clampedY / joystickRadius; let horizontalSteer = clampedX / joystickRadius; let leftMotor = Math.max(-1, Math.min(1, verticalSpeed + horizontalSteer)); let rightMotor = Math.max(-1, Math.min(1, verticalSpeed - horizontalSteer)); if (Math.abs(leftMotor) > 0.1 || Math.abs(rightMotor) > 0.1) { sendCommand('drive', { left: leftMotor, right: rightMotor }); } else { sendCommand('stop'); } }
        function stopJoystickMove() { if (!joystickActive) return; joystickActive = false; resetControls(); sendCommand('stop'); }
        function startHSliderMove(e) { hSliderActive = true; if(e.cancelable) e.preventDefault(); }
        function moveHSlider(e) { if (!hSliderActive) return; const clientX = e.clientX || e.touches[0].clientX; const sliderRect = hSliderContainer.getBoundingClientRect(); let xPos = clientX - sliderRect.left - hSliderKnob.offsetWidth / 2; xPos = Math.max(0, Math.min(xPos, sliderWidth)); const knobX = xPos - sliderWidth / 2; hSliderKnob.style.transform = `translate(-50%, -50%) translateX(${knobX}px)`; let speed = knobX / (sliderWidth / 2); if (Math.abs(speed) > 0.1) { sendCommand('rotate', { speed: speed }); } else { sendCommand('stop'); } }
        function stopHSliderMove() { if (!hSliderActive) return; hSliderActive = false; resetControls(); sendCommand('stop'); }
        const canvas = document.getElementById('radarCanvas'); const ctx = canvas.getContext('2d'); let currentAngle = 0; let points = [];
        function resizeCanvas() { const container = canvas.parentElement; const size = Math.min(container.clientWidth, container.clientHeight) - 4; if (canvas.width !== size || canvas.height !== size) { canvas.width = size; canvas.height = size; } }
        class RadarPoint { constructor(angle, distance, color) { this.angle = angle; this.distance = distance; this.color = color; this.lifespan = 255; } update() { this.lifespan -= 1.5; } isDead() { return this.lifespan < 0; } }
        function draw() { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height); const centerX = canvas.width / 2; const centerY = canvas.height / 2; const radius = Math.min(centerX, centerY) - 5; drawRadarGrid(centerX, centerY, radius); points = points.filter(p => !p.isDead()); points.forEach(p => { p.update(); const mappedR = (p.distance / maxDistance) * radius; const angleRad = (p.angle - 90) * Math.PI / 180; const pointX = centerX + mappedR * Math.cos(angleRad); const pointY = centerY + mappedR * Math.sin(angleRad); ctx.fillStyle = `${p.color} ${p.lifespan / 255})`; ctx.beginPath(); ctx.arc(pointX, pointY, 2.5, 0, 2 * Math.PI); ctx.fill(); }); drawSweepingLine(centerX, centerY, radius); requestAnimationFrame(draw); }
        function drawRadarGrid(x, y, r) { ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)'; ctx.lineWidth = 0.5; for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(x, y, r * (i / 3), 0, 2 * Math.PI); ctx.stroke(); } for (let i = 0; i < 360; i += 45) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r * Math.cos(i * Math.PI / 180), y + r * Math.sin(i * Math.PI / 180)); ctx.stroke(); } }
        function drawSweepingLine(x, y, r) { const angleRad = (currentAngle - 90) * Math.PI / 180; const oppositeAngleRad = (currentAngle + 180 - 90) * Math.PI / 180; const gradRed = ctx.createLinearGradient(x, y, x + r * Math.cos(angleRad), y + r * Math.sin(angleRad)); gradRed.addColorStop(0, 'rgba(255, 100, 100, 0)'); gradRed.addColorStop(1, 'rgba(255, 100, 100, 0.8)'); ctx.strokeStyle = gradRed; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r * Math.cos(angleRad), y + r * Math.sin(angleRad)); ctx.stroke(); const gradBlue = ctx.createLinearGradient(x, y, x + r * Math.cos(oppositeAngleRad), y + r * Math.sin(oppositeAngleRad)); gradBlue.addColorStop(0, 'rgba(100, 150, 255, 0)'); gradBlue.addColorStop(1, 'rgba(100, 150, 255, 0.7)'); ctx.strokeStyle = gradBlue; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r * Math.cos(oppositeAngleRad), y + r * Math.sin(oppositeAngleRad)); ctx.stroke(); }
    </script>
</body>
</html>
)rawliteral";