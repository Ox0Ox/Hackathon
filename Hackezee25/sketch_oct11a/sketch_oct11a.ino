#include <LiquidCrystal_I2C.h>
#include <DHT.h>

// --- Sensor Setup ---
#define DHTPIN D4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// --- LCD Setup ---
// Set the LCD address to 0x27 for a 16 chars and 2 line display
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  // Initialize the LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Sensor Reading:");

  // Start the DHT sensor
  dht.begin();
}

void loop() {
  // Wait a couple of seconds
  delay(2000);

  // Read temperature and humidity
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // Check if reads failed
  if (isnan(h) || isnan(t)) {
    lcd.setCursor(0, 1);
    lcd.print("Read Error");
    return;
  }

  // Clear the second line for the new data
  lcd.setCursor(0, 1);
  lcd.print("                "); // Clear the line

  // Display Temperature
  lcd.setCursor(0, 1);
  lcd.print("T:");
  lcd.print(t);
  lcd.print("C");

  // Display Humidity
  lcd.setCursor(9, 1);
  lcd.print("H:");
  lcd.print(h);
  lcd.print("%");
}