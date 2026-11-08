/**
 * @file ESP8266_WiFi_Radar_Server.ino
 * @author Gemini
 * @brief Wi-Fi-connected dual sonar radar with instant WebSocket data stream
 * @version 2.2
 * @date 2025-10-15
 *
 * Changes:
 * - Non-blocking servo sweep (no first-scan delay)
 * - Faster ultrasonic reads
 * - Immediate READY broadcast after Wi-Fi connection
 * - Continuous WebSocket servicing
 */

#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <Servo.h>

// --- WIFI CREDENTIALS ---
const char* ssid = "vivo 1921";
const char* password = "hipeople";

// --- STATIC IP CONFIGURATION ---
IPAddress local_IP(192, 168, 43, 137);
IPAddress gateway(192, 168, 43, 1);
IPAddress subnet(255, 255, 255, 0);

// --- WEBSOCKET SERVER ---
WebSocketsServer webSocket = WebSocketsServer(81);

// --- PIN DEFINITIONS ---
const int SERVO_PIN = 2;
const int TRIG_PIN_1 = 5;
const int ECHO_PIN_1 = 4;
const int TRIG_PIN_2 = 14;
const int ECHO_PIN_2 = 12;

// --- SCAN PARAMETERS ---
const int ANGLE_STEP = 1;           // 1° resolution
const int SCAN_INTERVAL = 20;       // Time (ms) between scans (≈50Hz)
const int MIN_PULSE_WIDTH = 500;
const int MAX_PULSE_WIDTH = 2500;
const int PULSE_TIMEOUT = 10000;    // Shorter timeout for faster response

Servo radarServo;

// --- FUNCTION DECLARATIONS ---
long getDistance(int trigPin, int echoPin);
void scanAndBroadcast(int angle);
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length);

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== ESP8266 Dual Sonar Radar ===");

  // Configure static IP
  if (!WiFi.config(local_IP, gateway, subnet)) {
    Serial.println("Failed to configure static IP!");
  }

  // Connect to Wi-Fi
  Serial.printf("Connecting to %s", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket server started on port 81.");

  // Setup hardware
  pinMode(TRIG_PIN_1, OUTPUT);
  pinMode(ECHO_PIN_1, INPUT);
  pinMode(TRIG_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);

  radarServo.attach(SERVO_PIN, MIN_PULSE_WIDTH, MAX_PULSE_WIDTH);
  radarServo.write(0);
  delay(200);  // Servo warm-up

  // Send initial ready message
  webSocket.broadcastTXT("READY");
  Serial.println("System READY, waiting for clients...");
}

void loop() {
  webSocket.loop(); // Keep WebSocket responsive

  static unsigned long lastScanTime = 0;
  static int angle = 0;
  static int direction = 1; // 1 = forward, -1 = backward

  // Perform one scan step at regular intervals
  if (millis() - lastScanTime >= SCAN_INTERVAL) {
    lastScanTime = millis();

    scanAndBroadcast(angle);

    angle += direction * ANGLE_STEP;
    if (angle >= 180 || angle <= 0) direction *= -1;
  }
}

// --- Send servo angle + both sonar distances to all clients ---
void scanAndBroadcast(int angle) {
  radarServo.write(angle);
  delayMicroseconds(500); // Allow servo to settle slightly

  long distance1 = getDistance(TRIG_PIN_1, ECHO_PIN_1);
  long distance2 = getDistance(TRIG_PIN_2, ECHO_PIN_2);

  String dataString = String(angle) + "," + String(distance1) + "," + String(distance2);
  webSocket.broadcastTXT(dataString);
}

// --- Ultrasonic distance measurement ---
long getDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, PULSE_TIMEOUT);
  long distance = (duration * 0.0343) / 2; // cm
  return distance;
}

// --- WebSocket event handler ---
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;

    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Connected from %d.%d.%d.%d\n",
                    num, ip[0], ip[1], ip[2], ip[3]);
      webSocket.sendTXT(num, "CONNECTED");
      break;
    }

    case WStype_TEXT:
      Serial.printf("[%u] Text: %s\n", num, payload);
      break;
  }
}
