const readlineSync = require('readline-sync');
const crypto = require("crypto");
const sha3 = require("js-sha3").sha3_256;
const pa = process.argv;
const args = pa.slice(2);

class Winner {
    checkWinner(playerInput, pcMove) {
        let len = args.length;
        let indOfPlayer = playerInput - 1;
        let halfOfArray = (len - 1) / 2;
        if (len - (indOfPlayer + 1) < halfOfArray) {
            let arr = args.slice();
            arr.splice(indOfPlayer - halfOfArray, halfOfArray);
            var lowerArray = arr;
        }
        else {
            var lowerArray = args.slice(indOfPlayer + 1, indOfPlayer + halfOfArray + 1);
        }

        if (args[indOfPlayer] === pcMove) {
            return "draw";
        }
        else if (lowerArray.includes(pcMove)) {
            return "win";
        }
        else {
            return "lose";
        }
    }
}
let winner = new Winner()

class Table {
    helpTable(args) {
        let table = []
        let row = ["Your move ->"]
        for (let arg in args) {
            row.push(args[arg])
        }
        table.push(row)
        for (let argPC in args) {
            row = [args[argPC]]
            for (let argPlayer in args) {
                row.push(winner.checkWinner(parseInt(argPlayer) + 1, args[argPC]))
            }
            table.push(row)
        }
        console.table(table)
    }
}


class Hmacgen {
    hmacGen(key, move) {
        let hmac = crypto.createHmac("sha256", key).update(move).digest("hex")
        return hmac
    }
}
class Keygen {
    
    csprng(min, max) {
        const range = max - min
        if (range >= Math.pow(2, 32))
            console.log("Warning! Range is too large.")
        var tmp = range
        var bitsNeeded = 0
        var bytesNeeded = 0
        var mask = 1

        while (tmp > 0) {
            if (bitsNeeded % 8 === 0) bytesNeeded += 1
            bitsNeeded += 1
            mask = mask << 1 | 1
            tmp = tmp >>> 1
        }
        const randomBytes = crypto.randomBytes(bytesNeeded)
        var randomValue = 0

        for (var i = 0; i < bytesNeeded; i++) {
            randomValue |= randomBytes[i] << 8 * i
        }

        randomValue = randomValue & mask;

        if (randomValue <= range) {
            return min + randomValue
        } else {
            return this.csprng(min, max)
        }
    }

    keyGen() {

        let randomNumber = keyGen.csprng(1, 99999)
        return sha3(randomNumber.toString())
    }


}
let hmacGen = new Hmacgen()
let keyGen = new Keygen()

function main(args) {
    let pcMove = args[Math.floor(Math.random() * args.length)]
    let keyHMAC = keyGen.keyGen()
    console.log("HMAC:\n" + hmacGen.hmacGen(keyHMAC, pcMove))
    let playerInput;
    let helpTable = new Table()

    while (args[parseInt(playerInput) - 1] == undefined) {
        if (playerInput == "?") {
            helpTable.helpTable(args)
            playerInput = readlineSync.question("Enter your move: ")
        }
        else if (playerInput == "0") {
            process.exit(1)
        }
        else {
            menu(args)
            playerInput = readlineSync.question("Enter your move: ");
        }
    }



    console.log("Your move:", args[parseInt(playerInput) - 1])
    console.log("Computer move:", pcMove)


    let result = winner.checkWinner(parseInt(playerInput), pcMove)
    console.log(playerInput)
    result == "draw" ? console.log("It's", result) : console.log("You", result + "!")
    console.log("HMAC key:\n" + keyHMAC)
}


function menu(args) {
    console.log("Available moves:")
    for (let i = 0; i < args.length; i++) {
        console.log(`${i + 1}` + " - " + args[i])
    }
    console.log("0 - exit\n? - help")
}

if (new Set(pa).size !== pa.length || pa.length < 5 || pa.length % 2 === 0) {
    console.log("Wrong parameters! Must be unique.The number of parameters must be odd and greater then one.\n" +
        "e.g. 1) rock paper scissors, 2) rock paper scissors lizard Spock, 3) 1 2 3 4 5 6 7 8 9")
} else {
    main(args)
}
