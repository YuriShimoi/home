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
    }

    let drunkenTables = document.getElementsByClassName("drunken-table");
    let lastTable = null;
    for(let dt=0; dt < drunkenTables.length; dt++) {
        lastTable = generateDrunkenTable(drunkenTables[dt], lastTable);
    }
}


// GENERATORS

function generateChessTable(el, x, y) {
    let isEnumerated = el.classList.contains("chess-table-enumerated");
    
    let tableBody = el.createTBody();
    for(let tby=y; tby >= 1; tby--) {
        let tableRow = tableBody.insertRow();
        tableRow.insertCell().innerHTML = tby;
        for(let tbx=1; tbx <= x; tbx++) {
            let tableCell = tableRow.insertCell();
            
            if(isEnumerated)
                tableCell.innerHTML = tbx + tby;
            if((tbx + tby) % 2 == 0)
                tableCell.classList.add("chess-table-black");
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
        let tableRow = tableBody.insertRow();
        for(let tbx=0; tbx < x; tbx++) {
            tableRow.insertCell().innerHTML = isEnumerated? msGen[tbx][tby] !== 0? msGen[tbx][tby]: "": msGen[tbx][tby] === "💥"? "💥": "";
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
        let tableRow = tableBody.insertRow();
        for(let tbx=0; tbx < x; tbx++) {
            let tableCell = tableRow.insertCell();
            if(tableMapping[tby][tbx] % 2 === 0) // forest-marked
                tableCell.classList.add("procCell");
            if(tableMapping[tby][tbx] % 3 === 0) // path
                tableCell.classList.add("pathCell");
            if(tbx == pPos.x && tby == pPos.y)
                tableCell.classList.add("playerCell");
        }
    }
}

function generateDrunkenTable(el, lastTable) {
    let [x, y] = el.getAttribute("size").split("-").map(x => parseInt(x));

    let tableMapping;
    let tableMappingHistory = null;
    if(lastTable === null || lastTable.length !== y) {
        if(el.classList.contains("drunken-table-small")) {
            tableMappingHistory = [];

            // generate drunken manually
            let lastPos = { x: Math.floor(x/2), y: Math.floor(y/2) };
            tableMappingHistory[0] = {
                table: new Array(y).fill("").map(_ => new Array(x).fill(0)),
                drunken: {...lastPos}
            }
            tableMappingHistory[0].table[lastPos.y][lastPos.x] = 1;
            
            for(let tmh=1; tmh < 50; tmh++) {
                let rndDir = Math.floor(Math.random()*4);
                switch(rndDir) {
                    case 0: lastPos.x++; break;
                    case 1: lastPos.x--; break;
                    case 2: lastPos.y++; break;
                    case 3: lastPos.y--; break;
                }
                if(lastPos.x >=x || lastPos.x < 0 || lastPos.y >=y || lastPos.y < 0) {
                    switch(rndDir) {
                        case 0: lastPos.x--; break;
                        case 1: lastPos.x++; break;
                        case 2: lastPos.y--; break;
                        case 3: lastPos.y++; break;
                    }
                    tmh--;
                    continue;
                }
                tableMappingHistory[tmh] = {
                    table: new Array(y).fill("")
                                            .map((_,ay) => new Array(x).fill(0)
                                            .map((_,ax) => tableMappingHistory[tmh-1].table[parseInt(ay)][parseInt(ax)])),
                    drunken: {...lastPos}
                };
                tableMappingHistory[tmh].table[lastPos.y][lastPos.x] = 1;
            }
            
            tableMapping = new Array(y).fill("").map(_ => new Array(x).fill(1));
            for(let tmy=0; tmy < y; tmy++) {
                for(let tmx=0; tmx < x; tmx++) {
                    tableMapping[tmy][tmx] = tableMappingHistory[tableMappingHistory.length-1].table[tmy][tmx];
                }
            }
        }
        else {
            GridProcedure.prop.drunken.paths  = 5;
            GridProcedure.prop.drunken.border = 0;
            GridProcedure.prop.drunken.smooth = 0;
            GridProcedure.prop.drunken.filler = 0.4;
            GridProcedure.prop.drunken.length = 0.1;
    
            tableMapping = GridProcedure.generate("drunken", {'x':x,'y':y});
        }
    }
    else
        tableMapping = lastTable;

    if(el.classList.contains("drunken-table-smooth"))
        for(let _=0; _<3; _++)
            tableMapping = GridProcedure._smoother(tableMapping, ["0","1"], ["0"]);

    // generate table
    let tableBody = el.createTBody();
    for(let tby=0; tby < y; tby++) {
        let tableRow = tableBody.insertRow();
        for(let tbx=0; tbx < x; tbx++) {
            let tableCell = tableRow.insertCell();
            if(tableMapping[tby][tbx] == 1)
                tableCell.classList.add("pathCell");
        }
    }
    if(tableMappingHistory !== null) {
        let frame = 0;
        setInterval(() => {
            let tableRows = el.rows;
            for(let tby=0; tby < tableRows.length; tby++) {
                let tableCells = tableRows[tby].cells;
                for(let tbx=0; tbx < tableCells.length; tbx++) {
                    if(tableCells[tbx].classList.contains("drunkenCell"))
                        tableCells[tbx].classList.remove("drunkenCell");

                    if(tableMappingHistory[frame].table[tby][tbx] == 1)
                        tableCells[tbx].classList.add("pathCell");
                    else if(tableCells[tbx].classList.contains("pathCell"))
                        tableCells[tbx].classList.remove("pathCell");
                }
            }
            let drPos = tableMappingHistory[frame].drunken;
            el.rows[drPos.y].cells[drPos.x].classList.add("drunkenCell");
            frame++;
            if(frame >= tableMappingHistory.length) frame = 0;
        }, 100);
    }

    return tableMapping;
}