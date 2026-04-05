import styles from "./Badge.module.css";

const badgeBg = {
    'Весна': '#A8E6CF',
    'Осень': '#FFD93D', 
    'Зима': '#A3CCFF',
    'Лето': '#FF9999',
    'Мультисезонный': '#D4A5A5',
    
    'Романтик': '#F8BBD9',
    'Элегантный': '#C0C0C0',
    'Минималистичный': '#E0E0E0',
    'Зимний': '#87CEEB',
    'Осенний': '#FF8C42',
    'Весенний': '#98FB98',
    'Летний': '#FFE4B5',

    'bouquet': '#FFB6C1',      
    'plant': '#90EE90',       
    'custom_bouquet': '#DDA0DD',
    'composition': '#F0E68C'
}

export const Badge = ({ text, type }) => {
    return (
        <span style={{ backgroundColor: badgeBg[type] ?? '#F0F0F0'}} className={styles.badge}>{text}</span>
    )
}