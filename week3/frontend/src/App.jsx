import { useState } from "react";
import BookArrangementCalculator from "./BookArrangementCalculator";
import TableModal from "./TableModal";

export default function App() {
  const [tableData, setTableData] = useState(null);
  const [showTable, setShowTable] = useState(false);

  return (
    <>
      {/* Friend's original component — now receives onTableReady so it can send us the table data */}
      <BookArrangementCalculator
        onTableReady={(n, r, result, table) => {
          setTableData({ n, r, result, table });
        }}
        onViewTable={() => setShowTable(true)}
      />

      {/* Your DP table modal */}
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
