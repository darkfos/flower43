import { memo } from "react";

import styles from "./Table.module.css";

export const Table = memo(({ headers, body }) => {
    return (
        <table className={styles['table-panel']} >
            <thead>
                <tr>
                    { headers.map((header, headerId) => (
                        <th key={headerId}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                { body.map((row, rowId) => (
                    <tr key={rowId}>
                        { row.map((field, fieldId) => (
                            <td key={fieldId}>{field}</td>
                        ))}
                    </tr>
                ) )}
            </tbody>
        </table>
    )
})