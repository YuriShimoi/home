let documentInterval = setInterval(() => {
    if(document.readyState != "complete") return;
    clearInterval(documentInterval);
    wakeup();
}, 1);


function wakeup() {
    let chessTables = document.getElementsByClassName("chess-table");
    for(let ct=0; ct < chessTables.length; ct++) {
        generateChessTable(chessTables[ct], 8, 8);
    }
    let minesweeperTables = document.getElementsByClassName("minesweeper-table");
    let minesweeperGen = new Array(8).fill("").map(_ => new Array(8).fill(0));
    for(let rnd=0; rnd < 8; rnd++) {
        let rndx = Math.floor(Math.random()*8);
        let rndy = Math.floor(Math.random()*8);
        if(minesweeperGen[rndx][rndy] === "💥") {
            rnd--;
            continue;
        }
        minesweeperGen[rndx][rndy] = "💥";
        for(let rndxmin=rndx-1; rndxmin <= rndx+1; rndxmin++) {
            for(let rndymin=rndy-1; rndymin <= rndy+1; rndymin++) {
                if(rndxmin >= 0 && rndxmin < 8 && rndymin >= 0 && rndymin < 8
                && minesweeperGen[rndxmin][rndymin] !== "💥") {
                    minesweeperGen[rndxmin][rndymin]++;
                }
            }
        }
    }

    for(let mt=0; mt < minesweeperTables.length; mt++) {
        generateMinesweeperTable(minesweeperTables[mt], 8, 8, minesweeperGen);
    }
}

function generateChessTable(el, x, y) {
    let isEnumerated = el.classList.contains("chess-table-enumerated");
    
    let tableBody = el.createTBody();
    for(let tby=y; tby >= 1; tby--) {
        let tableBodyRow = tableBody.insertRow();
        tableBodyRow.insertCell().innerHTML = tby;
        for(let tbx=1; tbx <= x; tbx++) {
            let newCell = tableBodyRow.insertCell();
            
            if(isEnumerated)
                newCell.innerHTML = tbx + tby;
            if((tbx + tby) % 2 == 0)
                newCell.classList.add("chess-table-black");
        }
    }

    let tableFootRow = el.createTFoot().insertRow();
    tableFootRow.insertCell();
    for(let tf=1; tf <= x; tf++) {
        tableFootRow.insertCell().innerHTML = isEnumerated? tf: " ABCDEFGH"[tf];
    }
}

function generateMinesweeperTable(el, x, y, msGen) {
    let isEnumerated = el.classList.contains("minesweeper-table-enumerated");

    let tableBody = el.createTBody();
    for(let tby=0; tby < y; tby++) {
        let tableBodyRow = tableBody.insertRow();
        for(let tbx=0; tbx < x; tbx++) {
            tableBodyRow.insertCell().innerHTML = isEnumerated? msGen[tbx][tby] !== 0? msGen[tbx][tby]: "": msGen[tbx][tby] === "💥"? "💥": "";
        }
    }
}