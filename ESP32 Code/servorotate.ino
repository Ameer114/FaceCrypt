#include <WiFi.h>
#include <ESP32Servo.h>
#define echoPin 13 // attach pin D2 Arduino to pin Echo of HC-SR04
#define trigPin 12 //attach pin D3 Arduino to pin Trig of HC-SR04

long duration;
float distance;
const char* ssid = "ESP32";
const char* password = "12345678";

WiFiServer server(80);
Servo myServo;

int servoPin = 15;
int currentAngle = 0;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an OUTPUT
  pinMode(echoPin, INPUT); // Sets the echoPin as an INPUT
  myServo.attach(servoPin);
  myServo.write(currentAngle);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected to WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    Serial.println("Client connected");

    // Wait until client sends data
    while (!client.available()) {
      delay(1);
    }

    String requestLine = client.readStringUntil('\r');
    Serial.println("Request: " + requestLine);
    client.read();  // read '\n'
    digitalWrite(trigPin, LOW);
        delayMicroseconds(2);
        digitalWrite(trigPin, HIGH);
        delayMicroseconds(10);
        digitalWrite(trigPin, LOW);
	duration = pulseIn(echoPin, HIGH);
        distance = duration * 0.034 / 2;

    // Check for toggle in the request
    if (requestLine.indexOf("GET /toggle") >= 0 && distance < 100 ) {
      currentAngle = 90;
      myServo.write(currentAngle);
      Serial.print("Servo moved to ");
      Serial.println(currentAngle);
      
      while(1){
        digitalWrite(trigPin, LOW);
        delayMicroseconds(2);
        digitalWrite(trigPin, HIGH);
        delayMicroseconds(10);
        digitalWrite(trigPin, LOW);
	      duration = pulseIn(echoPin, HIGH);
        distance = duration * 0.034 / 2;

        Serial.println(distance);
        if (distance > 100) {
          break;
        }
	      delay(1000);

      }

      currentAngle = 0;
      myServo.write(currentAngle);
      Serial.print("Servo moved to ");
      Serial.println(currentAngle);

    }
    
  
    // Send HTML
    String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'>";
    html += "<style>body{font-family:Arial;text-align:center;margin-top:50px;}button{padding:20px 40px;font-size:20px;}</style></head>";
    html += "<body><h1>ESP32 Servo Toggle</h1>";
    html += "<p>Current Angle: " + String(currentAngle) + "°</p>";
    html += "<button onclick=\"location.href='/toggle'\">Toggle Servo</button>";
    html += "</body></html>";

    client.print("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n");
    client.print(html);

    client.stop();
    Serial.println("Client disconnected");
    Serial.println("--------------------");
  }
}
