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

    let forestTables = document.getElementsByClassName("forest-table");
    let forestSize = {x:25, y:19};
    let rndPos = {
        x: Math.floor(Math.random() * (forestSize.x-(4*2)) + 4),
        y: Math.floor(Math.random() * ((forestSize.y/2)-4) + 4)
    }
    for(let ct=0; ct < forestTables.length; ct++) {
        generateForestTable(forestTables[ct], forestSize.x, forestSize.y, rndPos);
        // obfuscateTable(forestTables[ct]);
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

function generateForestTable(el, x, y, rndpos={}) {
    const forestBorder = 4;
    pPos = {x: Math.floor(x/2), y:Math.floor(y/2)};
    if(el.classList.contains("forest-procedural")) 
        pPos = {...rndpos};
    
    let tableMapping = new Array(y).fill("").map(_ => new Array(x).fill(1));
    if(el.classList.contains("forest-marked")) {
        for(let tmy=forestBorder; tmy < (y/2); tmy++) {
            for(let tmx=forestBorder; tmx < (x-forestBorder); tmx++) {
                tableMapping[tmy][tmx] *= 2;
            }
        }
    }
    else {
        // set player circle
        const circleRadio = 3;
        for(let pcy = pPos.y-circleRadio; pcy <= pPos.y+circleRadio; pcy++) {
            for(let pcx = pPos.x-circleRadio; pcx <= pPos.x+circleRadio; pcx++) {
                if(Math.floor((Math.sqrt((pcy-pPos.y)**2+(pcx-pPos.x)**2))+0.5) <= circleRadio) {
                    tableMapping[pcy][pcx] *= 3;
                }
            }
        }
        
        // path to bottom center
        const pathRadio = 1;
        const endPos = {
            x: Math.floor(x/2),
            y: y
        };
        let pathPos = {
            x: pPos.x,
            y: pPos.y
        };
        while(pathPos.x != endPos.x || pathPos.y != endPos.y) {
            if(pathPos.x != endPos.x) pathPos.x += pathPos.x < endPos.x? 1: -1;
            if(pathPos.x < 0 || pathPos.x >= x) pathPos.x = endPos.x;
            if(pathPos.y != endPos.y) pathPos.y += pathPos.y < endPos.y? 2: -2;
            if(pathPos.y < 0 || pathPos.y >= y) pathPos.y = endPos.y;

            // draw radio
            for(let dry = pathPos.y-pathRadio; dry <= pathPos.y+pathRadio; dry++) {
                for(let drx = pathPos.x-pathRadio; drx <= pathPos.x+pathRadio; drx++) {
                    if((dry < y && dry >= 0) && (drx < x && dry >= 0))
                        tableMapping[dry][drx] *= 3;
                }
            }
        }
    }

    // mapping
    let tableBody = el.createTBody();
    for(let tby=0; tby < y; tby++) {
        let tableBodyRow = tableBody.insertRow();
        for(let tbx=0; tbx < x; tbx++) {
            let tableBodyRowCell = tableBodyRow.insertCell();
            if(tableMapping[tby][tbx] % 2 === 0) // forest-marked
                tableBodyRowCell.classList.add("procCell");
            if(tableMapping[tby][tbx] % 3 === 0) // path
                tableBodyRowCell.classList.add("pathCell");
            if(tbx == pPos.x && tby == pPos.y)
                tableBodyRowCell.classList.add("playerCell");
        }
    }
}

function obfuscateTable(el) {
    let tbRows = el.rows;
    for(let tr=0; tr < tbRows.length; tr++) {
        let tbCells = tbRows[tr].cells;
        for(let tc=0; tc < tbCells.length; tc++) {
            let rndHex = Math.floor(Math.random() * 25)+10;
            tbCells[tc].style.boxShadow = "inset 10px 10px #000000" + rndHex.toString(16);
        }
    }
}