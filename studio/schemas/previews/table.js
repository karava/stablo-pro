import React from "react";

const TablePreview = ({ value }) => {
  const [head, ...rows] = value.table.rows;
  // console.log(head);
  if (!value) {
    return <p>Table: Add Values</p>;
  }
  return (
    <table>
      {head.cells.filter(Boolean).length > 0 && (
        <thead>
          <tr>
            {head.cells.map(cell => (
              <th style={{ textAlign: "left" }} key={cell}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {row.cells.map((cell, index) => {
              return <td key={cell}>{cell}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TablePreview;
