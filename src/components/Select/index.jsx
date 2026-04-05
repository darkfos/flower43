import styles from "./Select.module.css";

export const Select = ({ items, value, onChangeValue }) => {
    return (
        <select defaultValue={value} className={styles.select} onChange={e => onChangeValue(e.target.value)}>
            { items.map((item, itemId) => (
              <option key={itemId} value={item.value}>{item.label}</option>
            ) )}
        </select>
    )
}