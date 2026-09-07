interface DataTableProps {
  headers: string[];
  rows: (string | number)[][];
  label?: string;
}

/** Collapsed table view so every chart's numbers are reachable without hovering. */
export const DataTable = ({ headers, rows, label = 'Show data table' }: DataTableProps) => (
  <details className="mt-4">
    <summary className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-300">{label}</summary>
    <div className="overflow-x-auto">
      <table className="mt-2 w-full border-collapse text-xs">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={header}
                className={`border-b border-neutral-700 py-1 pr-3 font-medium text-neutral-500 ${index === 0 ? 'text-left' : 'text-right'}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={String(row[0])}>
              {row.map((cell, index) => (
                <td
                  key={index}
                  className={`border-b border-neutral-700 py-1 pr-3 text-neutral-300 ${index === 0 ? 'text-left' : 'text-right'}`}
                >
                  {typeof cell === 'number' ? cell.toLocaleString('en-US') : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
);
