/**
 * @file EcoBot_Mega_Controller.ino
 * @author Gemini
 * @brief Controls motors and sensors, managed by an ESP8266 via Serial.
 * @version 2.0
 * @date 2025-10-15
 */

#include <DHT.h>
#include <ArduinoJson.h>

// --- Pin Definitions for Sensors ---
#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

const int mq135Pin = A0; // Air Quality
const int mq3Pin   = A1; // Alcohol
const int mq7Pin   = A2; // Carbon Monoxide (CO)

// --- Pin Definitions for Driver 1 (BACK MOTORS) ---
const int enA_back = 5;  // Speed Back-Left
const int in1_back = 22;
const int in2_back = 23;
const int enB_back = 6;  // Speed Back-Right
const int in3_back = 24;
const int in4_back = 25;

// --- Pin Definitions for Driver 2 (FRONT MOTORS) ---
const int enA_front = 7;  // Speed Front-Left
const int in1_front = 26;
const int in2_front = 27;
const int enB_front = 8;  // Speed Front-Right
const int in3_front = 28;
const int in4_front = 29;

// --- Communication Timing ---
unsigned long lastSendTime = 0;
const long sendInterval = 1000; // Send sensor data every 1 second

void setup() {
  // Start Serial for USB debugging
  Serial.begin(115200);
  Serial.println("Mega Controller Initializing...");

  // Start Serial1 for communication with ESP8266
  Serial1.begin(115200);

  // Initialize Sensors
  dht.begin();
  pinMode(mq135Pin, INPUT);
  pinMode(mq3Pin, INPUT);
  pinMode(mq7Pin, INPUT);

  // Initialize all 12 Motor Pins as Outputs
  pinMode(enA_back, OUTPUT); pinMode(in1_back, OUTPUT); pinMode(in2_back, OUTPUT);
  pinMode(enB_back, OUTPUT); pinMode(in3_back, OUTPUT); pinMode(in4_back, OUTPUT);
  pinMode(enA_front, OUTPUT); pinMode(in1_front, OUTPUT); pinMode(in2_front, OUTPUT);
  pinMode(enB_front, OUTPUT); pinMode(in3_front, OUTPUT); pinMode(in4_front, OUTPUT);
  
  stopMotors(); // Ensure motors are off at start
  Serial.println("Mega Controller Ready. Listening for commands.");
}

void loop() {
  // Task 1: Check for and process incoming commands from ESP8266
  if (Serial1.available() > 0) {
    String command_str = Serial1.readStringUntil('\n');
    processCommand(command_str);
  }

  // Task 2: Periodically send sensor data to ESP8266
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    sendSensorData();
  }
}

void processCommand(String command_str) {
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, command_str);

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }

  const char* action = doc["action"];

  if (strcmp(action, "drive") == 0) {
    float left = doc["left"];   // Value from -1.0 to 1.0
    float right = doc["right"]; // Value from -1.0 to 1.0
    drive(left, right);
  } else if (strcmp(action, "rotate") == 0) {
    float speed = doc["speed"]; // Value from -1.0 (left) to 1.0 (right)
    rotate(speed);
  } else if (strcmp(action, "stop") == 0) {
    stopMotors();
  }
}

void sendSensorData() {
  StaticJsonDocument<256> doc;

  doc["temp"] = dht.readTemperature();
  doc["hum"] = dht.readHumidity();
  doc["aq"] = analogRead(mq135Pin);
  doc["alc"] = analogRead(mq3Pin);
  doc["co"] = analogRead(mq7Pin);

  serializeJson(doc, Serial1);
  Serial1.println(); // Send a newline to mark the end of the message
}

void drive(float leftSpeed, float rightSpeed) {
  // --- Left Motors (Front and Back) ---
  int leftPwm = abs(leftSpeed) * 255;
  if (leftSpeed > 0.1) { // Forward
    digitalWrite(in1_back, HIGH); digitalWrite(in2_back, LOW);
    digitalWrite(in1_front, HIGH); digitalWrite(in2_front, LOW);
  } else if (leftSpeed < -0.1) { // Backward
    digitalWrite(in1_back, LOW); digitalWrite(in2_back, HIGH);
    digitalWrite(in1_front, LOW); digitalWrite(in2_front, HIGH);
  } else { // Stop
    leftPwm = 0;
  }
  analogWrite(enA_back, leftPwm);
  analogWrite(enA_front, leftPwm);

  // --- Right Motors (Front and Back) ---
  int rightPwm = abs(rightSpeed) * 255;
  if (rightSpeed > 0.1) { // Forward
    digitalWrite(in3_back, HIGH); digitalWrite(in4_back, LOW);
    digitalWrite(in3_front, HIGH); digitalWrite(in4_front, LOW);
  } else if (rightSpeed < -0.1) { // Backward
    digitalWrite(in3_back, LOW); digitalWrite(in4_back, HIGH);
    digitalWrite(in3_front, LOW); digitalWrite(in4_front, HIGH);
  } else { // Stop
    rightPwm = 0;
  }
  analogWrite(enB_back, rightPwm);
  analogWrite(enB_front, rightPwm);
}

void rotate(float speed) {
  // speed > 0 means rotate right (left motors forward, right motors backward)
  // speed < 0 means rotate left (left motors backward, right motors forward)
  drive(speed, -speed);
}

void stopMotors() {
  // Set speed of all motors to 0
  analogWrite(enA_back, 0); analogWrite(enB_back, 0);
  analogWrite(enA_front, 0); analogWrite(enB_front, 0);
}