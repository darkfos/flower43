import { memo, useState, useEffect } from "react";

import styles from "./TablePagination.module.css";

export const TablePagination = memo(({ total, handleChange }) => {

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);

    const pages = new Array(Math.round(total / limit)).fill(0);
    
    useEffect(() => {
        setPage(1);
    }, [limit]);

    useEffect(() => {
        handleChange(page, limit)
    }, [page, limit]);

    return (
        <div className={styles["table-pagination"]}>
            {pages.slice(page - 1, page + 3).map((p, pId) => (
                <div className={styles["table-pagination__page"]} key={pId} onClick={() => setPage(pId + 1)}>{pId + 1}</div>
            ) )}
            <div className={styles["table-pagination__limit"]}>
                <select defaultValue={limit} onChange={e => setLimit(+e.target.value)}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={75}>75</option>
                    <option value={100}>100</option>
                </select>
            </div>
            { pages.length > 1 && !pages.slice(page - 1, page + 3).includes(pages.at(-1)) && (
                <div className={styles["table-pagination__page"]} onClick={() => setPage(pages.length)}>{pages.length}</div>
            ) }
        </div>
    );
})