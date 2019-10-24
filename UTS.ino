/************************ INCLUDE LIBRARY ************************/
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"
/*****************************************************************/

/********************** PIN CONFIGURATION ************************/
#define pinLED D5 //Pin LED
#define pinR D6 //Pin RGB Red
#define pinG D7 //Pin RGB Green 
#define pinB D8 //Pin RGB Blue
#define DHTPIN D4 //Pin DHT
#define supplyRGB D3 //Pin supply tegangan ke RGB
#define supplyDHT D0 //Pin supply tegangan ke DHT
#define pinLDR A0 //Pin input bacaan LDR
int pinButton[2] = {5, 4}; //Pin push button untuk ON/OFF LED & RGB
/*****************************************************************/

/********************* VARIABEL WiFi & MQTT **********************/
const char* ssid = "Jigsaw On Runaway"; // Nama WiFi
const char* password = "ikomang008"; // Password WiFi
const char* mqtt_server = "192.168.43.110"; // IP address
const int mqtt_port = 1884; // Port MQTT
WiFiClient espClient;
PubSubClient client(espClient);
/*****************************************************************/

/************************* SETTING DHT ***************************/
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);
/*****************************************************************/

/************************* VARIABEL GLOBAL ***********************/
float input_temp[4] = {29, 29, 29, 29}; //Ring buffer untuk nyimpen bacaan temperatur
float input_humidity[4] = {50, 50, 50, 50}; //Ring buffer untuk nyimpen bacaan humidity
float input_intensity[4] = {120, 120, 120, 120}; //Ring buffer untuk nyimpen bacaan intensity
float output_intensity; //Intensitas yang sudah difilter
int buff_input = 3; //Index untuk update ring buffer

float filter_temperature[5] = {0.135, 0.225, 0.28, 0.135, 0.225}; //Koefisien filter
float filter_humidity[5] = {0.0506, 0.2294, 0.44, 0.0506, 0.2294}; //Koefisien filter
float filter_intensity[5] = {-0.0418, 0.1818, 0.72, -0.0418, 0.1818}; //Koefisien filter

int R = 1023;
int G = 1023;
int B = 1023;
int mode_nyala = 0; // 0: Manual | 1: Automatic
int threshold = 600; // Ambang tertentu

int last_state_led = 0;
int last_state_RGB = 0;
int state_led = 1; //Kondisi LED; 1: Nyala 0: Mati
int state_RGB = 1; //Kondisi RGB; 1: Nyala 0: Mati
int current_state[2] = {0, 0}; //Untuk mendeteksi perubahan PB
int previous_state[2] = {0, 0}; //Untuk mendeteksi perubahan PB
/*****************************************************************/

/************************ DEKLARASI FUNGSI ***********************/
void setup_wifi();
void reconnect();
void callback(char* topic, byte* payload, unsigned int length);
void sample_publish(); //Prosedur untuk publish temperatur, intensity, dan humidity
int update_buff_index(int buff, int max_buff); //Fungsi untuk mengupdate index buffer
float filtering(int update_index, float new_value, float var[], int length_array, float filter_coeff[], int length_filter); //Fungsi untuk memfilter

int button_trigger(); //Fungsi untuk menentukan apakah PB sedang dipencet atau tidak
void lamp_setting(); //Prosedur mengatur nyala LED & RGB
void pubfloat(char* topic, float var); //Prosedur untuk publish float ke MQTT
void pubint(char* topic, int var); //Prosedur untuk publish int ke MQTT
/*****************************************************************/

