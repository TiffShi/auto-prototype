import React from 'react';
import { ImageOff } from 'lucide-react';
import styles from './MenuItemCard.module.css';

export default function MenuItemCard({ item }) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(item.price);

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className={styles.image}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={styles.imageFallback}
          style={{ display: item.image_url ? 'none' : 'flex' }}
        >
          <ImageOff size={28} />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{item.name}</h3>
          <span className={styles.price}>{formattedPrice}</span>
        </div>
        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}
      </div>
    </div>
  );
}