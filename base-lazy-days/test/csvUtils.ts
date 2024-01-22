const sample1 = `
A,B,C,D
1,2,3,4
5,6,7,8
`;

const sample2 = `
A,B,C,C,D,D
A1,B1,C1,D1,E1,F1
1,2,3,4,5,6
7,8,9,10,11,12
`;

interface CSVHeader {
  numberOfColumns: number;
  // In standard CSV files this will be 1. For files liek rule files there can be more
  numberOfHeaderLines: number;
  // If file has more than one header line then teh headerKey will be the combined key of the headers
  headerKeys: string[];
  headerLines: string[];
  hasErrors: boolean;
  errors: string[];
}

interface CSVData {
  rows: number;
  columns: number;
  headers: CSVHeader;
  rawData: string;
  lines: string[];
  dataLines: string[];
  records: CSVRecord[][];
  hasErrors: boolean;
  errors: string[];
}

interface CSVRecord {
  key: string;
  columnKey: string;
  row: number;
  column: number;
  value: string | number;
  formattedValue: string;
  error: string;
}

function getCleanLines(csvStr: string): string[] {
  return csvStr
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// Read csv file
function readHeaders(
  numberOfHeaderLines: number,
  csvStr: string,
  newLine = "\n",
  delimeter = ","
): CSVHeader {
  let hasErrors = false;
  let errors: string[] = [];
  let numberOfColumns: number = 0;
  const headerKeys: string[] = [];
  const headerArray: string[][] = [];

  // Split csvStr into lines and get first lines upto numberOfHeaderLines
  const lines = getCleanLines(csvStr);

  // Validate number of header lines
  if (lines.length < numberOfHeaderLines) {
    hasErrors = true;
    errors.push(
      `Expected at least ${numberOfHeaderLines} header lines. Received ${lines.length}`
    );
    return {
      numberOfColumns,
      numberOfHeaderLines,
      headerKeys,
      headerLines: [],
      hasErrors,
      errors,
    };
  }

  // Get header lines
  const headerLines = lines.slice(0, numberOfHeaderLines);

  // Iterate through each header line and split into string arrays
  headerLines.forEach((header) => {
    const splitLine = header.split(delimeter);
    headerArray.push(splitLine);
  });

  // Get number of columns from first header
  numberOfColumns = headerArray[0].length;

  // Validate all otehr header rows have same number of columns
  for (let i = 1; i < numberOfHeaderLines; i++) {
    if (headerArray[i].length !== numberOfColumns) {
      hasErrors = true;
      errors.push(
        `Header line ${i + 1} has ${
          headerArray[i].length
        } columns but header line 1 has ${numberOfColumns} columns`
      );
    }
  }
  if (hasErrors) {
    return {
      numberOfColumns,
      numberOfHeaderLines,
      headerKeys,
      headerLines,
      hasErrors,
      errors,
    };
  }

  // Get header keys
  for (let i = 0; i < numberOfColumns; i++) {
    let headerKeyParts: string[] = [];
    for (let j = 0; j < numberOfHeaderLines; j++) {
      headerKeyParts.push(headerArray[j][i]);
    }

    const headerKey = headerKeyParts.join("-");
    headerKeys[i] = headerKey;
  }

  const resp = {
    numberOfColumns,
    numberOfHeaderLines,
    headerKeys,
    headerLines,
    hasErrors,
    errors,
  };

  console.log("Extracted headers", resp);

  return resp;
}

function readCsvFile(
  numberOfHeaderLines: number,
  csvStr: string,
  newLine = "\n",
  delimeter = ","
): CSVData {
  let rows = 0;
  let columns = 0;
  let rawData = csvStr;
  let dataLines: string[] = [];
  let fileErrors: string[] = [];
  const records: CSVRecord[][] = [];

  // Split csvStr into lines
  const lines = getCleanLines(csvStr);

  // Get header
  const header: CSVHeader = readHeaders(numberOfHeaderLines, csvStr);
  fileErrors.push(...header.errors);

  if (!header.hasErrors) {
    // Get number of rows
    const rows = lines.length - header.numberOfHeaderLines;
    const columns = header.numberOfColumns;
    dataLines = lines.slice(header.numberOfHeaderLines);

    // Iterate over each line and get records
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const rowRecords: CSVRecord[] = [];

      //  Each col in the line
      for (let j = 0; j < columns; j++) {
        let rowHasError = false;
        let errors: string[] = [];

        // Get each token of the line
        const tokens = line.split(delimeter);

        if (tokens.length !== columns) {
          rowHasError = true;

          const errorMessage = `Row ${
            i + numberOfHeaderLines
          } has expected ${columns} tokens but received ${tokens.length}`;
          errors.push(errorMessage);
          fileErrors.push(errorMessage);
        }

        const record: CSVRecord = {
          key: i + numberOfHeaderLines + "_" + header.headerKeys[j],
          columnKey: header.headerKeys[j],
          row: i + numberOfHeaderLines,
          column: j,
          value: tokens[j],
          formattedValue: tokens[j],
          error: rowHasError ? errors.join(", ") : "",
        };

        rowRecords.push(record);
      }

      // Add parsed row records to records
      records.push(rowRecords);
    }
  }

  const resp: CSVData = {
    rows,
    columns,
    headers: header,
    rawData: csvStr,
    lines,
    records,
    dataLines,
    hasErrors: fileErrors.length > 0,
    errors: fileErrors,
  };

  console.log(JSON.stringify(resp, null, 2));
  return resp;
}

// readHeaders(2, sample2);

readCsvFile(1, sample1);

// readCsvFile(2, sample2);
