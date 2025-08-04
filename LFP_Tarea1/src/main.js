import Smartphone from "./Smartphone.js";

console.log("STARTING SMARTPHONE CLASS DEMONSTRATION");
console.log("=".repeat(60));

// Creación de la primera instancia
console.log("\n CREATING FIRST SMARTPHONE:");
const smartphone1 = new Smartphone("iPhone", "15 Pro", "256", 85, "+502 1234-5678");

// Creación de la segunda instancia
console.log("\n CREATING SECOND SMARTPHONE:");
const smartphone2 = new Smartphone("Samsung", "Galaxy S24", "512", 45, "+502 8765-4321");

console.log("\n" + "=".repeat(60));
console.log(" TESTING FIRST SMARTPHONE METHODS");
console.log("=".repeat(60));

// Probando métodos con el primer smartphone
smartphone1.turnOn();
smartphone1.makeCall("+502 9999-1111");
smartphone1.installApp("WhatsApp", 100);
smartphone1.chargeBattery(15);

console.log("\n" + "=".repeat(60));
console.log("TESTING SECOND SMARTPHONE METHODS");
console.log("=".repeat(60));

// Probando métodos con el segundo smartphone (apagado)
smartphone2.makeCall("+502 5555-7777"); // Intentar llamar apagado
smartphone2.installApp("Instagram", 80);  // Intentar instalar app apagado
smartphone2.turnOn();
smartphone2.makeCall("+502 5555-7777");
smartphone2.makeCall("+502 3333-4444"); // Segunda llamada para ver cómo baja el saldo
smartphone2.chargeBattery(30);
smartphone2.installApp("TikTok", 120);

console.log("\n" + "=".repeat(60));
console.log("ADDITIONAL TESTS - LOW BATTERY AND STORAGE");
console.log("=".repeat(60));

const smartphone3 = new Smartphone("Xiaomi", "Mi 13", "128", 8, "+502 1111-2222");
smartphone3.turnOn();
smartphone3.makeCall("+502 9999-8888");
smartphone3.makeCall("+502 7777-6666"); 
smartphone3.makeCall("+502 5555-4444"); 
smartphone3.makeCall("+502 3333-2222"); 
smartphone3.makeCall("+502 1111-0000"); 

// Probar almacenamiento lleno
smartphone3.installApp("Gran Juego", 150); // Debería dar error de almacenamiento

console.log("\n" + "=".repeat(60));
console.log("FINAL STATUS OF ALL SMARTPHONES");
console.log("=".repeat(60));

smartphone1.showInfo();
smartphone2.showInfo();
smartphone3.showInfo();
