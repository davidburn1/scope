#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <Hash.h>
#include "settings.h"

const char* ssid = WIFI_SSID;
const char* pass = WIFI_PASS;

uint16_t pointer;
uint16_t data[2048];
uint8_t * dataStartPointer = (uint8_t *) &data;

WebSocketsServer webSocket = WebSocketsServer(81);
ESP8266WebServer server(80);

//os_delay_us(1) you actually delay about os_delay_us(1.55)
// one microsecond is exactly 80 ticks. But invoking os_delay_us(1) actually took 125 ticks, so there must be 45 tick overhead 
// delayTime = 1000 is too much -> watchdog timer


void collectData() {
  for(pointer=0; pointer<settings.memoryDepth; pointer++) {
     data[pointer] = analogRead(A0);
     os_delay_us(delayTime);
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_DISCONNECTED){                   // if the websocket is disconnected
    Serial.printf("[%u] Disconnected!\n", num);
  } else if (type == WStype_CONNECTED) {              // if a new websocket connection is established
    IPAddress ip = webSocket.remoteIP(num);
    Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
    jsonEncodeSettings();
    webSocket.broadcastTXT(charBuffer, strlen(charBuffer));
  } else if (type == WStype_TEXT) {
    Serial.println("text");
    for(uint i = 0; i < length; i++) Serial.print((char) payload[i]);
    Serial.println("");
    updateSettingsFromJSON((char*) payload);
    jsonEncodeSettings();
    webSocket.broadcastTXT(charBuffer, strlen(charBuffer));
  } else if (type == WStype_BIN) {
    Serial.println("Bin");
    for(uint i = 0; i < length; i++) Serial.print((char) payload[i]);
  }
}

void serveFileFromSPIFFS(String path) {
  if(path.endsWith("/")) path += "index.html";

  String contentType = "text/plain";
  if (path.endsWith(".html")) contentType = "text/html";
  if (path.endsWith(".css")) contentType = "text/css";
  if (path.endsWith(".js")) contentType = "application/javascript";
  
  if (SPIFFS.exists(path)) {
    File file = SPIFFS.open(path, "r");
    server.streamFile(file, contentType);
    file.close();
  } else {
    server.send(404, "text/plain", "404");
  }
}





void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, pass);
  Serial.println("");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
    
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  SPIFFS.begin();
  
  server.onNotFound([](){  // any other option
    serveFileFromSPIFFS(server.uri()); 
  });
  
  server.begin();

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}




void loop() {
    webSocket.loop();
    server.handleClient();
    delay(50);

    collectData();
    //webSocket.sendBIN(0, dataStartPointer,  settings.memoryDepth*2);
    webSocket.broadcastBIN(dataStartPointer,  settings.memoryDepth*2);
}
