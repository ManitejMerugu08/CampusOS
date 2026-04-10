import React from 'react';
import './CustomTable.css';

const CustomTable = ({ headers, columns, data, renderRow, emptyMessage, onRowClick }) => {
    // Support for the original API (headers + renderRow) AND the new API (columns array of objects)
    const tableHeaders = columns ? columns.map(c => c.header) : headers;

    return (
        <div className="table-container card p-0 shadow-[var(--shadow-md)] overflow-hidden">
            <div className="table-wrapper">
                <table className="custom-table w-full">
                    <thead>
                        <tr>
                            {tableHeaders?.map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? (
                            columns ? (
                                data.map((row, rowIndex) => (
                                    <tr key={rowIndex} onClick={() => onRowClick && onRowClick(row)} className={onRowClick ? "cursor-pointer hover:bg-surface-hover" : ""}>
                                        {columns.map((col, colIndex) => (
                                            <td key={colIndex}>{row[col.key]}</td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                data.map((row, index) => renderRow(row, index))
                            )
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders?.length || 1} className="empty-state">
                                    {emptyMessage || "No data available"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomTable;
