# uts-iiot
Pada tugas ini telah berhasil didemonstrasikan suatu sistem Internet of Things sederhana dengan komponen-komponen input dan output berupa analog dan digital, serta menggunakan server nodejs dan protokol komunikasi MQTT. Komponen-komponen input-output yang ada telah berhasil dipantau dan dikontrol melalui sebuah User Interface yang dapat diakses pada jaringan lokal. Semua requirements yang dikehendaki untuk tugas ini telah berhasil terpenuhi dan dapat diakses pada dokumen "Documentations/RTM Tubes IIOT.pdf".

Demonstrasi yang kami buat juga dilengkapi filter sinyal untuk mereduksi noise dan ketidakpastian pembacaan sensor. Terdapat mode auto/manual untuk mengatur output-output yang ada. Pada mode auto, terdapat alarm yang dapat diatur batasnya. Penyalaan alarm dibuat redundant pada Node maupun pada Client untuk mengantisipasi data-loss. Penerimaan dan pengiriman data dari dan ke Input-Output dilakukan melalui MQTT secara real-time dan robas. Belum teramati adanya bug selama pengujicobaan sistem utuh.

## Created By :
- Agus Jony Wirawan - 13316008		(Electrical, Programming)
- Prasetyo Wibowo Laksono S. - 13316017	(UI & Web Developing)
- Fadillah Adamsyah Ma'ani - 13316046	(Electrical, Programming)

## Component List
List komponen elektrik IoT Node:
- 1 buah Development Board Wemos D1 Mini Pro
- 1 buah Sensor DHT22
- 1 buah LDR
- 1 buah LED
- 1 buah RGB LED
- 2 buah Push Button
- 7 buah Resistor 1K
- 2 buah Trimpot
- Beberapa kabel Jumper

## How To Use

[IoT Node] --> [IoT Server/Broker] <-- [IoT Client]

1. IoT Server/Broker <br>
-- Sambungkan PC ke Wifi yang akan dipakai <br>
-- Cek ip address dari PC ($ ifconfig) <br>
-- jalankan index.js via node.js ($ node index.js) <br>
---- Server HTTP akan terbuka di http://[Alamat IP Mesin]:3003 <br>
---- Server MQTT akan terbuka di mqtt://[Alamat IP Mesin]:1884 <br>

2. IoT Node <br>
-- Hubungkan komponen elektrik dengan Wemos D1 sesuai skematik <br>
-- Pada kode, ubah bagian "VARIABEL WIFI & MQTT": <br>
---- SSID (Nama Wifi) dan Password (Password Wifi) <br>
---- MQTT_Server (Alamat IP PC Server) <br>
---- MQTT_Port (Port MQTT yang dipakai) <br>
-- Sambungkan Wemos ke PC via USB <br>
-- Unggah kode yang telah diedit ke Wemos <br>

3. IoT Client <br>
-- Hubungkan gawai client ke Wifi yang sama dengan Node dan Server <br>
-- Buka pada browser http://[Alamat IP Mesin]:3003 <br>
-- Terdapat 3 Menu Navigasi pada website client: <br>
---- Tab1 : SENSORs --> Untuk memantau aktivitas sensor <br>
---- Tab2 : LEDs --> Untuk memantau/mengatur aktivitas LED <br>
------ Bar Kiri untuk memilih mode Manual / Auto <br>
------ Pada mode Manual, terdapat tombol untuk menyala matikan LED Putih dan terdapat slider untuk mengatur warna nyala LED RGB serta tombol untuk on/off LED RGB. <br>
------ Pada mode Auto, ambang batas alarm dapat diatur dengan memasukkan angka ke form input yang ada lalu menekan tombol submit. Nyala/mati alarm dapat diamati pada tampilan kanan bawah (Merah - Nyala, Putih - Mati). <br>
---- Tab3 : About --> Untuk mengetahui seputar project ini <br>

### Credits :
- [Chart.js](https://www.chartjs.org/)
- [Gauge.js](https://bernii.github.io/gauge.js/)
- [LoadingBar.js](https://loading.io/progress/)
- [Bootstrap](https://getbootstrap.com/)
- "ColorPicker" modified from [here](https://codepen.io/leemark/pen/lpEHr)


### Project Repository : [Repo](https://github.com/mzprz/uts-iiot)

### Requirement Traceability Matrix : [RTM](https://docs.google.com/spreadsheets/d/1lRiQDexQu1kVw5iYoRQ3A6UcfUMV-TDLQR5byM-zPLA/edit?usp=sharing)
