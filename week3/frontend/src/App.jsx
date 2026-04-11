import { useState } from "react";
import BookArrangementCalculator from "./BookArrangementCalculator";
import TableModal from "./TableModal";

export default function App() {
  const [tableData, setTableData] = useState(null);
  const [showTable, setShowTable] = useState(false);

  return (
    <>
      <BookArrangementCalculator
        onTableReady={(n, r, result, table) => {
          setTableData({ n, r, result, table });
        }}
        onViewTable={() => setShowTable(true)}
      />

      {showTable && tableData && (
        <TableModal
          n={tableData.n}
          r={tableData.r}
          result={tableData.result}
          table={tableData.table}
          onClose={() => setShowTable(false)}
        />
      )}
    </>
  );
}
