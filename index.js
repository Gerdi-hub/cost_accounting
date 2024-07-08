(function () {
    var DELIMITER = ';';
    var NEWLINE = '\n';
    var qRegex = /^"|"$/g;
    var i = document.getElementById('file');
    var tableHtml = document.getElementById('table');
    var keepableIndexes = ['Kuupäev', 'Saaja/maksja nimi',]

    if (!i) {
        return;
    }

    i.addEventListener('change', function () {
        if (!!i.files && i.files.length > 0) {
            parseCSV(i.files[0]);
        }
    });

    function parseCSV(file) {
        if (!file || !FileReader) {
            return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
            let table = toTable(e.target.result);
            onlyKeepColumns(['Dokumendi number', 'Saaja/maksja konto'], table);
        };

        reader.readAsText(file);
    }
    

    function onlyKeepColumns(columnNames, oldTable) {
        let cleanedTable = [];
        let headers = oldTable[0];
        keepableIndexes = [];
        for (let i = 0; i <= headers.length; i++) {
            if (columnNames.includes(headers[i])) {
                keepableIndexes.push(i);
            }
        }
        console.log(keepableIndexes);
        // tegelt paneme meetodi tagastama uut tabelit, hetkel POC
    }


    function toTable(text) {
        if (!text) {
            return;
        }


        let lines = text.split(NEWLINE);
        let rows = [];
        function cleanParens(row) {
            let cleanedRow = [];
            row.forEach(function(element){
                let cleanedElem = element.replace(qRegex, '');
                cleanedRow.push(cleanedElem);
            })
            return cleanedRow;
        }

        lines.forEach(function (line) {
            let row = line.split(DELIMITER);

            rows.push(cleanParens(row));
        })
        rows.forEach(function (row) {
            console.log(row)
        })

        return rows;
    }
})();