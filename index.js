const DELIMITER = ';';
const NEWLINE = '\n';
const qRegex = /^"|"$/g;
const inputFile = document.getElementById('file');
const tableHtml = document.getElementById('table');
let bank = inputFile.addEventListener('click', function () {
    bank = document.querySelector('#pank').value;
})
const finalColumnMapping = {
    date: "Kuupäev",
    sum: "Summa",
    explanation: "Selgitus"
};

const explanationColumnMapping = {
    explanation: "",
    reciever: ""
};

function findColumnIndex(headerRow, columnName) {
    return headerRow.indexOf(columnName);
}

function cleanCreditPayments(table, bank) {
    if (bank == "seb") {
        let cleanedTable = table.filter(row => row[6] !== 'C');

        return cleanedTable;
    }
    else if (bank == "swedbank") {
        let cleanedTable = table.filter(row => row[7] !== 'K' && !row[4].startsWith('Ülekanne Rahakogujasse'));
        return cleanedTable;
    }
}

function mapExplanationIndexes(headers) {
    for (let i = 1; i < headers.length; i++) {
        if (headers[i].toUpperCase().startsWith('SAAJA/MAKSJA')) { explanationColumnMapping.reciever = i }
        if (headers[i].toUpperCase().startsWith('SELGITUS')) { explanationColumnMapping.explanation = i }
    }
}

function improveExplanation(table) {
    mapExplanationIndexes(table[0]);
    let expIndex = explanationColumnMapping.explanation;
    let recIndex = explanationColumnMapping.reciever;

    for (let i = 1; i < table.length; i++) {
        let row = table[i];
        let rec = row[recIndex] ? row[recIndex].trim() : "";
        let expl = row[expIndex] ? row[expIndex].trim().replace(' kaart...', '').replace(/^[0-9'\* :\/.]+/, '') : 'KAALIKAS';

        row[expIndex] = expl;

        if (expl === "" || !expl.substring(0, 10).includes(rec.substring(0, 10))) {
            row[expIndex] = row[expIndex] + " " + rec;
        }
    };

    return table;

}

function onlyKeepColumns(rawTable, columnMapping) {
    const headerRow = rawTable[0]; // Assuming the first row is the header
    const newTable = [];

    // Find indexes of the relevant columns
    const dateIndex = findColumnIndex(headerRow, columnMapping.date);
    const sumIndex = findColumnIndex(headerRow, columnMapping.sum);
    const explanationIndex = findColumnIndex(headerRow, columnMapping.explanation);

    // Create new header row
    newTable.push(["date", "sum", "explanation"]);

    // Remap each row
    for (let i = 1; i < rawTable.length; i++) {
        const row = rawTable[i];
        newTable.push([
            row[dateIndex],
            row[sumIndex],
            row[explanationIndex]
        ]);
    }
    console.log(newTable);

    return newTable;
}

function cleanTable(table) {


    table = cleanCreditPayments(table, bank);
    table = improveExplanation(table);
    table = onlyKeepColumns(table, finalColumnMapping);

    return table;
}

function cleanParens(row) {

    let cleanedRow = [];
    row.forEach(function (element) {
        let cleanedElem = element.replace(qRegex, '');
        cleanedRow.push(cleanedElem);
    })
    return cleanedRow;
}

function toTable(text) {
    if (!text) {
        return;
    }

    let lines = text.split(NEWLINE);
    let rows = [];

    lines.forEach(function (line) {
        let row = line.split(DELIMITER);

        rows.push(cleanParens(row));
    })

    return rows;
}

function parseCSV(file) {
    if (!file || !FileReader) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        let table = toTable(e.target.result);
        table = cleanTable(table);
        renderTable(table);
    };

    reader.readAsText(file);
}

function getFail() {
    if (!inputFile) {
        return;
    }

    inputFile.addEventListener('change', function () {
        if (!!inputFile.files && inputFile.files.length > 0) {
            return parseCSV(inputFile.files[0]);
        }
    });
}

function renderTable(tableData) {
    const table = document.getElementById('data-table');
    table.innerHTML = ''; // Clear any existing content

    tableData.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
}

getFail();