void setup() {
  Serial.begin(115200);

  pinMode(pinLED, OUTPUT);
  pinMode(pinR, OUTPUT);
  pinMode(pinG, OUTPUT);
  pinMode(pinB, OUTPUT);
  pinMode(supplyRGB, OUTPUT);
  pinMode(supplyDHT, OUTPUT);
  pinMode(pinButton[0], INPUT);
  pinMode(pinButton[1], INPUT);

  // Initialize (Matiin LED dan RGB)
  digitalWrite(supplyRGB, LOW);
  digitalWrite(pinLED, LOW);
  analogWrite(pinR, 0);
  analogWrite(pinG, 0);
  analogWrite(pinB, 0);
  
  setup_wifi();
  /***** Connnect MQTT *****/
  client.setServer(mqtt_server, mqtt_port);
  while (!client.connected()) {
    String connection_id = String(ESP.getChipId());
    client.connect(connection_id.c_str());
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nConnected to MQTT");
  /************************/
  client.subscribe("mode");
  client.subscribe("rgb");
  client.subscribe("threshold");
  client.subscribe("led");
  client.setCallback(callback);
  dht.begin();
  delay(1000);
  digitalWrite(supplyDHT, HIGH);
}

unsigned long LAST_TIME = -1000;
void loop() {
  
  if (!client.connected()) { // Koneksikan kembali apabila koneksi terputus
    reconnect();
    client.subscribe("mode");
    client.subscribe("rgb");
    client.subscribe("threshold");
    client.subscribe("led");
  }
  client.loop();

  /********* PUBLISH KE MQTT ********/
  unsigned long TIME = millis();
  if (TIME - LAST_TIME >= 1000){ //Untuk mengatur sampling time : 1000 ms
    Serial.print("Sampling rate: ");
    Serial.print(TIME - LAST_TIME);
    Serial.println(" ms");
    sample_publish();
    LAST_TIME = TIME;
  }
  /*********************************/

  /********* Automatis/Manual ********/
  if (mode_nyala == 1){ // Mode otomatis
    if (output_intensity <= threshold){
      state_led = true;
      state_RGB = true;
    }
    else {
      state_led = false;
      state_RGB = false;
    }
  }
  else { // Mode manual
    int but_trig = button_trigger();
    switch(but_trig){
      case 0 :
      Serial.print("button_trigger");
    Serial.println(but_trig);
        state_led = !state_led;
        break;
      case 1 :
      Serial.print("button_trigger");
    Serial.println(but_trig);
        state_RGB = !state_RGB;
        //Serial.println(state_RGB);
        break;
      default :
        break;
    }
  }
  /*********************************/

  /******b ON/OFF LED & RGB *********/
  lamp_setting();
  
}

void setup_wifi() {
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  // Waiting until connected
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 2 seconds");
      
      // Wait 2 seconds before retrying
      delay(2000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on topic ");
  Serial.print(topic);
  Serial.print(": ");
  String string_message;
  for (int i = 1; i < length; i++) {
    Serial.print((char)payload[i]);
    string_message += char(payload[i]);
  } Serial.println();

  int message = string_message.toInt();

  /************* MEMPROSES DATA YANG DIKRIM DARI MQTT ******************/
  /* Nama Topic Subscribe:
    mode : mengatur mode automatic/manual   
    threshold : mengatur ambang batas
    rgb : mengatur nilai R G & B
    led : menyala atau mematikan LED pada mode manual
   */
  if(strcmp(topic, "mode") == 0){
    mode_nyala = message;
    Serial.print("Mode Kerja: ");
    Serial.println(mode_nyala);
  }
  else if(strcmp(topic, "threshold") == 0){
    threshold = message;
    Serial.print("Batas ambang: ");
    Serial.println(threshold);
  }
  else if(strcmp(topic, "rgb") == 0){
    switch((char)payload[0]){
        case 'r':
          R = (message*1023/255); analogWrite(pinR, 1023-R); Serial.print("Red: "); Serial.println(R); break;
        case 'g':
          G = (message*1023/255); analogWrite(pinG, 1023-G); Serial.print("Green: "); Serial.println(G); break;
        case 'b':
          B = (message*1023/255); analogWrite(pinB, 1023-B);Serial.print("Blue: "); Serial.println(B);; break;
        case 's':
          if(message==0){
            state_RGB=false;
          }
          else if(message==1){
            state_RGB=true;
          }
          break;
        default:
          break;
      }
  }
  else if(strcmp(topic, "led") == 0){ //Jika Mode automatic --> State LED tidak ada diupdate (gak ngefek kalau dinyala-matiin lewat UI
    if(!mode_nyala){
      state_led = !state_led;
    }
    else{}
  }
  else{}
}

void sample_publish(){ // Publish bacaan humidity, temperature, dan intensity ke MQTT
  float h = dht.readHumidity();  
  float t = dht.readTemperature();
  float ldr = analogRead(pinLDR);
  /*
  Serial.print(h);
  Serial.print(" ");
  Serial.print(t);
  Serial.print(" ");
  Serial.println(ldr);
   */ 
  if (isnan(h)){
    if (buff_input == 0){
      h = input_humidity[3];
    }
    else{
      h = input_humidity[buff_input - 1];
    }
  }
  if (isnan(t)){
    if (buff_input == 0){
      t = input_temp[3];
    }
    else{
      t = input_temp[buff_input - 1];
    }
  }

  float output_temp     = filtering(buff_input, t, input_temp, 4, filter_temperature, 5);
  float output_humidity = filtering(buff_input, h, input_humidity, 4, filter_humidity, 5);
  output_intensity      = filtering(buff_input, ldr, input_intensity, 4, filter_intensity, 5);
  
  input_temp[buff_input]      = t;
  input_humidity[buff_input]  = h;
  input_intensity[buff_input] = ldr;
  
  buff_input       = update_buff_index(buff_input, 4);

  Serial.print(output_temp);
  Serial.print(" ");
  Serial.print(output_humidity);
  Serial.print(" ");
  Serial.println(output_intensity);
  pubfloat("temperature", output_temp);
  pubfloat("humidity", output_humidity);
  pubfloat("intensity", output_intensity);
}

int update_buff_index(int buff, int max_buff){ // Update buff index untuk kepentingan buffer
  int result = buff + 1;
  if (result >= max_buff){
    result = 0;
  }  
  return result;
}

float filtering(int update_index, float new_value, float var[], int length_array, float filter_coeff[], int length_filter){ // Algoritma filter digital
  int buff = update_index;
  float result = new_value * filter_coeff[0];
  for(int i =1; i <= length_array; i++){
    buff = buff - 1;
    if(buff == -1){
      buff = length_array-1;
    }
    result += var[buff] * filter_coeff[i];
  }
  return result;
}

int button_trigger () { // Mendeteksi apakah ada TRIGGER yang terdeteksi atau tidak
  int i;
  for (i = 0; i < 2; i++){
    current_state[i] = digitalRead(pinButton[i]);
    if (current_state[i] - previous_state[i] == 1){
      previous_state[i] = current_state[i];
      break; // Keluar dari loop for(...){ ... } ini
    }
    previous_state[i] = current_state[i];
  }
  
  return i;
}

void lamp_setting(){ // ON/OFF LED & RGB
  // Di sini, LED & RGB dinyala/matikan HANYA saat ada perbuahan State
  // Jadi, Wemos tidak selalu mengirim sinyal ulang ke LED & RGB
  if(state_RGB != last_state_RGB){
    pubint("indicator_rgb", state_RGB);
    last_state_RGB = state_RGB;
    if(state_RGB){
      Serial.println("Turn ON RGB");
      digitalWrite(supplyRGB, HIGH);
      analogWrite(pinR, 1023-R);
      analogWrite(pinG, 1023-G);
      analogWrite(pinB, 1023-B);
    }
    else {
      Serial.println("Turn OFF RGB");
      analogWrite(pinR, 0);
      analogWrite(pinG, 0);
      analogWrite(pinB, 0);
      digitalWrite(supplyRGB, LOW);
    }
  }
  else{}

  if(state_led != last_state_led){
    pubint("indicator_led", state_led);
    last_state_led = state_led;
    if(state_led){
      Serial.println("Turn ON LED");
      digitalWrite(pinLED, HIGH);
    }
    else {
      Serial.println("Turn OFF LED");
      digitalWrite(pinLED, LOW);
    }
  }
}

void pubfloat(char* topic, float var) { // Buat Publish Float ke MQTT
  char attributes[10];
  String(var).toCharArray(attributes, 10); //Float --> String ---> Char Array
  client.publish(topic, attributes);
}

void pubint(char* topic, int var) { // Buat Publish Int ke MQTT
  char attributes[10];
  String(var).toCharArray(attributes, 10); //Int --> String ---> Char Array
  client.publish(topic, attributes);
}
