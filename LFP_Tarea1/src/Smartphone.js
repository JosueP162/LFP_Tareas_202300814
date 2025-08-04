export default class Smartphone {
    #battery
    #number
    #balance
    #storage

    constructor(brand, model, storage, battery, number) {
        this.brand = brand
        this.model = model
        this.#storage = parseInt(storage) || 120 // Default storage is 120GB
        this.#battery = battery
        this.#number = number
        this.on = false
        this.#balance = 20 // Default balance is 20
        console.log(`Creando un nuevo smartphone: ${this.brand} ${this.model}`)
        console.log(`Almacenamiento: ${this.#storage}GB, Bateria: ${this.#battery}%, Numero: ${this.#number}, Saldo: $${this.#balance}`)
        console.log(`Estado: ${this.on ? 'Encendido' : 'Apagado'}`) 
    }

    turnOn() {
        if (!this.on) {
            console.log(`Tu telefono ${this.brand} ${this.model} esta encendido`)
            this.on = true
        } else {
            console.log("Tu telefono ya esta encendido")
        }
    }

    turnOff() {
        if (this.on) {
            this.on = false
            console.log(`Apagando ${this.brand} ${this.model}`)
        } else {
            console.log("Tu telefono ya esta apagado")
        }
    }

    makeCall = (destinationNumber) => {
        if (!this.on) {
            console.log("No puedes hacer llamadas, el telefono esta apagado")
            return
        }
        
        if (this.#battery < 0) {
            console.log(`Bateria actual: ${this.#battery}%`)
            console.log("Bateria muy baja para hacer llamadas")
            return
        }

        if (this.#balance > 0) {
            console.log(`Llamando desde ${this.#number} a ${destinationNumber}`)
            this.#balance -= 5
            this.#battery -= 2 // Las llamadas consumen batería
        } else {
            console.log("No tienes saldo")
        }
    }

    chargeBattery = (porcentaje) => {
        console.log(`Cargando bateria...`)
        this.#battery = Math.min(100, this.#battery + porcentaje)
        console.log(`Bateria cargada al ${this.#battery}%`)
    }

    installApp = (appName, weight = 20) => {  // Default weight is 20GB
        console.log(`Intentando instalar ${appName}...`)
        if (!this.on) {
            console.log("No puedes instalar apps, el telefono esta apagado")
            return
        }

        if (this.#storage >= weight) {
            console.log(`Instalando ${appName}...`)
            console.log(`En tu dispositivo ${this.brand} ${this.model}`)
            this.#storage -= weight
            console.log(`${appName} instalada correctamente. Almacenamiento restante: ${this.#storage}GB`)
        } else {
            console.log(`Almacenamiento insuficiente. Necesitas ${weight}GB pero solo tienes ${this.#storage}GB`)
        }
    }

    showInfo() {
        console.log(`
        ╔══════════════════════════════════╗
        ║         SMARTPHONE INFO          ║
        ╠══════════════════════════════════╣
        ║ Brand: ${this.brand.padEnd(25)} ║
        ║ Model: ${this.model.padEnd(25)} ║
        ║ Storage: ${this.#storage.toString().padEnd(21)}GB ║
        ║ Battery: ${this.#battery.toString().padEnd(22)}% ║
        ║ Number: ${this.#number.padEnd(24)} ║
        ║ Status: ${(this.on ? 'On' : 'Off').padEnd(24)} ║
        ║ Balance: ${this.#balance.toString().padEnd(23)} ║
        ╚══════════════════════════════════╝
        `)
    }

    // Getters
    getBattery() { return this.#battery }
    getBalance() { return this.#balance }
    getNumber() { return this.#number }
    getStorage() { return this.#storage }
}