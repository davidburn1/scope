#include <Arduino.h>
#include <ArduinoJson.h>

struct settings_t {
  uint8_t sampleRate = 0;
  uint16_t memoryDepth = 512;
  float voltsPerBit = 3.3 / 1024.0;
  float timePerBit = 10e-6;
};

settings_t settings; 
uint16_t delayTime = 100;
char charBuffer[128];

void implementSettings() {
    switch (settings.sampleRate) {
        case 0: delayTime = 0; break;// 1 us/Sample   
        case 1: delayTime = 2; break;// 2 us/Sample   
        case 2: delayTime = 10; break;// 10 us/Sample   
        case 3: delayTime = 20; break;// 20 us/Sample   
        case 4: delayTime = 100; break;// 100 us/Sample   
        case 5: delayTime = 200; break;// 200 us/Sample   
        case 6: delayTime = 1000; break;// 1 ms/Sample   
        case 7: delayTime = 2000; break;// 2 ms/Sample   
    }
    settings.timePerBit = delayTime  * 1.0e-6;
}



void updateSettingsFromJSON(char json[]){
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, json);

    // Test if parsing succeeds.
    if (error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.c_str());
        return;
    }

    if (doc.containsKey("sampleRate"))   settings.sampleRate = doc["sampleRate"]; 
    if (doc.containsKey("memoryDepth"))  settings.memoryDepth = doc["memoryDepth"];

    implementSettings(); 
}


void jsonEncodeSettings(){
    StaticJsonDocument<200> doc;
    doc["sampleRate"] = settings.sampleRate;
    doc["memoryDepth"] = settings.memoryDepth;
    doc["timePerBit"] = settings.timePerBit;
    doc["voltsPerBit"] = settings.voltsPerBit;

    serializeJson(doc, charBuffer);
}