// Advantages.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Advantages from './Advantages';

// Простейший тест - проверяет, что компонент рендерится
test('renders Advantages component', () => {
  render(<Advantages />);
  
  // Проверяем, что заголовок отображается
  const titleElement = screen.getByText(/Наши преимущества/i);
  expect(titleElement).toBeInTheDocument();
});

// Проверяет, что все преимущества отображаются
test('displays all advantages', () => {
  render(<Advantages />);
  
  // Проверяем заголовки всех преимуществ
  expect(screen.getByText('Свежие цветы')).toBeInTheDocument();
  expect(screen.getByText('Быстрая доставка')).toBeInTheDocument();
  expect(screen.getByText('Индивидуальный подход')).toBeInTheDocument();
  expect(screen.getByText('Гарантия качества')).toBeInTheDocument();
  
  // Проверяем описания
  expect(screen.getByText(/Ежедневные поставки/i)).toBeInTheDocument();
  expect(screen.getByText(/Доставка за 2 часа/i)).toBeInTheDocument();
  expect(screen.getByText(/Создаём уникальные букеты/i)).toBeInTheDocument();
  expect(screen.getByText(/Фотографируем букет/i)).toBeInTheDocument();
});

// Проверяет, что номера преимуществ отображаются правильно
test('displays correct numbers for advantages', () => {
  render(<Advantages />);
  
  expect(screen.getByText('01')).toBeInTheDocument();
  expect(screen.getByText('02')).toBeInTheDocument();
  expect(screen.getByText('03')).toBeInTheDocument();
  expect(screen.getByText('04')).toBeInTheDocument();
});

// Проверяет, что подзаголовок отображается
test('displays subtitle', () => {
  render(<Advantages />);
  
  const subtitle = screen.getByText(/Всё, что важно для идеального цветочного подарка/i);
  expect(subtitle).toBeInTheDocument();
});