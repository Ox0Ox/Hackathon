#include <DHT.h>

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

void setup() {
  Serial.begin(9600);
  Serial.println("Robot Initializing: Sensors and Motors...");

  // --- Initialize Sensors ---
  dht.begin();

  // --- Initialize Motor Pins ---
  pinMode(enA_back, OUTPUT); pinMode(in1_back, OUTPUT); pinMode(in2_back, OUTPUT);
  pinMode(enB_back, OUTPUT); pinMode(in3_back, OUTPUT); pinMode(in4_back, OUTPUT);
  pinMode(enA_front, OUTPUT); pinMode(in1_front, OUTPUT); pinMode(in2_front, OUTPUT);
  pinMode(enB_front, OUTPUT); pinMode(in3_front, OUTPUT); pinMode(in4_front, OUTPUT);

  // --- SENSOR WARM-UP SEQUENCE ---
  Serial.println("MQ Sensors warming up. Please wait 20 seconds...");
  delay(20000); // Wait 20 seconds
  
  Serial.println("Initialization Complete. Starting main loop.");
}

void loop() {
  // --- Step 1: Read and Display Sensor Data ---
  readAndDisplaySensors();

  // --- Step 2: Check for Safety Conditions ---
  int co_level = analogRead(mq7Pin);
  if (co_level > 400) { // Calibrate this threshold for your environment!
    Serial.println("!!! HIGH CO DETECTED - HALTING MOTORS !!!");
    stopMotors();
    delay(2000); // Wait before continuing
    return; // Skip the motor test sequence for safety
  }

  // --- Step 3: Run Motor Test Sequence ---
  Serial.println("\n--- Starting Motor Test Sequence ---");
  Serial.println("Moving Forward...");
  moveForward(200);
  delay(2000);

  stopMotors();
  delay(1000);

  Serial.println("Turning Right...");
  turnRight(200);
  delay(2000);

  stopMotors();
  delay(1000);
  
  Serial.println("--- Motor Test Sequence Complete ---\n");
}

// --- Sensor Reading Function ---
void readAndDisplaySensors() {
  float temp = dht.readTemperature();
  float humid = dht.readHumidity();
  int aq_val = analogRead(mq135Pin);
  int alcohol_val = analogRead(mq3Pin);
  int co_val = analogRead(mq7Pin);

  Serial.println("--- Current Sensor Readings ---");
  if (isnan(temp) || isnan(humid)) {
    Serial.println("Failed to read from DHT sensor!");
  } else {
    Serial.print("Temperature:   "); Serial.print(temp); Serial.println(" *C");
    Serial.print("Humidity:      "); Serial.print(humid); Serial.println(" %");
  }
  Serial.print("Air Quality:   "); Serial.println(aq_val);
  Serial.print("Alcohol Level: "); Serial.println(alcohol_val);
  Serial.print("CO Level:      "); Serial.println(co_val);
}


// --- Motor Control Functions ---

void moveForward(int speed) {
  // Back wheels
  digitalWrite(in1_back, HIGH); digitalWrite(in2_back, LOW);
  digitalWrite(in3_back, HIGH); digitalWrite(in4_back, LOW);
  // Front wheels
  digitalWrite(in1_front, HIGH); digitalWrite(in2_front, LOW);
  digitalWrite(in3_front, HIGH); digitalWrite(in4_front, LOW);
  // Set speed for all
  analogWrite(enA_back, speed); analogWrite(enB_back, speed);
  analogWrite(enA_front, speed); analogWrite(enB_front, speed);
}

void turnRight(int speed) {
  // Left wheels forward, Right wheels backward
  // Back wheels (Left FORWARD, Right BACKWARD)
  digitalWrite(in1_back, HIGH); digitalWrite(in2_back, LOW);
  digitalWrite(in3_back, LOW); digitalWrite(in4_back, HIGH);
  // Front wheels (Left FORWARD, Right BACKWARD)
  digitalWrite(in1_front, HIGH); digitalWrite(in2_front, LOW);
  digitalWrite(in3_front, LOW); digitalWrite(in4_front, HIGH);
  // Set speed for all
  analogWrite(enA_back, speed); analogWrite(enB_back, speed);
  analogWrite(enA_front, speed); analogWrite(enB_front, speed);
}

void stopMotors() {
  // Set speed of all motors to 0
  analogWrite(enA_back, 0); analogWrite(enB_back, 0);
  analogWrite(enA_front, 0); analogWrite(enB_front, 0);
}